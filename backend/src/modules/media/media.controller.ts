import { Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const mediaService = new MediaService();

const getParamId = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export class MediaController {
  public upload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = req.body.consultationId;
      const mediaFile = await mediaService.uploadMediaFile(req.user!, req.file!, consultationId);
      res.status(201).json({
        success: true,
        data: mediaFile,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mediaId = getParamId(req.params.id);
      const result = await mediaService.getMediaFile(mediaId, req.user!);

      if (result.type === 's3' && result.presignedUrl) {
        res.redirect(302, result.presignedUrl);
      } else if (result.localPath) {
        res.sendFile(result.localPath);
      }
    } catch (error) {
      next(error);
    }
  };
}
