import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { updateProfileSchema } from './users.schemas';

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
}
