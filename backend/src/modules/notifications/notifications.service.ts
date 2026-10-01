import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { RegisterPushTokenDTO } from './notifications.schemas';
import { io } from '../../realtime/socket.server';

export class NotificationsService {
  public async registerPushToken(userId: string, dto: RegisterPushTokenDTO) {
    const pushToken = await prisma.pushToken.upsert({
      where: { token: dto.token },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
      },
      update: {
        userId,
        platform: dto.platform,
      },
    });

    return pushToken;
  }

  public async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  public async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new AppError('Notificacion no encontrada', 404, 'NOTIFICATION_NOT_FOUND');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  public async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  public async createAndDispatch(
    userId: string,
    title: string,
    body: string,
    type: string,
    data?: Record<string, unknown>
  ) {
    // 1. Persist notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        data: data ? (data as any) : undefined,
      },
    });

    // 2. Realtime socket emission if user is online
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    // 3. Dispatch Expo Push Notification if user registered push tokens
    try {
      const pushTokens = await prisma.pushToken.findMany({
        where: { userId },
      });

      const validTokens = pushTokens
        .map((t) => t.token)
        .filter((tok) => tok && tok.startsWith('ExponentPushToken'));

      if (validTokens.length > 0) {
        const messages = validTokens.map((token) => ({
          to: token,
          sound: 'default',
          title,
          body,
          data: {
            ...data,
            notificationId: notification.id,
            type,
          },
        }));

        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        }).catch((err) => {
          console.warn('[Push Dispatch] Error sending push to Expo:', err);
        });
      }
    } catch (err) {
      console.warn('[Push Dispatch] Error querying push tokens:', err);
    }

    return notification;
  }
}

export const notificationsService = new NotificationsService();
