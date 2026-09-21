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
    consultation: {
      findUnique: jest.fn(),
    },
    prescription: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaConsultation = prisma.consultation as jest.Mocked<typeof prisma.consultation>;
const mockPrismaPrescription = prisma.prescription as jest.Mocked<typeof prisma.prescription>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Prescriptions Module (/api/consultations/:id/prescriptions)', () => {
  const mockApprovedVet = {
    id: 'vet-uuid-1',
    email: 'vet@vetconnect.com',
    password: 'password',
    firstName: 'Dr. Carlos',
    lastName: 'Mendoza',
    phone: null,
    role: 'VET' as const,
    vetStatus: 'APPROVED' as const,
    licenseNumber: 'MP-8921',
    bio: null,
    photoUrl: null,
    tokenVersion: 1,
    ratingAvg: 4.9,
    ratingCount: 10,
    isOnline: true,
    lastSeen: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPendingVet = {
    ...mockApprovedVet,
    id: 'vet-uuid-pending',
    vetStatus: 'PENDING' as const,
  };

  const approvedVetToken = jwt.sign(
    { userId: mockApprovedVet.id, role: mockApprovedVet.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  const pendingVetToken = jwt.sign(
    { userId: mockPendingVet.id, role: mockPendingVet.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/consultations/:id/prescriptions', () => {
    it('should allow APPROVED assigned VET to issue a digital prescription with QR code', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockApprovedVet);
      mockPrismaConsultation.findUnique.mockResolvedValue({
        id: 'consultation-uuid-1',
        clientId: 'client-uuid-1',
        vetId: mockApprovedVet.id,
        petId: 'pet-uuid-1',
        status: 'ACTIVE',
        notes: 'Sintomas leves',
        diagnosisNotes: null,
        startedAt: new Date(),
        endedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      mockPrismaPrescription.create.mockResolvedValue({
        id: 'prescription-uuid-1',
        consultationId: 'consultation-uuid-1',
        vetId: mockApprovedVet.id,
        medication: 'Amoxicilina 250mg',
        dosage: '1 comprimido cada 12 hs',
        frequency: 'Cada 12 hs',
        durationDays: 7,
        indications: 'Administrar junto con alimentos',
        createdAt: new Date(),
        updatedAt: new Date(),
        vet: mockApprovedVet as any,
        consultation: {} as any,
      });

      const res = await request(app)
        .post('/api/consultations/consultation-uuid-1/prescriptions')
        .set('Authorization', `Bearer ${approvedVetToken}`)
        .send({
          medication: 'Amoxicilina 250mg',
          dosage: '1 comprimido cada 12 hs',
          frequency: 'Cada 12 hs',
          durationDays: 7,
          indications: 'Administrar junto con alimentos',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.medication).toBe('Amoxicilina 250mg');
      expect(res.body.data.qrCodeDataUrl).toContain('data:image/png;base64');
      expect(res.body.data.verifyUrl).toBe('https://vetconnect.app/verify/prescription/prescription-uuid-1');
    });

    it('should REJECT prescription issuance from PENDING VET with 403 Forbidden', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockPendingVet);

      const res = await request(app)
        .post('/api/consultations/consultation-uuid-1/prescriptions')
        .set('Authorization', `Bearer ${pendingVetToken}`)
        .send({
          medication: 'Amoxicilina 250mg',
          dosage: '1 comprimido',
          frequency: 'Cada 12 hs',
          durationDays: 7,
          indications: 'Con comida',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('VET_NOT_APPROVED');
    });
  });
});
