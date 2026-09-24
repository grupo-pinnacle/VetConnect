import { z } from 'zod';

/**
 * PATCH /users/profile acepta { isOnline, bio, photoUrl } sin validación
 * servidor (deuda D-B06). El cliente impone límites sanos.
 */
export const profileUpdateSchema = z.object({
  isOnline: z.boolean().optional(),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional().nullable(),
  photoUrl: z.string().url('URL de foto inválida').max(500).optional().nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
