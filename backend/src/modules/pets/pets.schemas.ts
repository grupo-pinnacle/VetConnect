import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().min(1, 'El nombre de la mascota es requerido').max(100),
  species: z.string().min(1, 'La especie es requerida').max(50),
  breed: z.string().min(1, 'La raza es requerida').max(50),
  weightKg: z.number().positive('El peso debe ser positivo').optional().nullable(),
  sex: z.string().optional().nullable(),
  microchip: z
    .string()
    .regex(/^\d{15}$/, 'El microchip debe poseer exactamente 15 digitos numericos ISO')
    .optional()
    .nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
});

export const updatePetSchema = createPetSchema.partial();

export type CreatePetDTO = z.infer<typeof createPetSchema>;
export type UpdatePetDTO = z.infer<typeof updatePetSchema>;
