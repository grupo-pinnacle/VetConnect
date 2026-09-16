import { createServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import app from '../app';
import prisma from '../lib/prisma';
import { initializeSocketServer } from '../realtime/socket.server';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    consultation: {
      findUnique: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockPrismaConsultation = prisma.consultation as jest.Mocked<typeof prisma.consultation>;
const mockPrismaMessage = prisma.message as jest.Mocked<typeof prisma.message>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long';

describe('Realtime & Chat Socket Gateway (TASK-3.1 & TASK-3.2)', () => {
  let httpServer: any;
  let port: number;
  let clientSocket: ClientSocket;

  const mockClient = {
    id: 'user-realtime-1',
    email: 'realtime@vetconnect.com',
    password: 'password',
    firstName: 'Realtime',
    lastName: 'Tester',
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

  const validToken = jwt.sign(
    { userId: mockClient.id, role: mockClient.role, tokenVersion: 1 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  beforeAll((done) => {
    httpServer = createServer(app);
    initializeSocketServer(httpServer);
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    httpServer.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should accept connection with valid JWT token', (done) => {
    mockPrismaUser.findUnique.mockResolvedValue(mockClient);
    mockPrismaUser.update.mockResolvedValue(mockClient);

    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${validToken}` },
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      clientSocket.disconnect();
      done();
    });
  });

  it('should reject connection without valid token', (done) => {
    const invalidSocket = Client(`http://localhost:${port}`, {
      auth: { token: 'Bearer invalid-token' },
      transports: ['websocket'],
      reconnection: false,
    });

    invalidSocket.on('connect_error', (err: any) => {
      expect(err.message).toBe('Invalid or expired authentication token');
      invalidSocket.disconnect();
      done();
    });
  });

  it('should emit canonical message:new event and support clientMsgId idempotency', (done) => {
    mockPrismaUser.findUnique.mockResolvedValue(mockClient);
    mockPrismaUser.update.mockResolvedValue(mockClient);

    mockPrismaConsultation.findUnique.mockResolvedValue({
      id: 'consultation-chat-1',
      clientId: mockClient.id,
      vetId: 'vet-uuid-1',
      petId: 'pet-uuid-1',
      status: 'ACTIVE',
      notes: 'Notes',
      diagnosisNotes: null,
      startedAt: new Date(),
      endedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const mockCreatedMessage = {
      id: 'msg-uuid-1',
      consultationId: 'consultation-chat-1',
      senderId: mockClient.id,
      content: 'Hola Dr.',
      attachmentUrl: null,
      clientMsgId: 'client-msg-unique-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      sender: {
        id: mockClient.id,
        firstName: mockClient.firstName,
        lastName: mockClient.lastName,
        role: mockClient.role,
      },
    };

    mockPrismaMessage.create.mockResolvedValue(mockCreatedMessage);

    const socket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${validToken}` },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join:consultation', { consultationId: 'consultation-chat-1' });

      socket.on('message:new', (message: any) => {
        expect(message.content).toBe('Hola Dr.');
        expect(message.clientMsgId).toBe('client-msg-unique-123');
        socket.disconnect();
        done();
      });

      socket.emit(
        'message:send',
        {
          consultationId: 'consultation-chat-1',
          content: 'Hola Dr.',
          clientMsgId: 'client-msg-unique-123',
        },
        (response: any) => {
          expect(response.success).toBe(true);
        }
      );
    });
  });

  it('should return existing message on duplicate clientMsgId (Prisma P2002 error)', (done) => {
    mockPrismaUser.findUnique.mockResolvedValue(mockClient);
    mockPrismaUser.update.mockResolvedValue(mockClient);

    mockPrismaConsultation.findUnique.mockResolvedValue({
      id: 'consultation-chat-1',
      clientId: mockClient.id,
      vetId: 'vet-uuid-1',
      petId: 'pet-uuid-1',
      status: 'ACTIVE',
      notes: 'Notes',
      diagnosisNotes: null,
      startedAt: new Date(),
      endedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const existingMsg = {
      id: 'msg-dup-1',
      consultationId: 'consultation-chat-1',
      senderId: mockClient.id,
      content: 'Duplicated message',
      attachmentUrl: null,
      clientMsgId: 'client-msg-dup-999',
      createdAt: new Date(),
      updatedAt: new Date(),
      sender: {
        id: mockClient.id,
        firstName: mockClient.firstName,
        lastName: mockClient.lastName,
        role: mockClient.role,
      },
    };

    const p2002Error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (clientMsgId)',
      { code: 'P2002', clientVersion: '6.0.0' }
    );
    mockPrismaMessage.create.mockRejectedValue(p2002Error);
    mockPrismaMessage.findUnique.mockResolvedValue(existingMsg as any);

    const socket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${validToken}` },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit(
        'message:send',
        {
          consultationId: 'consultation-chat-1',
          content: 'Duplicated message',
          clientMsgId: 'client-msg-dup-999',
        },
        (response: any) => {
          expect(response.success).toBe(true);
          expect(response.data.id).toBe('msg-dup-1');
          socket.disconnect();
          done();
        }
      );
    });
  });
});
