import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

// Mock prisma methods for unit tests
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe('Auth Module (/api/auth)', () => {
  const dummyPasswordHash = bcrypt.hashSync('Password123!', 10);

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test.client@vetconnect.com',
    password: dummyPasswordHash,
    firstName: 'Laura',
    lastName: 'Perez',
    phone: null,
    role: 'CLIENT' as const,
    vetStatus: null,
    licenseNumber: null,
    bio: null,
    photoUrl: null,
    tokenVersion: 1,
    ratingAvg: 0,
    ratingCount: 0,
    isOnline: false,
    lastSeen: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a CLIENT successfully', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/auth/register').send({
        email: 'test.client@vetconnect.com',
        password: 'Password123!',
        firstName: 'Laura',
        lastName: 'Perez',
        role: 'CLIENT',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test.client@vetconnect.com');
      expect(res.body.data.user.role).toBe('CLIENT');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeUndefined(); // Web SPA by default
    });

    it('should register a VET with vetStatus PENDING', async () => {
      const mockVetUser = {
        ...mockUser,
        id: 'vet-uuid-1',
        email: 'test.vet@vetconnect.com',
        role: 'VET' as const,
        vetStatus: 'PENDING' as const,
        licenseNumber: 'MP-1234',
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(mockVetUser);

      const res = await request(app).post('/api/auth/register').send({
        email: 'test.vet@vetconnect.com',
        password: 'Password123!',
        firstName: 'Dr. Hugo',
        lastName: 'Sanchez',
        role: 'VET',
        licenseNumber: 'MP-1234',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('VET');
      expect(res.body.data.user.vetStatus).toBe('PENDING');
    });
  });

  describe('POST /api/auth/login (Dual Web / Mobile Strategy)', () => {
    it('Web SPA: should NOT return refreshToken in JSON body', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test.client@vetconnect.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('Mobile App: SHOULD return refreshToken in JSON body when header X-Client-Platform: mobile is set', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Client-Platform', 'mobile')
        .send({
          email: 'test.client@vetconnect.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });
  });

  describe('POST /api/auth/logout & tokenVersion Revocation', () => {
    it('should increment tokenVersion on logout', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaUser.update.mockResolvedValue({ ...mockUser, tokenVersion: 2 });

      // Obtain a valid token first via login
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'test.client@vetconnect.com',
        password: 'Password123!',
      });

      const token = loginRes.body.data.accessToken;

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          tokenVersion: { increment: 1 },
          isOnline: false,
        },
      });
    });
  });
});
