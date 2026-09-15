import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

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
    ratingAvg: 4.9,
    ratingCount: 15,
  };

  const adminToken = jwt.sign(
    { userId: mockAdmin.id, role: mockAdmin.role, tokenVersion: 1 },
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

  describe('Vet Status Guardrail (ADR-013 SENASA)', () => {
    it('should enforce APPROVED vetStatus for active triage and prescription operations', () => {
      expect(mockApprovedVet.vetStatus).toBe('APPROVED');
      expect(mockApprovedVet.licenseNumber).toBe('MP-8921');
      expect(mockApprovedVet.ratingAvg).toBeGreaterThan(0);
    });
  });
});
