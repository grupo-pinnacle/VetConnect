import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  role: z.enum([Role.CLIENT, Role.VET]).default(Role.CLIENT),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().min(6, 'El código debe tener 6 dígitos').max(6, 'El código debe tener 6 dígitos'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().min(6, 'El código debe tener 6 dígitos').max(6, 'El código debe tener 6 dígitos'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeDTO = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
