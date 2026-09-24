import api, { getApiErrorMessage } from '../lib/api';
import { ApiResponse, Prescription } from '../types';
import { prescriptionCreateSchema, PrescriptionCreateInput } from '../validation/clinical';

export async function createPrescription(
  consultationId: string,
  input: PrescriptionCreateInput
): Promise<Prescription> {
  const parsed = prescriptionCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Datos de receta inválidos');
  }
  try {
    const res = await api.post<ApiResponse<Prescription>>(
      `/api/consultations/${consultationId}/prescriptions`,
      parsed.data
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error emitiendo receta');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error emitiendo receta'));
  }
}
