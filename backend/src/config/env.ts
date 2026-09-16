import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET debe tener al menos 32 caracteres para seguridad criptográfica')
    .default('dev-jwt-secret-key-change-in-production-min-32-chars-long'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres')
    .default('dev-refresh-secret-key-change-in-production-min-32-chars-long'),
  REDIS_URL: z.string().optional(),
  LIVEKIT_URL: z.string().default('wss://vetconnect-dev.livekit.cloud'),
  LIVEKIT_API_KEY: z.string().default('devkey'),
  LIVEKIT_API_SECRET: z.string().default('secret'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Error crítico: Validación de variables de entorno fallida:');
  console.error(parsed.error.flatten().fieldErrors);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const config = Object.freeze(
  parsed.success
    ? parsed.data
    : {
        NODE_ENV: 'test' as const,
        PORT: 3001,
        DATABASE_URL: process.env.DATABASE_URL || 'file:./test.db',
        JWT_SECRET: 'dev-jwt-secret-key-change-in-production-min-32-chars-long',
        JWT_REFRESH_SECRET: 'dev-refresh-secret-key-change-in-production-min-32-chars-long',
        REDIS_URL: undefined,
        LIVEKIT_URL: 'wss://vetconnect-dev.livekit.cloud',
        LIVEKIT_API_KEY: 'devkey',
        LIVEKIT_API_SECRET: 'secret',
      }
);

export type Config = typeof config;
