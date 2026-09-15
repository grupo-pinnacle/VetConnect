import { AccessToken } from 'livekit-server-sdk';
import { User, Role, ConsultationStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { io } from '../../realtime/socket.server';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://vetconnect-dev.livekit.cloud';

export class CallsService {
  public async generateLiveKitToken(consultationId: string, user: User) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    const isClient = consultation.clientId === user.id;
    const isVet = consultation.vetId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isClient && !isVet && !isAdmin) {
      throw new AppError('Acceso denegado: no eres participante de esta consulta', 403, 'FORBIDDEN');
    }

    if (consultation.status !== ConsultationStatus.ACTIVE) {
      throw new AppError('Solo se pueden generar tokens para consultas activas', 400, 'INVALID_CONSULTATION_STATE');
    }

    // Zero PII guardrail: identity is user.id, name is user.firstName (NO email or phone)
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: user.id,
      name: user.firstName,
      ttl: '1h',
    });

    at.addGrant({
      roomJoin: true,
      room: consultationId,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return {
      token,
      wsUrl: LIVEKIT_URL,
      roomName: consultationId,
    };
  }

  public async ringCall(consultationId: string, callerUser: User) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    if (consultation.status !== ConsultationStatus.ACTIVE) {
      throw new AppError('La consulta debe estar ACTIVE para iniciar llamada', 400, 'INVALID_CONSULTATION_STATE');
    }

    const isClient = consultation.clientId === callerUser.id;
    const isVet = consultation.vetId === callerUser.id;

    if (!isClient && !isVet && callerUser.role !== Role.ADMIN) {
      throw new AppError('No eres participante de esta consulta', 403, 'NOT_CONSULTATION_PARTICIPANT');
    }

    // Determine target recipient ID
    const targetUserId = isClient ? consultation.vetId : consultation.clientId;

    if (!targetUserId) {
      throw new AppError('No hay destinatario asignado en la consulta', 400, 'NO_TARGET_USER');
    }

    // Emit Socket.io 'call:incoming' event to target user room (Zero PII)
    if (io) {
      io.to(`user:${targetUserId}`).emit('call:incoming', {
        consultationId,
        callerName: callerUser.firstName,
        roomName: consultationId,
      });
    }

    return {
      consultationId,
      targetUserId,
      status: 'RINGING',
    };
  }
}
