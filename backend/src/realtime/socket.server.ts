import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis, { RedisOptions } from 'ioredis';
import prisma from '../lib/prisma';
import { socketAuthMiddleware } from './socket.auth.middleware';
import { registerChatGateway } from './gateways/chat.gateway';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './socket.types';

import { isAllowedOrigin } from '../config/cors';
import {
  consultationConcurrencyService,
  PostCommitEvictionParams,
} from '../modules/consultations/consultationConcurrency.service';

export let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const evictRevokedSessionAndResume = async (
  params: PostCommitEvictionParams
): Promise<void> => {
  await consultationConcurrencyService.handlePostCommitEvictionAndResume(params);
};

export const initializeSocketServer = (httpServer: HttpServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: (origin, callback) => {
          if (isAllowedOrigin(origin)) {
            callback(null, true);
          } else {
            callback(new Error('CORS policy violation'));
          }
        },
        credentials: true,
      },
    }
  );

  // Redis Adapter setup if REDIS_URL is provided (ADR-009)
  if (process.env.REDIS_URL) {
    const redisOptions: RedisOptions = {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: () => null,
    };

    const pubClient = new Redis(process.env.REDIS_URL, redisOptions);
    const subClient = pubClient.duplicate(redisOptions);

    // Suppress console spam while probing the initial connection
    const handleProbeError = () => {};
    pubClient.on('error', handleProbeError);
    subClient.on('error', handleProbeError);

    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        pubClient.off('error', handleProbeError);
        subClient.off('error', handleProbeError);

        pubClient.on('error', (err) => console.warn('Redis Pub Client Error:', err.message));
        subClient.on('error', (err) => console.warn('Redis Sub Client Error:', err.message));

        io.adapter(createAdapter(pubClient, subClient));
        console.log('⚡ Socket.io Redis Adapter connected successfully');
      })
      .catch((err: Error) => {
        pubClient.off('error', handleProbeError);
        subClient.off('error', handleProbeError);

        pubClient.disconnect(false);
        subClient.disconnect(false);

        if (process.env.NODE_ENV === 'production') {
          console.error('❌ [CRITICAL] Could not connect to Redis Adapter in production:', err.message);
        } else {
          console.info('ℹ️ Redis no disponible en ' + process.env.REDIS_URL + ' (modo local). Operando con Socket.io InMemoryAdapter por defecto.');
        }
      });
  }

  // Reset any lingering offline presence from previous crashes or restarts
  prisma.user?.updateMany?.({ where: { isOnline: true }, data: { isOnline: false } })?.catch?.(() => {});

  // Middleware
  io.use(socketAuthMiddleware);

  // Connection Handler
  io.on('connection', (socket) => {
    const user = socket.data.user;
    const deviceId = socket.data.deviceId;

    if (user) {
      // Join personal user room for direct signaling (e.g. call:incoming)
      socket.join(`user:${user.id}`);

      // Join device room for device-targeted handoff signaling
      if (deviceId) {
        socket.join(`device:${deviceId}`);
      }

      registerChatGateway(io, socket);

      if (user.role === 'VET') {
        prisma.user
          .update({
            where: { id: user.id },
            data: { isOnline: true, lastSeen: new Date() },
          })
          .catch(() => {});
      }
    }

    socket.on('disconnect', async () => {
      if (user) {
        // Atomic guard on socket disconnect:
        // Only transitions transport_status to GRACE_DISCONNECTED if this socket's deviceId
        // is still recorded as the active device in the database.
        if (deviceId && user.role === 'CLIENT') {
          try {
            await consultationConcurrencyService.markSocketDisconnect(user.id, deviceId);
          } catch (err) {
            console.warn('[Socket Disconnect] Error in atomic disconnect guard:', err);
          }
        }

        try {
          const remainingSockets = await io.in(`user:${user.id}`).fetchSockets();
          if (remainingSockets.length === 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: { isOnline: false, lastSeen: new Date() },
            });
          }
        } catch {
          // Gracefully ignore error during server teardown
        }
      }
    });
  });

  return io;
};
