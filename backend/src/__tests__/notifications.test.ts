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
    pushToken: {
      upsert: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaPushToken = prisma.pushToken as jest.Mocked<typeof prisma.pushToken>;
const mockPrismaNotification = prisma.notification as jest.Mocked<typeof prisma.notification>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Notifications Module (/api/notifications)', () => {
  const mockUser = {
    id: 'user-notif-1',
    email: 'notif@vetconnect.com',
    password: 'password',
    firstName: 'Nicolas',
    lastName: 'Vega',
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

  const userToken = jwt.sign(
    { userId: mockUser.id, role: mockUser.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/notifications/register-token', () => {
    it('should register or update push token idempotently', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaPushToken.upsert.mockResolvedValue({
        id: 'token-id-1',
        userId: mockUser.id,
        token: 'ExponentPushToken[123]',
        platform: 'android',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/notifications/register-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'ExponentPushToken[123]',
          platform: 'android',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe('ExponentPushToken[123]');
    });
  });

  describe('GET /api/notifications', () => {
    it('should list in-app notifications for authenticated user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaNotification.findMany.mockResolvedValue([
        {
          id: 'notif-1',
          userId: mockUser.id,
          title: 'Llamada Entrante',
          body: 'El Dr. Carlos te esta llamando',
          type: 'CALL_INCOMING',
          data: { consultationId: 'c1' },
          isRead: false,
          readAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaNotification.findFirst.mockResolvedValue({
        id: 'notif-1',
        userId: mockUser.id,
        title: 'Llamada Entrante',
        body: 'El Dr. Carlos te esta llamando',
        type: 'CALL_INCOMING',
        data: { consultationId: 'c1' },
        isRead: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrismaNotification.update.mockResolvedValue({
        id: 'notif-1',
        userId: mockUser.id,
        title: 'Llamada Entrante',
        body: 'El Dr. Carlos te esta llamando',
        type: 'CALL_INCOMING',
        data: { consultationId: 'c1' },
        isRead: true,
        readAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch('/api/notifications/notif-1/read')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
    });
  });
});
