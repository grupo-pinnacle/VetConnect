import { Response, NextFunction } from 'express';
import { PrescriptionsService } from './prescriptions.service';
import { createPrescriptionSchema } from './prescriptions.schemas';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const prescriptionsService = new PrescriptionsService();

const getParamId = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export class PrescriptionsController {
  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = getParamId(req.params.id);
      const validated = createPrescriptionSchema.parse(req.body);
      const prescription = await prescriptionsService.createPrescription(
        consultationId,
        req.user!,
        validated
      );
      res.status(201).json({
        success: true,
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prescriptionId = getParamId(req.params.id);
      const prescription = await prescriptionsService.getPrescriptionById(
        prescriptionId,
        req.user
      );
      res.status(200).json({
        success: true,
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  };
}
