jest.mock('react-native', () => ({
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  SECURE_STORE_REFRESH_KEY: 'vetconnect_refresh_token',
  getApiErrorMessage: (err: any, fallback: string) => {
    return err?.response?.data?.error?.message || err?.message || fallback;
  },
}));

import { callSignalingService, useCallStore } from '../services/callSignaling.service';
import { ringConsultationCall } from '../services/consultations.service';
import api from '../lib/api';
import socketManager from '../lib/socket';

const mockedApi = api as jest.Mocked<typeof api>;

describe('Call Signaling & Incoming Call Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCallStore.getState().clearIncomingCall();
  });

  describe('ringConsultationCall', () => {
    it('calls POST /api/calls/:id/ring and returns data on success', async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            consultationId: 'consult-123',
            targetUserId: 'user-456',
            status: 'RINGING',
          },
        },
      } as any);

      const result = await ringConsultationCall('consult-123');

      expect(mockedApi.post).toHaveBeenCalledWith('/api/calls/consult-123/ring');
      expect(result).toEqual({
        consultationId: 'consult-123',
        targetUserId: 'user-456',
        status: 'RINGING',
      });
    });

    it('throws formatted error if the API responds with success: false', async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: {
          success: false,
          error: {
            code: 'NOT_CONSULTATION_PARTICIPANT',
            message: 'No eres participante de esta consulta',
            timestamp: new Date().toISOString(),
          },
        },
      } as any);

      await expect(ringConsultationCall('consult-123')).rejects.toThrow(
        'No eres participante de esta consulta'
      );
    });
  });

  describe('callSignalingService store & socket events', () => {
    it('sets incoming call state when handleIncomingCall is triggered', () => {
      const payload = {
        consultationId: 'consult-789',
        callerName: 'Dr. Martin Paws',
        roomName: 'consult-789',
      };

      callSignalingService.handleIncomingCall(payload);

      const state = useCallStore.getState();
      expect(state.incomingCall).toEqual(payload);
    });

    it('emits call:answered and clears state when answerCall is invoked', () => {
      const mockEmit = jest.fn();
      jest.spyOn(socketManager, 'getSocket').mockReturnValue({
        emit: mockEmit,
      } as any);

      useCallStore.getState().setIncomingCall({
        consultationId: 'consult-999',
        callerName: 'Dra. López',
        roomName: 'consult-999',
      });

      const answeredId = callSignalingService.answerCall('consult-999');

      expect(mockEmit).toHaveBeenCalledWith('call:answered', {
        consultationId: 'consult-999',
      });
      expect(answeredId).toBe('consult-999');
      expect(useCallStore.getState().incomingCall).toBeNull();
    });

    it('emits call:rejected and clears state when rejectCall is invoked', () => {
      const mockEmit = jest.fn();
      jest.spyOn(socketManager, 'getSocket').mockReturnValue({
        emit: mockEmit,
      } as any);

      useCallStore.getState().setIncomingCall({
        consultationId: 'consult-111',
        callerName: 'Carlos Tutor',
        roomName: 'consult-111',
      });

      callSignalingService.rejectCall('consult-111', 'Ocupado');

      expect(mockEmit).toHaveBeenCalledWith('call:rejected', {
        consultationId: 'consult-111',
        reason: 'Ocupado',
      });
      expect(useCallStore.getState().incomingCall).toBeNull();
    });
  });
});
