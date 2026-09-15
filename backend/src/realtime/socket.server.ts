import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import prisma from '../lib/prisma';
import { socketAuthMiddleware } from './socket.auth.middleware';
import { registerChatGateway } from './gateways/chat.gateway';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './socket.types';

export let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initializeSocketServer = (httpServer: HttpServer) => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'test') {
            callback(null, true);
          } else {
            callback(new Error('CORS policy violation'));
          }
        },
        credentials: true,
      },
    }
  );

  // Redis Adapter setup if REDIS_URL is provided
  if (process.env.REDIS_URL) {
    try {
      const pubClient = new Redis(process.env.REDIS_URL);
      const subClient = pubClient.duplicate();

      pubClient.on('error', (err) => console.warn('Redis Pub Client Error:', err.message));
      subClient.on('error', (err) => console.warn('Redis Sub Client Error:', err.message));

      io.adapter(createAdapter(pubClient, subClient));
      console.log('⚡ Socket.io Redis Adapter connected successfully');
    } catch (err) {
      console.warn('⚠️ Could not initialize Redis Adapter, falling back to in-memory adapter:', err);
    }
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
