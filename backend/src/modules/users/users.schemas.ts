import { z } from 'zod';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede superar 100 caracteres')
    .optional(),
  phone: z
    .string()
    .trim()
    .max(40, 'El teléfono no puede superar 40 caracteres')
    .refine((val) => val === '' || (PHONE_REGEX.test(val) && val.replace(/\D/g, '').length >= 7 && val.replace(/\D/g, '').length <= 15), {
      message: 'Formato de teléfono inválido (use entre 7 y 15 dígitos, ej. +5491155551234)',
    })
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(500, 'La biografía no puede superar 500 caracteres')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  photoUrl: z
    .string()
    .trim()
    .url('URL de foto inválida')
    .max(500, 'La URL no puede superar 500 caracteres')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  isOnline: z.boolean().optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Ingresá tu contraseña actual')
    .max(128, 'La contraseña actual es demasiado larga'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(128, 'La nueva contraseña no puede superar 128 caracteres'),
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
