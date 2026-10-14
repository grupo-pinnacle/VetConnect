import {
  consultationConcurrencyService,
  PostCommitEvictionParams,
} from '../modules/consultations/consultationConcurrency.service';
import prisma from '../lib/prisma';
import { callsService } from '../modules/calls/calls.service';
import { io } from '../realtime/socket.server';

// Mock dependencies
jest.mock('../lib/prisma', () => {
  const auditLogs: any[] = [];
  return {
    __esModule: true,
    default: {
      $transaction: jest.fn(async (cb: (tx: any) => Promise<any>) => cb(prisma)),
      $executeRawUnsafe: jest.fn().mockResolvedValue(1),
      $queryRawUnsafe: jest.fn(),
      consultation: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      consultationAuditLog: {
        create: jest.fn(async ({ data }: any) => {
          auditLogs.push(data);
          return { id: BigInt(auditLogs.length), ...data, createdAt: new Date() };
        }),
      },
      _auditLogs: auditLogs,
    },
  };
});

jest.mock('../modules/calls/calls.service', () => ({
  callsService: {
    removeParticipant: jest.fn().mockResolvedValue(undefined),
    deleteLiveKitRoom: jest.fn().mockResolvedValue(undefined),
    generateLiveKitToken: jest.fn(),
  },
}));

jest.mock('../realtime/socket.server', () => {
  const emittedEvents: { room: string; event: string; data: any }[] = [];
  const mockSockets = [{ disconnect: jest.fn() }];

  const mockTo = jest.fn((room: string) => ({
    emit: jest.fn((event: string, data: any) => {
      emittedEvents.push({ room, event, data });
    }),
  }));

  const mockIn = jest.fn((_room: string) => ({
    fetchSockets: jest.fn().mockResolvedValue(mockSockets),
  }));

  return {
    io: {
      to: mockTo,
      in: mockIn,
      _emittedEvents: emittedEvents,
      _mockSockets: mockSockets,
    },
    evictRevokedSessionAndResume: jest.fn(),
  };
});

