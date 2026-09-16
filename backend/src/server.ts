import app from './app';
import { initializeSocketServer } from './realtime/socket.server';
import prisma from './lib/prisma';
import { config } from './config/env';

const PORT = config.PORT || process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 VetConnect Backend Server running on port ${PORT}`);
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
