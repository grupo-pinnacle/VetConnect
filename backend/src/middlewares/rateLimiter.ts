import rateLimit from 'express-rate-limit';

export const mediaUploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // max 20 file uploads per hour per IP/user
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_UPLOADS',
      message: 'Límite de subida de archivos alcanzado (máximo 20 por hora). Intente más tarde.',
      timestamp: new Date().toISOString(),
    },
  },
});

export const consultationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // max 10 triage requests per hour per IP/user
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_CONSULTATIONS',
      message: 'Límite de solicitudes de teleconsulta alcanzado (máximo 10 por hora).',
      timestamp: new Date().toISOString(),
    },
  },
});
