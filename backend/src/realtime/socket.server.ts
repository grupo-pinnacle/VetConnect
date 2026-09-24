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

export let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

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

  // Middleware
  io.use(socketAuthMiddleware);

  // Connection Handler
  io.on('connection', (socket) => {
    const user = socket.data.user;

    if (user) {
      // Join personal user room for direct signaling (e.g. call:incoming)
      socket.join(`user:${user.id}`);
      registerChatGateway(io, socket);
    }

    socket.on('disconnect', async () => {
      if (user) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { isOnline: false, lastSeen: new Date() },
          })
          .catch(() => {});
      }
    });
  });

  return io;
};
