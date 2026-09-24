import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: any;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada invalidos',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
        timestamp,
      },
    });
    return;
  }

  // Fallos de inicialización o conectividad física de base de datos (Supabase tenant pausado / red caída)
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err.name === 'PrismaClientInitializationError' ||
    (err instanceof Prisma.PrismaClientKnownRequestError &&
      ['P1000', 'P1001', 'P1002', 'P1003', 'P1017'].includes(err.code))
  ) {
    console.error('❌ [DATABASE_UNAVAILABLE] Fallo de conexión con PostgreSQL/Supabase:');
    console.error('👉 Diagnóstico: Si usas Supabase Free Tier, comprueba en https://supabase.com/dashboard que el proyecto no esté pausado por inactividad.');

    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message:
          'No fue posible conectar con el servidor de base de datos. Si el entorno utiliza Supabase, verifique que el proyecto se encuentre activo en https://supabase.com/dashboard.',
        details: process.env.NODE_ENV === 'development' ? err.message : null,
        timestamp,
      },
    });
    return;
  }

  // Violación de unicidad en base de datos (concurrencia / email ya existente)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'El recurso ya existe o viola una restricción de unicidad',
        details: process.env.NODE_ENV === 'development' ? err.meta : null,
        timestamp,
      },
    });
    return;
  }

  console.error('Unhandled Server Error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrio un error interno en el servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : null,
      timestamp,
    },
  });
};
