import { z } from 'zod';

export const rejectVetSchema = z.object({
  reason: z.string().min(3, 'La razon de rechazo es requerida').max(500),
});

export type RejectVetDTO = z.infer<typeof rejectVetSchema>;
