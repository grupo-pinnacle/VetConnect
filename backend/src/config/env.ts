import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar .env desde múltiples rutas candidatas (raíz del monorepo, backend/ o cwd)
const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dirname, '..', '..', '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '.env'),
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, override: false });
  }
}

// Soporte para variables en minúsculas (ej. database_url -> DATABASE_URL)
if (!process.env.DATABASE_URL && process.env.database_url) {
  process.env.DATABASE_URL = process.env.database_url;
}

// Fallback amigable para desarrollo local si aún no está definida
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  process.env.DATABASE_URL =
    'postgresql://vetconnect:vetconnect_password@localhost:5432/vetconnect?schema=public';
}

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