describe('Resilient Concurrency & Session Handoff for Telemedicine Triage', () => {
  const mockPrisma = prisma as any;
  const mockCallsService = callsService as jest.Mocked<typeof callsService>;
  const mockIo = io as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma._auditLogs.length = 0;
    mockIo._emittedEvents.length = 0;
  });

  describe('1. Veterinarian Claim Transaction (claimConsultationByVet)', () => {
    it('should transition to CLAIM_PENDING_SYNC when tutor is OFFLINE', async () => {
      const initialConsultation = {
        id: 'cons-claim-1',
        clientId: 'tutor-100',
        vetId: null,
        status: 'TRIAGE_CRITICAL_QUEUED',
        transportStatus: 'OFFLINE',
        activeDeviceId: 'device-A',
        stateVersion: 1,
        claimedAt: null,
      };

      mockPrisma.consultation.findUnique.mockResolvedValue({ ...initialConsultation });
      mockPrisma.consultation.update.mockImplementation(async ({ data }: any) => ({
        ...initialConsultation,
        ...data,
      }));

      const result = await consultationConcurrencyService.claimConsultationByVet(
        'cons-claim-1',
        'vet-999'
      );

      expect(result.status).toBe('CLAIM_PENDING_SYNC');
      expect(result.stateVersion).toBe(2);
      expect(result.tutorId).toBe('tutor-100');
      expect(result.transportStatus).toBe('OFFLINE');

      expect(mockPrisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'cons-claim-1' },
        data: expect.objectContaining({
          vetId: 'vet-999',
          status: 'CLAIM_PENDING_SYNC',
          stateVersion: 2,
        }),
      });

      // Verify audit log creation
      expect(mockPrisma.consultationAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          consultationId: 'cons-claim-1',
          eventType: 'VET_CLAIM',
          previousState: 'TRIAGE_CRITICAL_QUEUED',
          newState: 'CLAIM_PENDING_SYNC',
          actorId: 'vet-999',
          deviceId: 'device-A',
        }),
      });
    });

    it('should transition directly to LIVEKIT_CONNECTING when tutor is ONLINE', async () => {
      const initialConsultation = {
        id: 'cons-claim-2',
        clientId: 'tutor-101',
        vetId: null,
        status: 'TRIAGE_CRITICAL_QUEUED',
        transportStatus: 'ONLINE',
        activeDeviceId: 'device-B',
        stateVersion: 2,
        claimedAt: null,
      };

      mockPrisma.consultation.findUnique.mockResolvedValue({ ...initialConsultation });
      mockPrisma.consultation.update.mockImplementation(async ({ data }: any) => ({
        ...initialConsultation,
        ...data,
      }));

      const result = await consultationConcurrencyService.claimConsultationByVet(
        'cons-claim-2',
        'vet-999'
      );

      expect(result.status).toBe('LIVEKIT_CONNECTING');
      expect(result.stateVersion).toBe(3);
      expect(result.transportStatus).toBe('ONLINE');

      expect(mockPrisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'cons-claim-2' },
        data: expect.objectContaining({
          vetId: 'vet-999',
          status: 'LIVEKIT_CONNECTING',
          stateVersion: 3,
        }),
      });
    });

    it('should throw 404 CONSULTATION_NOT_FOUND if consultation does not exist', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue(null);

      await expect(
        consultationConcurrencyService.claimConsultationByVet('non-existent', 'vet-999')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONSULTATION_NOT_FOUND',
      });
    });

    it('should throw 409 CONSULTATION_ALREADY_CLAIMED if already claimed by another vet', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({
        id: 'cons-claimed',
        clientId: 'tutor-100',
        vetId: 'vet-original',
        status: 'CLAIM_PENDING_SYNC',
        transportStatus: 'ONLINE',
        activeDeviceId: 'device-A',
        stateVersion: 2,
      });

      await expect(
        consultationConcurrencyService.claimConsultationByVet('cons-claimed', 'vet-rival')
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONSULTATION_ALREADY_CLAIMED',
      });
    });

    it('should throw 400 INVALID_STATE_FOR_CLAIM if consultation is COMPLETED or CANCELLED', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({
        id: 'cons-finished',
        clientId: 'tutor-100',
        vetId: null,
        status: 'COMPLETED',
        transportStatus: 'OFFLINE',
        activeDeviceId: null,
        stateVersion: 5,
      });

      await expect(
        consultationConcurrencyService.claimConsultationByVet('cons-finished', 'vet-999')
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_STATE_FOR_CLAIM',
      });
    });
  });

  describe('2. Tutor Session Migration Transaction (migrateTutorSession)', () => {
    it('should return hasActiveConsultation=false when tutor has no active consultations', async () => {
      mockPrisma.consultation.findFirst.mockResolvedValue(null);

      const result = await consultationConcurrencyService.migrateTutorSession('tutor-idle', 'device-new');
      expect(result.hasActiveConsultation).toBe(false);
    });

    it('should migrate session to TRIAGE_CRITICAL_QUEUED if no vet is assigned yet', async () => {
      const activeConsultation = {
        id: 'cons-active-1',
        clientId: 'tutor-200',
        vetId: null,
        status: 'TRIAGE_CRITICAL_QUEUED',
        transportStatus: 'OFFLINE',
        activeDeviceId: 'device-old',
        stateVersion: 1,
      };

      mockPrisma.consultation.findFirst.mockResolvedValue({ ...activeConsultation });
      mockPrisma.consultation.update.mockImplementation(async ({ data }: any) => ({
        ...activeConsultation,
        ...data,
      }));

      const result = await consultationConcurrencyService.migrateTutorSession(
        'tutor-200',
        'device-new'
      );

      expect(result.hasActiveConsultation).toBe(true);
      expect(result.consultationId).toBe('cons-active-1');
      expect(result.vetId).toBeNull();
      expect(result.revokedDeviceId).toBe('device-old');
      expect(result.status).toBe('TRIAGE_CRITICAL_QUEUED');
      expect(result.stateVersion).toBe(2);

      expect(mockPrisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'cons-active-1' },
        data: expect.objectContaining({
          activeDeviceId: 'device-new',
          transportStatus: 'ONLINE',
          status: 'TRIAGE_CRITICAL_QUEUED',
          stateVersion: 2,
        }),
      });

      expect(mockPrisma.consultationAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          consultationId: 'cons-active-1',
          eventType: 'DEVICE_HANDOFF',
          actorId: 'tutor-200',
          deviceId: 'device-new',
          previousState: 'TRIAGE_CRITICAL_QUEUED',
          newState: 'TRIAGE_CRITICAL_QUEUED',
        }),
      });
    });

    it('should migrate session to LIVEKIT_CONNECTING if vet is already assigned', async () => {
      const activeConsultation = {
        id: 'cons-active-2',
        clientId: 'tutor-200',
        vetId: 'vet-assigned',
        status: 'CLAIM_PENDING_SYNC',
        transportStatus: 'OFFLINE',
        activeDeviceId: 'device-old',
        stateVersion: 2,
      };

      mockPrisma.consultation.findFirst.mockResolvedValue({ ...activeConsultation });
      mockPrisma.consultation.update.mockImplementation(async ({ data }: any) => ({
        ...activeConsultation,
        ...data,
      }));

      const result = await consultationConcurrencyService.migrateTutorSession(
        'tutor-200',
        'device-new'
      );

      expect(result.hasActiveConsultation).toBe(true);
      expect(result.vetId).toBe('vet-assigned');
      expect(result.status).toBe('LIVEKIT_CONNECTING');
      expect(result.stateVersion).toBe(3);
      expect(result.revokedDeviceId).toBe('device-old');
    });
  });

  describe('3. Commutative Convergence (T_claim -> T_handoff vs. T_handoff -> T_claim)', () => {
    it('should converge to the exact same state regardless of request arrival order', async () => {
      // Sequence 1: Claim arrives first, then Tutor Handoff arrives
      const dbStateSeq1 = {
        id: 'cons-seq-1',
        clientId: 'tutor-comm',
        vetId: null as string | null,
        status: 'TRIAGE_CRITICAL_QUEUED',
        transportStatus: 'OFFLINE',
        activeDeviceId: 'device-A' as string | null,
        stateVersion: 1,
        claimedAt: null as Date | null,
      };

      // Set up mocks for Sequence 1
      mockPrisma.consultation.findUnique.mockImplementation(async () => ({ ...dbStateSeq1 }));
      mockPrisma.consultation.findFirst.mockImplementation(async () => ({ ...dbStateSeq1 }));
      mockPrisma.consultation.update.mockImplementation(async ({ data }: any) => {
        Object.assign(dbStateSeq1, data);
        return { ...dbStateSeq1 };
      });

      // 1a. Vet claim executes
      const claimResult1 = await consultationConcurrencyService.claimConsultationByVet(
        'cons-seq-1',
        'vet-comm'
      );
      expect(claimResult1.status).toBe('CLAIM_PENDING_SYNC');
      expect(claimResult1.stateVersion).toBe(2);

      // 1b. Tutor migration executes
      const handoffResult1 = await consultationConcurrencyService.migrateTutorSession(
        'tutor-comm',
        'device-B'
      );
      expect(handoffResult1.status).toBe('LIVEKIT_CONNECTING');
      expect(handoffResult1.stateVersion).toBe(3);

      const finalStateSeq1 = {
        status: dbStateSeq1.status,
        transportStatus: dbStateSeq1.transportStatus,
        activeDeviceId: dbStateSeq1.activeDeviceId,
        vetId: dbStateSeq1.vetId,
        stateVersion: dbStateSeq1.stateVersion,
      };

      // Sequence 2: Tutor Handoff arrives first, then Claim arrives
      const dbStateSeq2 = {
        id: 'cons-seq-2',
        clientId: 'tutor-comm',
        vetId: null as string | null,
        status: 'TRIAGE_CRITICAL_QUEUED',
        transportStatus: 'OFFLINE',
        activeDeviceId: 'device-A' as string | null,
        stateVersion: 1,
        claimedAt: null as Date | null,
      };

      mockPrisma.consultation.findUnique.mockImplementation(async () => ({ ...dbStateSeq2 }));
      mockPrisma.consultation.findFirst.mockImplementation(async () => ({ ...dbStateSeq2 }));
      mockPrisma.consultation.update.mockImplementation(async ({ data }: any) => {
        Object.assign(dbStateSeq2, data);
        return { ...dbStateSeq2 };
      });

      // 2a. Tutor migration executes first
      const handoffResult2 = await consultationConcurrencyService.migrateTutorSession(
        'tutor-comm',
        'device-B'
      );
      expect(handoffResult2.status).toBe('TRIAGE_CRITICAL_QUEUED');
      expect(handoffResult2.stateVersion).toBe(2);

      // 2b. Vet claim executes second
      const claimResult2 = await consultationConcurrencyService.claimConsultationByVet(
        'cons-seq-2',
        'vet-comm'
      );
      expect(claimResult2.status).toBe('LIVEKIT_CONNECTING');
      expect(claimResult2.stateVersion).toBe(3);

      const finalStateSeq2 = {
        status: dbStateSeq2.status,
        transportStatus: dbStateSeq2.transportStatus,
        activeDeviceId: dbStateSeq2.activeDeviceId,
        vetId: dbStateSeq2.vetId,
        stateVersion: dbStateSeq2.stateVersion,
      };

      // Mathematical Commutativity Check: Both final states are identical
      expect(finalStateSeq1).toEqual(finalStateSeq2);
      expect(finalStateSeq1).toEqual({
        status: 'LIVEKIT_CONNECTING',
        transportStatus: 'ONLINE',
        activeDeviceId: 'device-B',
        vetId: 'vet-comm',
        stateVersion: 3,
      });
    });
  });

  describe('4. Guarded Socket Disconnect (markSocketDisconnect)', () => {
    it('should transition transportStatus to GRACE_DISCONNECTED when disconnecting device is active', async () => {
      const activeConsultation = {
        id: 'cons-disc-1',
        clientId: 'tutor-300',
        activeDeviceId: 'device-active',
        status: 'LIVEKIT_CONNECTING',
        transportStatus: 'ONLINE',
        stateVersion: 3,
      };

      mockPrisma.consultation.findFirst.mockResolvedValue({ ...activeConsultation });
      mockPrisma.consultation.update.mockImplementation(async ({ data }: any) => ({
        ...activeConsultation,
        ...data,
      }));

      const result = await consultationConcurrencyService.markSocketDisconnect(
        'tutor-300',
        'device-active'
      );

      expect(result.updated).toBe(true);
      expect(result.rowCount).toBe(1);
      expect(result.stateVersion).toBe(4);

      expect(mockPrisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'cons-disc-1' },
        data: {
          transportStatus: 'GRACE_DISCONNECTED',
          stateVersion: 4,
        },
      });

      expect(mockPrisma.consultationAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          consultationId: 'cons-disc-1',
          eventType: 'SOCKET_DISCONNECT',
          previousState: 'ONLINE',
          newState: 'GRACE_DISCONNECTED',
          actorId: 'tutor-300',
          deviceId: 'device-active',
        }),
      });
    });

    it('should NOT update transportStatus when an obsolete device disconnects after handoff', async () => {
      // Consultation currently active on device-B; delayed disconnect arrives for obsolete device-A
      mockPrisma.consultation.findFirst.mockResolvedValue(null); // No match for tutor + device-A

      const result = await consultationConcurrencyService.markSocketDisconnect(
        'tutor-300',
        'device-A-obsolete'
      );

      expect(result.updated).toBe(false);
      expect(result.rowCount).toBe(0);

      // Verify no database update was executed
      expect(mockPrisma.consultation.update).not.toHaveBeenCalled();
      expect(mockPrisma.consultationAuditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('5. Out-of-Band Post-Commit Eviction & Session Resume Helper', () => {
    it('should emit session:invalidated, evict LiveKit participant, and emit consultation:critical_resume', async () => {
      const params: PostCommitEvictionParams = {
        consultationId: 'cons-evict-1',
        tutorId: 'tutor-400',
        revokedDeviceId: 'device-old',
        newDeviceId: 'device-new',
        status: 'LIVEKIT_CONNECTING',
        stateVersion: 3,
        vetId: 'vet-777',
      };

      await consultationConcurrencyService.handlePostCommitEvictionAndResume(params);

      // a. Check session:invalidated sent to revoked device
      expect(mockIo._emittedEvents).toContainEqual({
        room: 'device:device-old',
        event: 'session:invalidated',
        data: {
          reason: 'SESSION_MIGRATED_NEW_DEVICE',
          consultationId: 'cons-evict-1',
        },
      });

      // b. Check LiveKit participant removal
      expect(mockCallsService.removeParticipant).toHaveBeenCalledWith(
        'cons-evict-1',
        'tutor_tutor-400:device-old'
      );

      // c. Check vet reconnect notification
      expect(mockIo._emittedEvents).toContainEqual({
        room: 'user:vet-777',
        event: 'consultation:tutor_reconnecting',
        data: {
          consultationId: 'cons-evict-1',
          message: 'Tutor reconnecting from new device...',
        },
      });

      // d. Check consultation:critical_resume sent to new device
      expect(mockIo._emittedEvents).toContainEqual({
        room: 'device:device-new',
        event: 'consultation:critical_resume',
        data: {
          consultationId: 'cons-evict-1',
          status: 'LIVEKIT_CONNECTING',
          stateVersion: 3,
          vetId: 'vet-777',
        },
      });
    });
  });
});
