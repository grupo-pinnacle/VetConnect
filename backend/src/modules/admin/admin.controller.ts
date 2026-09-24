import { Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { rejectVetSchema } from './admin.schemas';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const adminService = new AdminService();

const getParamId = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export class AdminController {
  public getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPendingVets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vets = await adminService.getPendingVets();
      res.status(200).json({
        success: true,
        data: vets,
      });
    } catch (error) {
      next(error);
    }
  };

  public approveVet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const vet = await adminService.approveVet(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: vet,
      });
    } catch (error) {
      next(error);
    }
  };

  public rejectVet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const validated = req.body && req.body.reason ? rejectVetSchema.parse(req.body) : undefined;
      const vet = await adminService.rejectVet(id, req.user!.id, validated);
      res.status(200).json({
        success: true,
        data: vet,
      });
    } catch (error) {
      next(error);
    }
  };
}
