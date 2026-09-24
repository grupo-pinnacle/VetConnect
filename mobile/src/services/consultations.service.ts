import api, { getApiErrorMessage } from '../lib/api';
import { ApiResponse, Consultation } from '../types';
import { reviewSchema } from '../validation/auth';

export async function postReview(
  consultationId: string,
  rating: number,
  comment?: string
): Promise<void> {
  const parsed = reviewSchema.safeParse({ rating, comment });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Calificación inválida');
  }
  try {
    const res = await api.post<ApiResponse<unknown>>(
      `/api/consultations/${consultationId}/review`,
      parsed.data
    );
    if (!res.data.success) {
      throw new Error(res.data.error?.message || 'Error al calificar');
    }
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error al calificar'));
  }
}

export async function fetchConsultation(consultationId: string): Promise<Consultation> {
  try {
    const res = await api.get<ApiResponse<Consultation>>(`/api/consultations/${consultationId}`);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Consulta no encontrada');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error al cargar consulta'));
  }
}
