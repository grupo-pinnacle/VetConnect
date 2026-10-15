import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .optional(),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede superar 100 caracteres')
    .optional(),
  phone: z
    .string()
    .max(40, 'El teléfono no puede superar 40 caracteres')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  bio: z
    .string()
    .max(500, 'La biografía no puede superar 500 caracteres')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  photoUrl: z
    .string()
    .url('URL de foto inválida')
    .max(500, 'La URL no puede superar 500 caracteres')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  isOnline: z.boolean().optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
