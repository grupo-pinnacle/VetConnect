import { Socket, Server } from 'socket.io';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { SocketData } from '../socket.types';
import { createMessageSchema } from '../../modules/consultations/consultations.schemas';

export const registerChatGateway = (
  io: Server,
  socket: Socket<any, any, any, SocketData>
) => {
  const user = socket.data.user;

  // Event: join:consultation
  socket.on('join:consultation', async (data: { consultationId: string }) => {
    try {
      if (!data?.consultationId) return;

      const consultation = await prisma.consultation.findUnique({
        where: { id: data.consultationId },
      });

      if (!consultation || consultation.deletedAt) return;

      const isParticipant =
        consultation.clientId === user.id ||
        consultation.vetId === user.id ||
        user.role === 'ADMIN';

      if (isParticipant) {
        socket.join(`consultation:${data.consultationId}`);
      }
    } catch (err) {
      console.error('Error in join:consultation socket event:', err);
    }
  });

  // Event: call:answered
  socket.on('call:answered', async (data: { consultationId: string }) => {
    try {
      if (!data?.consultationId) return;
      io.to(`consultation:${data.consultationId}`).emit('call:answered', data);
    } catch (err) {
      console.error('Error in call:answered event:', err);
    }
  });

  // Event: call:rejected
  socket.on('call:rejected', async (data: { consultationId: string; reason?: string }) => {
    try {
      if (!data?.consultationId) return;
      io.to(`consultation:${data.consultationId}`).emit('call:rejected', data);
    } catch (err) {
      console.error('Error in call:rejected event:', err);
    }
  });

  // Event: call:ended
  socket.on('call:ended', async (data: { consultationId: string }) => {
    try {
      if (!data?.consultationId) return;
      io.to(`consultation:${data.consultationId}`).emit('call:ended', {
        consultationId: data.consultationId,
        endedBy: user?.id,
      });
    } catch (err) {
      console.error('Error in call:ended event:', err);
    }
  });

  // Event: message:send
  socket.on(
    'message:send',
    async (
      data: {
        consultationId: string;
        content: string;
        clientMsgId: string;
        attachmentUrl?: string;
      },
      callback?: (response: { success: boolean; data?: any; error?: any }) => void
    ) => {
      try {
        if (!data?.consultationId) {
          if (callback) {
            callback({
              success: false,
              error: { code: 'VALIDATION_ERROR', message: 'Faltan campos requeridos en el mensaje' },
            });
          }
          return;
        }

        const parsed = createMessageSchema.safeParse({
          content: data.content,
          clientMsgId: data.clientMsgId,
          attachmentUrl: data.attachmentUrl,
        });

        if (!parsed.success) {
          if (callback) {
            callback({
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Faltan campos requeridos o formato inválido en el mensaje',
              },
            });
          }
          return;
        }

        const validMessage = parsed.data;

        const consultation = await prisma.consultation.findUnique({
          where: { id: data.consultationId },
        });

        if (!consultation || consultation.deletedAt) {
          if (callback) {
            callback({
              success: false,
              error: { code: 'CONSULTATION_NOT_FOUND', message: 'Consulta no encontrada' },
            });
          }
          return;
        }

        const isParticipant =
          consultation.clientId === user.id ||
          consultation.vetId === user.id ||
          user.role === 'ADMIN';

        if (!isParticipant) {
          if (callback) {
            callback({
              success: false,
              error: { code: 'FORBIDDEN', message: 'No eres participante de esta consulta' },
            });
          }
          return;
        }

        let message;
        try {
          message = await prisma.message.create({
            data: {
              consultationId: data.consultationId,
              senderId: user.id,
              content: validMessage.content,
              clientMsgId: validMessage.clientMsgId,
              attachmentUrl: validMessage.attachmentUrl || null,
            },
            include: {
              sender: {
                select: { id: true, firstName: true, lastName: true, role: true },
              },
            },
          });
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const existingMessage = await prisma.message.findUnique({
              where: { clientMsgId: data.clientMsgId },
              include: {
                sender: {
                  select: { id: true, firstName: true, lastName: true, role: true },
                },
              },
            });

            if (callback) {
              callback({ success: true, data: existingMessage });
            }
            return;
          }
          throw err;
        }

        // Broadcast canonical event 'message:new' to consultation room
        io.to(`consultation:${data.consultationId}`).emit('message:new', message);

        if (callback) {
          callback({ success: true, data: message });
        }
      } catch (err: any) {
        console.error('Error handling message:send:', err);
        if (callback) {
          callback({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Error procesando el mensaje' },
          });
        }
      }
    }
  );
};
