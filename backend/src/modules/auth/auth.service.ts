import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, VetStatus, User } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { RegisterDTO, LoginDTO } from './auth.schemas';
import { config } from '../../config/env';

const JWT_SECRET = config.JWT_SECRET;
const JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET;

export interface TokenPayload {
  userId: string;
  role: Role;
  tokenVersion: number;
}

export class AuthService {
  public static generateTokens(user: User) {
    const payload: TokenPayload = {
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  public static sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitized } = user;
    return sanitized;
  }

  public async register(dto: RegisterDTO) {
    const emailStr = String(dto.email).toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: emailStr },
    });

    if (existing) {
      if (existing.deletedAt) {
        throw new AppError(
          'Este correo pertenece a una cuenta dada de baja o suspendida',
          409,
          'EMAIL_ALREADY_EXISTS'
        );
      }
      throw new AppError('El email ya se encuentra registrado', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const vetStatus = dto.role === Role.VET ? (process.env.NODE_ENV === 'production' ? VetStatus.PENDING : VetStatus.APPROVED) : null;

    const user = await prisma.user.create({
      data: {
        email: emailStr,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone || null,
        role: dto.role,
        vetStatus,
        licenseNumber: dto.licenseNumber || null,
        bio: dto.bio || null,
      },
    });

    const tokens = AuthService.generateTokens(user);
    return { user: AuthService.sanitizeUser(user), tokens };
  }

  public async login(dto: LoginDTO) {
    const emailStr = String(dto.email).toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailStr },
    });

    if (!user) {
      throw new AppError('Credenciales invalidas', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new AppError('Credenciales invalidas', 401, 'INVALID_CREDENTIALS');
    }

    if (user.deletedAt) {
      throw new AppError(
        'Tu cuenta ha sido dada de baja o suspendida por un administrador',
        403,
        'ACCOUNT_SUSPENDED'
      );
    }

    // Atomic session rotation: increment tokenVersion to invalidate existing active sessions (ADR-004 Single Session Concurrency)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    const tokens = AuthService.generateTokens(updatedUser);
    return { user: AuthService.sanitizeUser(updatedUser), tokens };
  }

  public async refresh(tokenString: string) {
    if (!tokenString) {
      throw new AppError('Refresh token no provisto', 401, 'UNAUTHORIZED');
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(tokenString, JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      }) as TokenPayload;
    } catch (err) {
      throw new AppError('Refresh token invalido o expirado', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.deletedAt || user.tokenVersion !== payload.tokenVersion) {
      throw new AppError('Sesion revocada o invalida', 401, 'SESSION_REVOKED');
    }

    const tokens = AuthService.generateTokens(user);
    return { user: AuthService.sanitizeUser(user), tokens };
  }

  public async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
        isOnline: false,
      },
    });
  }
}
