import { Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { registerPushTokenSchema } from './notifications.schemas';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const notificationsService = new NotificationsService();

const getParamId = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export class NotificationsController {
  public registerToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = registerPushTokenSchema.parse(req.body);
      const pushToken = await notificationsService.registerPushToken(req.user!.id, validated);
      res.status(200).json({
        success: true,
        data: pushToken,
      });
    } catch (error) {
      next(error);
    }
  };

  public listMine = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notifications = await notificationsService.getUserNotifications(req.user!.id);
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  public markRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const notification = await notificationsService.markAsRead(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };
}
