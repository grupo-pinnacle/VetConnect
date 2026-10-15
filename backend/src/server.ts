import app from './app';
import { initializeSocketServer } from './realtime/socket.server';
import prisma from './lib/prisma';
import { config } from './config/env';

const PORT = config.PORT || process.env.PORT || 3001;

export async function ensureDatabaseSchema(): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE consultations 
        ADD COLUMN IF NOT EXISTS active_device_id TEXT,
        ADD COLUMN IF NOT EXISTS transport_status TEXT DEFAULT 'OFFLINE',
        ADD COLUMN IF NOT EXISTS state_version INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS livekit_room_sid TEXT;
    `);

    const enumValues = [
      'TRIAGE_CRITICAL_QUEUED',
      'CLAIM_PENDING_SYNC',
      'LIVEKIT_CONNECTING',
      'IN_CALL_ACTIVE',
      'AWAITING_EMERGENCY_CALLBACK',
      'HANDOFF_IN_PROGRESS',
    ];
    for (const val of enumValues) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "ConsultationStatus" ADD VALUE IF NOT EXISTS '${val}';`);
      } catch {
        // Ignored if type does not exist or already added
      }
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS consultation_audit_log (
        id BIGSERIAL PRIMARY KEY,
        consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        previous_state TEXT,
        new_state TEXT,
        actor_id TEXT,
        device_id TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_consultation_created 
        ON consultation_audit_log (consultation_id, created_at DESC);
    `);
  } catch (err) {
    console.warn('[Schema Sync] Database schema self-check notice:', err);
  }
}

const server = app.listen(PORT, async () => {
  console.log(`🚀 VetConnect Backend Server running on port ${PORT}`);
  await ensureDatabaseSchema();
});

const io = initializeSocketServer(server);

let isShuttingDown = false;

export const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Recibida señal ${signal}. Iniciando drench & Graceful Shutdown...`);

  // Force exit timeout after 10 seconds if connections don't drain
  const forceExitTimeout = setTimeout(() => {
    console.error('⚠️ Graceful shutdown excedió tiempo límite (10s). Forzando salida.');
    process.exit(1);
  }, 10000);

  try {
    // 1. Stop accepting new HTTP connections
    await new Promise<void>((resolve) => {
      server.close((err) => {
        if (err) console.error('Error cerrando HTTP server:', err);
        else console.log('✅ Servidor HTTP cerrado.');
        resolve();
      });
    });

    // 2. Disconnect Socket.io clients
    if (io) {
      io.close();
      console.log('✅ Socket.io gateway desconectado.');
    }

    // 3. Disconnect Prisma ORM
    await prisma.$disconnect();
    console.log('✅ Conexión con PostgreSQL / Prisma cerrada.');

    clearTimeout(forceExitTimeout);
    console.log('🎉 Graceful Shutdown completado con éxito.');
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error durante Graceful Shutdown:', error);
    clearTimeout(forceExitTimeout);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
