import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    pet: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    consultation: {
      findFirst: jest.fn(),
    },
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaPet = prisma.pet as jest.Mocked<typeof prisma.pet>;
const mockPrismaConsultation = prisma.consultation as jest.Mocked<typeof prisma.consultation>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Pets Module (/api/pets)', () => {
  const mockOwner = {
    id: 'owner-uuid-1',
    email: 'owner@vetconnect.com',
    password: 'hashedpassword',
    firstName: 'Maria',
    lastName: 'Lopez',
    phone: '+541155551234',
    role: 'CLIENT' as const,
    vetStatus: null,
    licenseNumber: null,
    bio: null,
    photoUrl: null,
    tokenVersion: 1,
    ratingAvg: 0,
    ratingCount: 0,
    isOnline: true,
    lastSeen: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockVet = {
    ...mockOwner,
    id: 'vet-uuid-1',
    email: 'vet@vetconnect.com',
    role: 'VET' as const,
    vetStatus: 'APPROVED' as const,
  };

  const ownerToken = jwt.sign(
    { userId: mockOwner.id, role: mockOwner.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  const vetToken = jwt.sign(
    { userId: mockVet.id, role: mockVet.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/pets', () => {
    it('should create a pet with valid 15-digit ISO microchip', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockOwner);
      mockPrismaPet.findFirst.mockResolvedValue(null);
      mockPrismaPet.create.mockResolvedValue({
        id: 'pet-uuid-1',
        ownerId: mockOwner.id,
        name: 'Firulais',
        species: 'Canine',
        breed: 'Labrador',
        weightKg: 20,
        sex: 'Male',
        microchip: '123456789012345',
        allergies: null,
        chronicConditions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Firulais',
          species: 'Canine',
          breed: 'Labrador',
          microchip: '123456789012345',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.microchip).toBe('123456789012345');
    });

    it('should reject pet creation when microchip does NOT have 15 digits', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockOwner);

      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Firulais',
          species: 'Canine',
          breed: 'Labrador',
          microchip: '12345', // Invalid microchip format
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/pets/:id & PII Redaction', () => {
    it('should REDACT owner email and phone when viewed by a VET without prior consultation', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockVet);
      mockPrismaPet.findFirst.mockResolvedValue({
        id: 'pet-uuid-1',
        ownerId: mockOwner.id,
        name: 'Firulais',
        species: 'Canine',
        breed: 'Labrador',
        weightKg: 20,
        sex: 'Male',
        microchip: null,
        allergies: null,
        chronicConditions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        owner: mockOwner,
      } as any);

      // No consultation found between this vet and pet
      mockPrismaConsultation.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/pets/pet-uuid-1')
        .set('Authorization', `Bearer ${vetToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.owner.email).toBe('[REDACTED]');
      expect(res.body.data.owner.phone).toBe('[REDACTED]');
      expect(res.body.data.owner.firstName).toBe('Maria');
    });
  });

  describe('DELETE /api/pets/:id', () => {
    it('should perform soft-delete by setting deletedAt date', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockOwner);
      mockPrismaPet.findFirst.mockResolvedValue({
        id: 'pet-uuid-1',
        ownerId: mockOwner.id,
        name: 'Firulais',
        species: 'Canine',
        breed: 'Labrador',
        weightKg: 20,
        sex: 'Male',
        microchip: null,
        allergies: null,
        chronicConditions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      mockPrismaPet.update.mockResolvedValue({
        id: 'pet-uuid-1',
        ownerId: mockOwner.id,
        name: 'Firulais',
        species: 'Canine',
        breed: 'Labrador',
        weightKg: 20,
        sex: 'Male',
        microchip: null,
        allergies: null,
        chronicConditions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      });

      const res = await request(app)
        .delete('/api/pets/pet-uuid-1')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrismaPet.update).toHaveBeenCalledWith({
        where: { id: 'pet-uuid-1' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });
  });
});
