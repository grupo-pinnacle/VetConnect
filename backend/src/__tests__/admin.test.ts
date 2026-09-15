import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaAudit = prisma.auditLog as jest.Mocked<typeof prisma.auditLog>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Admin Module (/api/admin)', () => {
  const mockAdmin = {
    id: 'admin-uuid-1',
    email: 'admin@vetconnect.com',
    password: 'password',
    firstName: 'Super',
    lastName: 'Admin',
    phone: null,
    role: 'ADMIN' as const,
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

  const mockClient = {
    ...mockAdmin,
    id: 'client-uuid-1',
    role: 'CLIENT' as const,
  };

  const mockPendingVet = {
    ...mockAdmin,
    id: 'vet-pending-1',
    email: 'vet.pending@vetconnect.com',
    role: 'VET' as const,
    vetStatus: 'PENDING' as const,
    licenseNumber: 'MP-9900',
  };

  const adminToken = jwt.sign(
    { userId: mockAdmin.id, role: mockAdmin.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  const clientToken = jwt.sign(
    { userId: mockClient.id, role: mockClient.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/vets/pending', () => {
    it('should list pending vets for ADMIN users', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockAdmin);
      mockPrismaUser.findMany.mockResolvedValue([mockPendingVet as any]);

      const res = await request(app)
        .get('/api/admin/vets/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].vetStatus).toBe('PENDING');
    });

    it('should REJECT non-admin users with 403 Forbidden', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockClient);

      const res = await request(app)
        .get('/api/admin/vets/pending')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /api/admin/vets/:id/approve', () => {
    it('should approve a pending vet and record an AuditLog entry', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockAdmin);
      mockPrismaUser.findFirst.mockResolvedValue(mockPendingVet as any);

      const approvedVet = { ...mockPendingVet, vetStatus: 'APPROVED' as const };
      mockPrismaUser.update.mockResolvedValue(approvedVet as any);
      mockPrismaAudit.create.mockResolvedValue({} as any);

      const res = await request(app)
        .patch('/api/admin/vets/vet-pending-1/approve')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vetStatus).toBe('APPROVED');
      expect(mockPrismaAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: mockAdmin.id,
          action: 'APPROVE_VET',
          targetId: 'vet-pending-1',
        }),
      });
    });
  });

  describe('PATCH /api/admin/vets/:id/reject', () => {
    it('should reject a pending vet and record an AuditLog entry', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockAdmin);
      mockPrismaUser.findFirst.mockResolvedValue(mockPendingVet as any);

      const rejectedVet = { ...mockPendingVet, vetStatus: 'REJECTED' as const };
      mockPrismaUser.update.mockResolvedValue(rejectedVet as any);
      mockPrismaAudit.create.mockResolvedValue({} as any);

      const res = await request(app)
        .patch('/api/admin/vets/vet-pending-1/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Matricula vencida' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vetStatus).toBe('REJECTED');
      expect(mockPrismaAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: mockAdmin.id,
          action: 'REJECT_VET',
          targetId: 'vet-pending-1',
        }),
      });
    });
  });
});
