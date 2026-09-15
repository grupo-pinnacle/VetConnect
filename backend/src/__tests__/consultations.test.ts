import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { ConsultationsService } from '../modules/consultations/consultations.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    pet: {
      findFirst: jest.fn(),
    },
    consultation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaPet = prisma.pet as jest.Mocked<typeof prisma.pet>;
const mockPrismaConsultation = prisma.consultation as jest.Mocked<typeof prisma.consultation>;
const mockPrismaReview = prisma.review as jest.Mocked<typeof prisma.review>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Consultations Module (/api/consultations)', () => {
  const mockClient = {
    id: 'client-uuid-1',
    email: 'client@vetconnect.com',
    password: 'password',
    firstName: 'Lucia',
    lastName: 'Fernandez',
    phone: null,
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
    ...mockClient,
    id: 'vet-uuid-1',
    email: 'vet@vetconnect.com',
    role: 'VET' as const,
    vetStatus: 'APPROVED' as const,
    licenseNumber: 'MP-8921',
  };

  const clientToken = jwt.sign(
    { userId: mockClient.id, role: mockClient.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/consultations', () => {
    it('should create consultation in ACTIVE status when an approved VET is online', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockClient);
      mockPrismaPet.findFirst.mockResolvedValue({
        id: 'pet-uuid-1',
        ownerId: mockClient.id,
        name: 'Rex',
        species: 'Canine',
        breed: 'Golden Retriever',
        weightKg: 28,
        sex: 'Male',
        microchip: null,
        allergies: null,
        chronicConditions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      mockPrismaConsultation.findFirst.mockResolvedValue(null); // No active consultation
      mockPrismaUser.findFirst.mockResolvedValue(mockVet); // Available vet

      mockPrismaConsultation.create.mockResolvedValue({
        id: 'consultation-uuid-1',
        clientId: mockClient.id,
        vetId: mockVet.id,
        petId: 'pet-uuid-1',
        status: 'ACTIVE',
        notes: 'Fiebre y vomitos',
        diagnosisNotes: null,
        startedAt: new Date(),
        endedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        pet: {} as any,
        client: mockClient as any,
        vet: mockVet as any,
      });

      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          petId: 'pet-uuid-1',
          notes: 'Fiebre y vomitos',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
      expect(res.body.data.vetId).toBe(mockVet.id);
    });
  });

  describe('FSM Timeouts (15-min Triage TTL & 3-min Vet Disconnect Grace Window)', () => {
    const consultationsService = new ConsultationsService();

    it('checkTriageTimeout: should transition WAITING consultation created >15 min ago to CANCELLED', async () => {
      const sixteenMinutesAgo = new Date(Date.now() - 16 * 60 * 1000);
      mockPrismaConsultation.findUnique.mockResolvedValue({
        id: 'consultation-uuid-waiting',
        clientId: mockClient.id,
        vetId: null,
        petId: 'pet-uuid-1',
        status: 'WAITING',
        notes: 'Dolor de oido',
        diagnosisNotes: null,
        startedAt: null,
        endedAt: null,
        createdAt: sixteenMinutesAgo,
        updatedAt: sixteenMinutesAgo,
        deletedAt: null,
      });

      mockPrismaConsultation.update.mockResolvedValue({
        id: 'consultation-uuid-waiting',
        clientId: mockClient.id,
        vetId: null,
        petId: 'pet-uuid-1',
        status: 'CANCELLED',
        notes: 'Dolor de oido [CANCELLED_TIMEOUT_NO_VET_AVAILABLE]',
        diagnosisNotes: null,
        startedAt: null,
        endedAt: new Date(),
        createdAt: sixteenMinutesAgo,
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await consultationsService.checkTriageTimeout('consultation-uuid-waiting');

      expect(result?.status).toBe('CANCELLED');
      expect(mockPrismaConsultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-uuid-waiting' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          notes: expect.stringContaining('CANCELLED_TIMEOUT_NO_VET_AVAILABLE'),
        }),
      });
    });

    it('checkVetDisconnectTimeout: should transition ACTIVE consultation to CANCELLED if vet disconnected >3 min', async () => {
      const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);
      mockPrismaConsultation.findUnique.mockResolvedValue({
        id: 'consultation-uuid-active',
        clientId: mockClient.id,
        vetId: mockVet.id,
        petId: 'pet-uuid-1',
        status: 'ACTIVE',
        notes: 'Consulta activa',
        diagnosisNotes: null,
        startedAt: new Date(),
        endedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      mockPrismaConsultation.update.mockResolvedValue({
        id: 'consultation-uuid-active',
        clientId: mockClient.id,
        vetId: mockVet.id,
        petId: 'pet-uuid-1',
        status: 'CANCELLED',
        notes: 'Consulta activa [VET_DISCONNECTED_TIMEOUT]',
        diagnosisNotes: null,
        startedAt: new Date(),
        endedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await consultationsService.checkVetDisconnectTimeout(
        'consultation-uuid-active',
        fourMinutesAgo
      );

      expect(result?.status).toBe('CANCELLED');
      expect(mockPrismaConsultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-uuid-active' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          notes: expect.stringContaining('VET_DISCONNECTED_TIMEOUT'),
        }),
      });
    });
  });

  describe('POST /api/consultations/:id/review', () => {
    it('should submit a 5-star review and recalculate VET ratingAvg/ratingCount', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockClient);
      mockPrismaConsultation.findUnique.mockResolvedValue({
        id: 'consultation-uuid-1',
        clientId: mockClient.id,
        vetId: mockVet.id,
        petId: 'pet-uuid-1',
        status: 'COMPLETED',
        notes: 'Fiebre',
        diagnosisNotes: 'Infeccion leve',
        startedAt: new Date(),
        endedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        review: null,
      } as any);

      mockPrismaReview.create.mockResolvedValue({
        id: 'review-uuid-1',
        consultationId: 'consultation-uuid-1',
        clientId: mockClient.id,
        vetId: mockVet.id,
        rating: 5,
        comment: 'Excelente atencion',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrismaReview.findMany.mockResolvedValue([
        {
          id: 'review-uuid-1',
          consultationId: 'consultation-uuid-1',
          clientId: mockClient.id,
          vetId: mockVet.id,
          rating: 5,
          comment: 'Excelente atencion',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app)
        .post('/api/consultations/consultation-uuid-1/review')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          rating: 5,
          comment: 'Excelente atencion',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });

    it('should REJECT reviews with rating outside 1-5 range (e.g. 6 stars)', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockClient);

      const res = await request(app)
        .post('/api/consultations/consultation-uuid-1/review')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          rating: 6, // Invalid rating
          comment: 'Invalido',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
