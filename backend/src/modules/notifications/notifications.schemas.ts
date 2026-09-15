import { z } from 'zod';

export const registerPushTokenSchema = z.object({
  token: z.string().min(1, 'El token de notificacion es requerido'),
  platform: z.enum(['ios', 'android', 'web']),
});

export type RegisterPushTokenDTO = z.infer<typeof registerPushTokenSchema>;
