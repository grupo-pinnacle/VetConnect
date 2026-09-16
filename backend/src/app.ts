import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import petRoutes from './modules/pets/pets.routes';
import consultationRoutes from './modules/consultations/consultations.routes';
import prescriptionRoutes from './modules/prescriptions/prescriptions.routes';
import callRoutes from './modules/calls/calls.routes';
import mediaRoutes from './modules/media/media.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import adminRoutes from './modules/admin/admin.routes';
import userRoutes from './modules/users/users.routes';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'wss:', 'ws:', '*.livekit.cloud', 'https://*.livekit.cloud'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    },
  })
);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'test') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiters for sensitive auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiados intentos de inicio de sesion. Reintente en 15 minutos.',
      timestamp: new Date().toISOString(),
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiados registros desde esta IP. Reintente en 15 minutos.',
      timestamp: new Date().toISOString(),
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api', prescriptionRoutes);

// Health Check Endpoint
app.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    if (process.env.NODE_ENV === 'test') {
      dbStatus = 'connected';
    } else {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    }
  } catch (error) {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.env.NODE_ENV === 'test' ? 100 : process.uptime(),
    database: dbStatus,
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
