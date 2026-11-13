import { z } from 'zod';
import { Role } from '@prisma/client';

const trimmedEmail = z.string().trim().email('Email invalido');
const trimmedResetEmail = z.string().trim().email('Email inválido');

export const registerSchema = z.object({
  email: trimmedEmail,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  role: z.enum([Role.CLIENT, Role.VET]).default(Role.CLIENT),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
});

export const loginSchema = z.object({
  email: trimmedEmail,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: trimmedResetEmail,
});

export const verifyResetCodeSchema = z.object({
  email: trimmedResetEmail,
  code: z.string().trim().min(6, 'El código debe tener 6 dígitos').max(6, 'El código debe tener 6 dígitos'),
});

export const resetPasswordSchema = z.object({
  email: trimmedResetEmail,
  code: z.string().trim().min(6, 'El código debe tener 6 dígitos').max(6, 'El código debe tener 6 dígitos'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeDTO = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
