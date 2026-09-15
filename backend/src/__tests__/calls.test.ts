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
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaConsultation = prisma.consultation as jest.Mocked<typeof prisma.consultation>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Calls Module (/api/calls)', () => {
  const mockClient = {
    id: 'client-uuid-call-1',
    email: 'client.call@vetconnect.com',
    password: 'password',
    firstName: 'Sofia',
    lastName: 'Rios',
    phone: '+541155559999',
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

  const clientToken = jwt.sign(
    { userId: mockClient.id, role: mockClient.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/calls/:consultationId/token (LiveKit SFU)', () => {
    it('should generate LiveKit JWT token WITHOUT any PII (no email, no phone)', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockClient);
      mockPrismaConsultation.findUnique.mockResolvedValue({
        id: 'consultation-call-1',
        clientId: mockClient.id,
        vetId: 'vet-uuid-1',
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

      const res = await request(app)
        .post('/api/calls/consultation-call-1/token')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();

      // Decode LiveKit JWT token to inspect claims
      const decoded: any = jwt.decode(res.body.data.token);

      expect(decoded.sub).toBe(mockClient.id); // identity = user.id
      expect(decoded.name).toBe(mockClient.firstName); // name = user.firstName
      expect(decoded.email).toBeUndefined(); // ZERO PII
      expect(decoded.phone).toBeUndefined(); // ZERO PII
      expect(decoded.video.room).toBe('consultation-call-1');
    });

    it('should REJECT token generation if consultation is not ACTIVE', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockClient);
      mockPrismaConsultation.findUnique.mockResolvedValue({
        id: 'consultation-call-waiting',
        clientId: mockClient.id,
        vetId: null,
        petId: 'pet-uuid-1',
        status: 'WAITING',
        notes: 'En espera',
        diagnosisNotes: null,
        startedAt: null,
        endedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/calls/consultation-call-waiting/token')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CONSULTATION_STATE');
    });
  });

  describe('POST /api/calls/:consultationId/ring', () => {
    it('should trigger ring signal for ACTIVE consultation participant', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockClient);
      mockPrismaConsultation.findUnique.mockResolvedValue({
        id: 'consultation-call-1',
        clientId: mockClient.id,
        vetId: 'vet-uuid-1',
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

      const res = await request(app)
        .post('/api/calls/consultation-call-1/ring')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RINGING');
      expect(res.body.data.targetUserId).toBe('vet-uuid-1');
    });
  });
});
