import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { setRefreshCookie } from '../auth/auth.controller';
import { changePasswordSchema, updateProfileSchema } from './users.schemas';

const usersService = new UsersService();

export class UsersController {
  public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const user = await usersService.updateProfile(req.user!.id, validated);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = changePasswordSchema.parse(req.body);
      const tokens = await usersService.changePassword(req.user!.id, validated);
      setRefreshCookie(res, tokens.refreshToken);
      res.status(200).json({
        success: true,
        data: { accessToken: tokens.accessToken },
      });
    } catch (error) {
      next(error);
    }
  };
}
