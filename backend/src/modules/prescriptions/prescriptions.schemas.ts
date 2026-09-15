import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  medication: z.string().min(2, 'El medicamento es requerido').max(100),
  dosage: z.string().min(1, 'La dosis es requerida').max(100),
  frequency: z.string().min(1, 'La frecuencia es requerida').max(100),
  durationDays: z
    .number()
    .int('La duracion debe ser un numero entero de dias')
    .positive('La duracion debe ser mayor a 0')
    .max(365, 'La duracion maxima es 365 dias'),
  indications: z.string().min(5, 'Las indicaciones deben tener al menos 5 caracteres').max(1000),
});

export type CreatePrescriptionDTO = z.infer<typeof createPrescriptionSchema>;
