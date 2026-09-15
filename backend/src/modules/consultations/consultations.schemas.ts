import { z } from 'zod';

export const createConsultationSchema = z.object({
  petId: z.string().min(1, 'El ID de la mascota es requerido'),
  notes: z.string().min(1, 'El motivo de consulta es requerido').max(1000),
});

export const assignConsultationSchema = z.object({
  vetId: z.string().optional(),
});

export const completeConsultationSchema = z.object({
  diagnosisNotes: z.string().min(2, 'La evolucion/diagnostico es requerida').max(2000),
});

export const cancelConsultationSchema = z.object({
  reason: z.string().optional(),
});

export const reviewConsultationSchema = z.object({
  rating: z
    .number()
    .int('La calificacion debe ser un numero entero')
    .min(1, 'La calificacion minima es 1 estrella')
    .max(5, 'La calificacion maxima es 5 estrellas'),
  comment: z.string().max(1000).optional().nullable(),
});

export type CreateConsultationDTO = z.infer<typeof createConsultationSchema>;
export type CompleteConsultationDTO = z.infer<typeof completeConsultationSchema>;
export type CancelConsultationDTO = z.infer<typeof cancelConsultationSchema>;
export type ReviewConsultationDTO = z.infer<typeof reviewConsultationSchema>;
