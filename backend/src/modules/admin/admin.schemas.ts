import { z } from 'zod';

export const rejectVetSchema = z.object({
  reason: z.string().min(3, 'La razon de rechazo es requerida').max(500),
});

export const adminCreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional().nullable(),
  role: z.enum(['CLIENT', 'VET', 'ADMIN']).default('CLIENT'),
  vetStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export const adminUpdateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(['CLIENT', 'VET', 'ADMIN']).optional(),
  vetStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export const adminCreatePetSchema = z.object({
  ownerId: z.string().min(1, 'ID de tutor requerido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  species: z.string().min(2, 'La especie es requerida'),
  breed: z.string().min(2, 'La raza es requerida'),
  weightKg: z.number().positive().optional().nullable(),
  sex: z.string().optional().nullable(),
  microchip: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
});

export const adminUpdatePetSchema = z.object({
  ownerId: z.string().optional(),
  name: z.string().min(2).optional(),
  species: z.string().min(2).optional(),
  breed: z.string().min(2).optional(),
  weightKg: z.number().positive().optional().nullable(),
  sex: z.string().optional().nullable(),
  microchip: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
});

export type RejectVetDTO = z.infer<typeof rejectVetSchema>;
export type AdminCreateUserDTO = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserDTO = z.infer<typeof adminUpdateUserSchema>;
export type AdminCreatePetDTO = z.infer<typeof adminCreatePetSchema>;
export type AdminUpdatePetDTO = z.infer<typeof adminUpdatePetSchema>;
