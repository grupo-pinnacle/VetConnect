import { Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { Prisma } from '@prisma/client';
import { errorHandler, AppError } from '../middlewares/errorHandler';

describe('Global errorHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  const mockNext = jest.fn();

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockRequest = {};
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
    jest.clearAllMocks();
  });

  it('should handle AppError with custom status code and RFC 7807 payload', () => {
    const error = new AppError('Recurso no encontrado', 404, 'NOT_FOUND', { id: '123' });
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toHaveBeenCalledWith(404);
    expect(responseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Recurso no encontrado',
          details: { id: '123' },
        }),
      })
    );
  });

  it('should handle ZodError with 400 VALIDATION_ERROR', () => {
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'invalido' });
    if (!result.success) {
      errorHandler(result.error, mockRequest as Request, mockResponse as Response, mockNext);
    }

    expect(responseStatus).toHaveBeenCalledWith(400);
    expect(responseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });

  it('should handle PrismaClientInitializationError with 503 DATABASE_UNAVAILABLE', () => {
    const prismaInitError = new Prisma.PrismaClientInitializationError(
      'Error querying the database: FATAL: (ENOTFOUND) tenant/user postgres.wnijtwmrkzjurpomddwx not found',
      '6.4.0'
    );

    errorHandler(prismaInitError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toHaveBeenCalledWith(503);
    expect(responseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'DATABASE_UNAVAILABLE',
        }),
      })
    );
  });

  it('should handle PrismaClientKnownRequestError connection failure (P1001) with 503', () => {
    const p1001Error = new Prisma.PrismaClientKnownRequestError(
      "Can't reach database server at `localhost:5432`",
      { code: 'P1001', clientVersion: '6.4.0' }
    );

    errorHandler(p1001Error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toHaveBeenCalledWith(503);
    expect(responseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'DATABASE_UNAVAILABLE',
        }),
      })
    );
  });

  it('should handle PrismaClientKnownRequestError unique constraint (P2002) with 409 CONFLICT', () => {
    const p2002Error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      { code: 'P2002', clientVersion: '6.4.0', meta: { target: ['email'] } }
    );

    errorHandler(p2002Error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toHaveBeenCalledWith(409);
    expect(responseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'CONFLICT',
        }),
      })
    );
  });

  it('should handle generic unhandled errors with 500 INTERNAL_SERVER_ERROR', () => {
    const genericError = new Error('Unexpected crash');
    errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
        }),
      })
    );
  });
});
