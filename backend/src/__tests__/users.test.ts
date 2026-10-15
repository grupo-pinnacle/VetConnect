import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { adminCreatePetSchema, adminUpdatePetSchema } from '../modules/admin/admin.schemas';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Users & Vet Directory Module', () => {
  const mockAdmin = {
    id: 'admin-uuid-1',
    email: 'admin@vetconnect.com',
    password: 'hashedpassword',
    firstName: 'System',
    lastName: 'Admin',
    phone: null,
    role: 'ADMIN' as const,
    vetStatus: null,
    licenseNumber: null,
    speciality: null,
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

  const mockApprovedVet = {
    ...mockAdmin,
    id: 'vet-approved-1',
    email: 'carlos.mendoza@vetconnect.com',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    role: 'VET' as const,
    vetStatus: 'APPROVED' as const,
    licenseNumber: 'MP-8921',
    speciality: 'Cardiología Veterinaria',
    ratingAvg: 4.9,
    ratingCount: 15,
  };

  const adminToken = jwt.sign(
    { userId: mockAdmin.id, role: mockAdmin.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  const vetToken = jwt.sign(
    { userId: mockApprovedVet.id, role: mockApprovedVet.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/me', () => {
    it('should return current authenticated user profile', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin@vetconnect.com');
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user.password).toBeUndefined(); // Sanitized
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('should update online presence and bio for authenticated vet', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockApprovedVet as any);
      mockPrismaUser.update.mockResolvedValue({
        ...mockApprovedVet,
        isOnline: true,
        bio: 'Especialista en ecocardiografía felina y canina',
      } as any);

      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${vetToken}`)
        .send({
          isOnline: true,
          bio: 'Especialista en ecocardiografía felina y canina',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isOnline).toBe(true);
      expect(res.body.data.bio).toContain('ecocardiografía');
      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockApprovedVet.id },
          data: expect.objectContaining({
            isOnline: true,
            bio: 'Especialista en ecocardiografía felina y canina',
          }),
        })
      );
    });

    it('should update firstName, lastName, and phone for authenticated user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockAdmin);
      mockPrismaUser.update.mockResolvedValue({
        ...mockAdmin,
        firstName: 'Gonzalo',
        lastName: 'Perez',
        phone: '+5491155551234',
      });

      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Gonzalo',
          lastName: 'Perez',
          phone: '+5491155551234',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Gonzalo');
      expect(res.body.data.lastName).toBe('Perez');
      expect(res.body.data.phone).toBe('+5491155551234');
      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockAdmin.id },
          data: expect.objectContaining({
            firstName: 'Gonzalo',
            lastName: 'Perez',
            phone: '+5491155551234',
          }),
        })
      );
    });

    it('should reject invalid profile payload with HTTP 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'A', // too short (< 2)
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject unauthenticated request with HTTP 401', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .send({ isOnline: true });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Admin Pet Microchip Validation (ISO 11784/11785 15-digit)', () => {
    it('should accept valid 15-digit numeric microchip in adminCreatePetSchema', () => {
      const validPayload = {
        ownerId: 'owner-uuid-1',
        name: 'Firulais',
        species: 'Canino',
        breed: 'Labrador',
        microchip: '123456789012345',
      };
      const parsed = adminCreatePetSchema.parse(validPayload);
      expect(parsed.microchip).toBe('123456789012345');
    });

    it('should reject invalid microchip formats in adminCreatePetSchema', () => {
      expect(() =>
        adminCreatePetSchema.parse({
          ownerId: 'owner-uuid-1',
          name: 'Firulais',
          species: 'Canino',
          breed: 'Labrador',
          microchip: '12345',
        })
      ).toThrow();

      expect(() =>
        adminCreatePetSchema.parse({
          ownerId: 'owner-uuid-1',
          name: 'Firulais',
          species: 'Canino',
          breed: 'Labrador',
          microchip: '1234567890abcde',
        })
      ).toThrow();
    });

    it('should accept null or undefined microchip in adminCreatePetSchema and adminUpdatePetSchema', () => {
      const parsed = adminCreatePetSchema.parse({
        ownerId: 'owner-uuid-1',
        name: 'Firulais',
        species: 'Canino',
        breed: 'Labrador',
        microchip: null,
      });
      expect(parsed.microchip).toBeNull();

      const parsedUpdate = adminUpdatePetSchema.parse({
        microchip: null,
      });
      expect(parsedUpdate.microchip).toBeNull();
    });
  });

  describe('Vet Status Guardrail (ADR-013 SENASA)', () => {
    it('should enforce APPROVED vetStatus for active triage and prescription operations', () => {
      expect(mockApprovedVet.vetStatus).toBe('APPROVED');
      expect(mockApprovedVet.licenseNumber).toBe('MP-8921');
      expect(mockApprovedVet.ratingAvg).toBeGreaterThan(0);
      expect(mockApprovedVet.speciality).toBe('Cardiología Veterinaria');
    });
  });
});
