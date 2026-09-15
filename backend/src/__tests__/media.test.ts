import request from 'supertest';
import fs from 'fs';
import path from 'path';
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
    dailyUploadCounter: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    mediaFile: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaCounter = prisma.dailyUploadCounter as jest.Mocked<typeof prisma.dailyUploadCounter>;
const mockPrismaMediaFile = prisma.mediaFile as jest.Mocked<typeof prisma.mediaFile>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Media Module (/api/media)', () => {
  const mockOwner = {
    id: 'owner-uuid-media',
    email: 'media.owner@vetconnect.com',
    password: 'password',
    firstName: 'Gabriel',
    lastName: 'Torres',
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

  const mockStranger = {
    ...mockOwner,
    id: 'stranger-uuid',
    email: 'stranger@vetconnect.com',
  };

  const ownerToken = jwt.sign(
    { userId: mockOwner.id, role: mockOwner.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  const strangerToken = jwt.sign(
    { userId: mockStranger.id, role: mockStranger.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  const tmpTestDir = path.resolve(__dirname, 'tmp_media_test');

  beforeAll(() => {
    if (!fs.existsSync(tmpTestDir)) {
      fs.mkdirSync(tmpTestDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpTestDir)) {
      fs.rmSync(tmpTestDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/media (Magic Bytes Inspection & Quotas)', () => {
    it('should REJECT spoofed file with fake .jpg extension but invalid magic bytes with 400 Bad Request', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockOwner);

      const fakeExePath = path.join(tmpTestDir, 'fake_exe.jpg');
      // Write executable header "MZ" instead of JPEG "FF D8 FF"
      fs.writeFileSync(fakeExePath, Buffer.from('4D5A90000300000004000000FFFF0000', 'hex'));

      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${ownerToken}`)
        .attach('file', fakeExePath);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('should ACCEPT valid JPEG image file with correct magic bytes (FF D8 FF)', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockOwner);
      mockPrismaCounter.findUnique.mockResolvedValue(null);
      mockPrismaCounter.upsert.mockResolvedValue({} as any);

      const validJpegPath = path.join(tmpTestDir, 'valid_image.jpg');
      // Valid JPEG header
      const jpegBuffer = Buffer.concat([
        Buffer.from('FFD8FF', 'hex'),
        Buffer.alloc(100),
      ]);
      fs.writeFileSync(validJpegPath, jpegBuffer);

      mockPrismaMediaFile.create.mockResolvedValue({
        id: 'media-uuid-1',
        ownerId: mockOwner.id,
        consultationId: null,
        fileName: 'valid_image.jpg',
        fileSize: jpegBuffer.length,
        mimeType: 'image/jpeg',
        localPath: '/app/uploads/valid_image.jpg',
        s3Key: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${ownerToken}`)
        .attach('file', validJpegPath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('media-uuid-1');
    });

    it('should REJECT file upload when daily quota of 50 MB is exceeded with 429 Too Many Requests', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockOwner);

      // Mock daily counter at 51 MB
      mockPrismaCounter.findUnique.mockResolvedValue({
        id: 'counter-1',
        userId: mockOwner.id,
        date: new Date().toISOString().split('T')[0],
        count: 10,
        totalBytes: BigInt(51 * 1024 * 1024),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const validJpegPath = path.join(tmpTestDir, 'valid_image_quota.jpg');
      fs.writeFileSync(validJpegPath, Buffer.concat([Buffer.from('FFD8FF', 'hex'), Buffer.alloc(100)]));

      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${ownerToken}`)
        .attach('file', validJpegPath);

      expect(res.status).toBe(429);
      expect(res.body.error.code).toBe('UPLOAD_QUOTA_EXCEEDED');
    });
  });

  describe('GET /api/media/:id (Access Control)', () => {
    it('should return 401 Unauthorized when no authentication token is provided', async () => {
      const res = await request(app).get('/api/media/media-uuid-1');
      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden when an unauthorized third party requests the file', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockStranger);
      mockPrismaMediaFile.findFirst.mockResolvedValue({
        id: 'media-uuid-1',
        ownerId: mockOwner.id,
        consultationId: null,
        fileName: 'prescription.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        localPath: '/app/uploads/prescription.pdf',
        s3Key: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        consultation: null,
      } as any);

      const res = await request(app)
        .get('/api/media/media-uuid-1')
        .set('Authorization', `Bearer ${strangerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
