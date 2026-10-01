import {
  fetchConsultation,
  fetchMine,
  assignConsultation,
  completeConsultation,
  cancelConsultation,
  postReview,
  ringConsultationCall,
} from '../services/consultations.service';
import api from '../lib/api';

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
  getApiErrorMessage: jest.fn((err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback
  ),
}));

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
};

describe('Mobile consultations.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchConsultation', () => {
    it('fetches consultation by id including prescriptions and review', async () => {
      const mockData = {
        id: 'cons-1',
        clientId: 'cli-1',
        vetId: 'vet-1',
        petId: 'pet-1',
        status: 'COMPLETED',
        prescriptions: [
          {
            id: 'rx-1',
            consultationId: 'cons-1',
            vetId: 'vet-1',
            medication: 'Amoxicilina 500mg',
            dosage: '1 comprimido',
            frequency: 'cada 12 hs',
            durationDays: 7,
            indications: 'Con alimento',
            createdAt: '2026-09-30T00:00:00.000Z',
          },
        ],
        review: {
          id: 'rev-1',
          consultationId: 'cons-1',
          clientId: 'cli-1',
          vetId: 'vet-1',
          rating: 5,
          comment: 'Excelente atención',
          createdAt: '2026-09-30T00:00:00.000Z',
          updatedAt: '2026-09-30T00:00:00.000Z',
        },
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockData },
      });

      const res = await fetchConsultation('cons-1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/consultations/cons-1');
      expect(res.id).toBe('cons-1');
      expect(res.prescriptions).toHaveLength(1);
      expect(res.review?.rating).toBe(5);
    });

    it('throws error when consultation is not found', async () => {
      mockedApi.get.mockResolvedValue({
        data: { success: false, error: { message: 'Consulta no encontrada' } },
      });
      await expect(fetchConsultation('cons-missing')).rejects.toThrow('Consulta no encontrada');
    });
  });

  describe('postReview', () => {
    it('submits valid review', async () => {
      mockedApi.post.mockResolvedValue({
        data: { success: true },
      });

      await expect(postReview('cons-1', 4, 'Muy buen trato')).resolves.toBeUndefined();
      expect(mockedApi.post).toHaveBeenCalledWith('/api/consultations/cons-1/review', {
        rating: 4,
        comment: 'Muy buen trato',
      });
    });

    it('rejects invalid rating without hitting the network', async () => {
      await expect(postReview('cons-1', 6)).rejects.toThrow();
      expect(mockedApi.post).not.toHaveBeenCalled();
    });
  });

  describe('assignConsultation', () => {
    it('calls PATCH /api/consultations/:id/assign', async () => {
      mockedApi.patch.mockResolvedValue({
        data: { success: true, data: { id: 'cons-1', status: 'ACTIVE' } },
      });

      const res = await assignConsultation('cons-1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/consultations/cons-1/assign', {});
      expect(res.status).toBe('ACTIVE');
    });
  });

  describe('completeConsultation', () => {
    it('validates diagnosisNotes and calls complete endpoint', async () => {
      mockedApi.patch.mockResolvedValue({
        data: { success: true, data: { id: 'cons-1', status: 'COMPLETED' } },
      });

      const res = await completeConsultation('cons-1', 'Paciente estable y recuperado');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/consultations/cons-1/complete', {
        diagnosisNotes: 'Paciente estable y recuperado',
      });
      expect(res.status).toBe('COMPLETED');
    });

    it('rejects empty diagnosisNotes before hitting the network', async () => {
      await expect(completeConsultation('cons-1', 'a')).rejects.toThrow();
      expect(mockedApi.patch).not.toHaveBeenCalled();
    });
  });

  describe('cancelConsultation', () => {
    it('cancels consultation with optional reason', async () => {
      mockedApi.patch.mockResolvedValue({
        data: { success: true, data: { id: 'cons-1', status: 'CANCELLED' } },
      });

      const res = await cancelConsultation('cons-1', 'Imprevisto del tutor');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/consultations/cons-1/cancel', {
        reason: 'Imprevisto del tutor',
      });
      expect(res.status).toBe('CANCELLED');
    });
  });

  describe('ringConsultationCall', () => {
    it('triggers ring call endpoint', async () => {
      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            consultationId: 'cons-1',
            targetUserId: 'vet-1',
            status: 'RINGING',
          },
        },
      });

      const res = await ringConsultationCall('cons-1');
      expect(mockedApi.post).toHaveBeenCalledWith('/api/calls/cons-1/ring');
      expect(res.status).toBe('RINGING');
    });
  });
});
