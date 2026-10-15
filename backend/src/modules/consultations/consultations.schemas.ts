import { z } from 'zod';

export const createConsultationSchema = z.object({
  petId: z.string().min(1, 'El ID de la mascota es requerido'),
  notes: z.string().min(1, 'El motivo de consulta es requerido').max(1000),
  symptoms: z.array(z.string()).optional(),
  duration: z
    .enum(['LESS_THAN_2_HOURS', 'HOURS_2_TO_12', 'DAYS_1_TO_2', 'MORE_THAN_2_DAYS'])
    .optional(),
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

export const createMessageSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacio').max(2000),
  clientMsgId: z.string().min(1, 'clientMsgId es requerido'),
  attachmentUrl: z
    .string()
    .max(500, 'La ruta del adjunto no puede exceder 500 caracteres')
    .refine(
      (val) => {
        const trimmed = val.trim();
        if (!trimmed) return false;
        const lower = trimmed.toLowerCase();
        if (
          lower.startsWith('javascript:') ||
          lower.startsWith('data:') ||
          lower.startsWith('vbscript:') ||
          lower.includes('<') ||
          lower.includes('>')
        ) {
          return false;
        }

        // a) URL absoluta con protocolo http:// o https://
        try {
          const parsed = new URL(trimmed);
          if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return true;
          }
        } catch {
          // No es URL absoluta con protocolo, continuar
        }

        // b) Ruta relativa interna /api/media/:id
        if (/^\/api\/media\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
          return true;
        }

        // c) Identificador seguro de MediaFile (UUID o alfanumérico [a-zA-Z0-9_-]{1,128})
        if (/^[a-zA-Z0-9_-]{1,128}$/.test(trimmed)) {
          return true;
        }

        return false;
      },
      {
        message:
          'attachmentUrl debe ser una URL http(s):// válida, una ruta /api/media/... o un ID de archivo seguro',
      }
    )
    .optional()
    .nullable(),
});

export type CreateConsultationDTO = z.infer<typeof createConsultationSchema>;
export type CompleteConsultationDTO = z.infer<typeof completeConsultationSchema>;
export type CancelConsultationDTO = z.infer<typeof cancelConsultationSchema>;
export type ReviewConsultationDTO = z.infer<typeof reviewConsultationSchema>;
export type CreateMessageDTO = z.infer<typeof createMessageSchema>;

