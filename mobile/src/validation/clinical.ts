import { z } from 'zod';

/** Espejo de backend prescriptions.schemas.ts + complete/cancel para uso en pantallas vet/tutor. */
export const prescriptionCreateSchema = z.object({
  medication: z.string().min(2, 'El medicamento es requerido').max(100),
  dosage: z.string().min(1, 'La dosis es requerida').max(100),
  frequency: z.string().min(1, 'La frecuencia es requerida').max(100),
  durationDays: z
    .number()
    .int('La duración debe ser un número entero de días')
    .positive('La duración debe ser mayor a 0')
    .max(365, 'La duración máxima es 365 días'),
  indications: z.string().min(5, 'Las indicaciones deben tener al menos 5 caracteres').max(1000),
});

export const completeConsultationSchema = z.object({
  diagnosisNotes: z.string().min(2, 'La evolución/diagnóstico es requerida').max(2000),
});

export const cancelConsultationSchema = z.object({
  reason: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type PrescriptionCreateInput = z.infer<typeof prescriptionCreateSchema>;
export type CompleteConsultationInput = z.infer<typeof completeConsultationSchema>;
export type CancelConsultationInput = z.infer<typeof cancelConsultationSchema>;
