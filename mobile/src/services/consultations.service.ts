import api, { getApiErrorMessage } from '../lib/api';
import { ApiResponse, Consultation } from '../types';
import { reviewSchema } from '../validation/auth';
import {
  completeConsultationSchema,
  cancelConsultationSchema,
} from '../validation/clinical';

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

export async function fetchMine(): Promise<Consultation[]> {
  try {
    const res = await api.get<ApiResponse<Consultation[]>>('/api/consultations/mine');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error cargando consultas');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error cargando consultas'));
  }
}

/** Vet aprobado toma una consulta WAITING (pasa a ACTIVE). */
export async function assignConsultation(consultationId: string): Promise<Consultation> {
  try {
    const res = await api.patch<ApiResponse<Consultation>>(
      `/api/consultations/${consultationId}/assign`,
      {}
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'No se pudo tomar la consulta');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'No se pudo tomar la consulta'));
  }
}

/** Vet asignado cierra con evolución/diagnóstico (min 2 caracteres). */
export async function completeConsultation(
  consultationId: string,
  diagnosisNotes: string
): Promise<Consultation> {
  const parsed = completeConsultationSchema.safeParse({ diagnosisNotes });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Diagnóstico inválido');
  }
  try {
    const res = await api.patch<ApiResponse<Consultation>>(
      `/api/consultations/${consultationId}/complete`,
      parsed.data
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'No se pudo cerrar la consulta');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'No se pudo cerrar la consulta'));
  }
}

/** Cliente/vet asignado cancela (motivo opcional, se anexa a notes). */
export async function cancelConsultation(
  consultationId: string,
  reason?: string
): Promise<Consultation> {
  const parsed = cancelConsultationSchema.safeParse({ reason });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Motivo inválido');
  }
  try {
    const res = await api.patch<ApiResponse<Consultation>>(
      `/api/consultations/${consultationId}/cancel`,
      reason?.trim() ? parsed.data : {}
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'No se pudo cancelar la consulta');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'No se pudo cancelar la consulta'));
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
