import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const usersService = new UsersService();

export class UsersController {
  public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isOnline, bio, photoUrl } = req.body;
      const user = await usersService.updateProfile(req.user!.id, { isOnline, bio, photoUrl });
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
