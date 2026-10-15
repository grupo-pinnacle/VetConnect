import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar .env desde múltiples rutas candidatas (raíz del monorepo, backend/ o cwd)
const rootEnvPath = path.resolve(__dirname, '..', '..', '..', '.env');
const backendEnvPath = path.resolve(__dirname, '..', '..', '.env');

const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  rootEnvPath,
  backendEnvPath,
  path.resolve(__dirname, '..', '.env'),
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, override: false });
  }
}

// Si existe .env en la raíz pero no en backend/, creamos una copia local para que Prisma CLI funcione sin fallos
try {
  if (fs.existsSync(rootEnvPath) && !fs.existsSync(backendEnvPath)) {
    fs.copyFileSync(rootEnvPath, backendEnvPath);
  }
} catch {
  // Ignorar errores de filesystem en entornos restringidos
}

// Normalización de alias comunes para la URL de base de datos (Supabase, Neon, Vercel, o 'base_url')
const rawDbUrl =
  process.env.DATABASE_URL ||
  process.env.database_url ||
  process.env.BASE_URL ||
  process.env.base_url ||
  process.env.SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRESQL_URL ||
  (process.env.SUPABASE_URL?.startsWith('postgres') ? process.env.SUPABASE_URL : undefined);

if (rawDbUrl) {
  // Limpiar posibles comillas dobles o simples accidentales y espacios
  process.env.DATABASE_URL = rawDbUrl.trim().replace(/^["']|["']$/g, '');
}

// Garantizar DIRECT_URL para Prisma si alguna herramienta externa lo consulta
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// Fallback amigable para desarrollo local si aún no está definida
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  process.env.DATABASE_URL =
    'postgresql://vetconnect:vetconnect_password@localhost:5432/vetconnect?schema=public';
}

// Normalización de alias comunes para JWT y Storage (compatibilidad histórica y de templates)
if (!process.env.JWT_REFRESH_SECRET && process.env.REFRESH_TOKEN_SECRET) {
  process.env.JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
}
if (!process.env.REFRESH_TOKEN_SECRET && process.env.JWT_REFRESH_SECRET) {
  process.env.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
}

if (!process.env.STORAGE_DRIVER && process.env.STORAGE_PROVIDER) {
  process.env.STORAGE_DRIVER = process.env.STORAGE_PROVIDER;
}
if (!process.env.STORAGE_PROVIDER && process.env.STORAGE_DRIVER) {
  process.env.STORAGE_PROVIDER = process.env.STORAGE_DRIVER;
}

if (!process.env.AWS_BUCKET_NAME && process.env.AWS_S3_BUCKET_NAME) {
  process.env.AWS_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
}
if (!process.env.AWS_S3_BUCKET_NAME && process.env.AWS_BUCKET_NAME) {
  process.env.AWS_S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
}

if (!process.env.FRONTEND_URL && process.env.CLIENT_URL) {
  process.env.FRONTEND_URL = process.env.CLIENT_URL;
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
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_BUCKET_NAME: z.string().default('vetconnect-media'),
  CORS_ORIGIN: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  CLIENT_URL: z.string().optional(),
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
        JWT_SECRET:
          process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-min-32-chars-long',
        JWT_REFRESH_SECRET:
          process.env.JWT_REFRESH_SECRET ||
          process.env.REFRESH_TOKEN_SECRET ||
          'dev-refresh-secret-key-change-in-production-min-32-chars-long',
        REDIS_URL: undefined,
        LIVEKIT_URL: 'wss://vetconnect-dev.livekit.cloud',
        LIVEKIT_API_KEY: 'devkey',
        LIVEKIT_API_SECRET: 'secret',
        STORAGE_DRIVER: (process.env.STORAGE_DRIVER as 'local' | 's3') || 'local',
        UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
        AWS_BUCKET_NAME:
          process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || 'vetconnect-media',
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL,
        CLIENT_URL: process.env.CLIENT_URL,
      }
);

export type Config = typeof config;
