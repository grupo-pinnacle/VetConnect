import { Response, NextFunction } from 'express';
import { CallsService } from './calls.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const callsService = new CallsService();

const getParamId = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export class CallsController {
  public getToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = getParamId(req.params.consultationId);
      const result = await callsService.generateLiveKitToken(consultationId, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public ring = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = getParamId(req.params.consultationId);
      const result = await callsService.ringCall(consultationId, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
