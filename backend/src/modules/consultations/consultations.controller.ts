import { Response, NextFunction } from 'express';
import { ConsultationsService } from './consultations.service';
import {
  createConsultationSchema,
  completeConsultationSchema,
  cancelConsultationSchema,
  reviewConsultationSchema,
} from './consultations.schemas';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const consultationsService = new ConsultationsService();

const getParamId = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export class ConsultationsController {
  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createConsultationSchema.parse(req.body);
      const consultation = await consultationsService.createConsultation(req.user!.id, validated);
      res.status(201).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMine = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultations = await consultationsService.getMine(req.user!);
      res.status(200).json({
        success: true,
        data: consultations,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const consultation = await consultationsService.getConsultationById(id, req.user!);
      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  };

  public assign = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const consultation = await consultationsService.assignConsultation(id, req.user!);
      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  };

  public complete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const validated = completeConsultationSchema.parse(req.body);
      const consultation = await consultationsService.completeConsultation(id, req.user!, validated);
      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  };

  public cancel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const validated = cancelConsultationSchema.parse(req.body);
      const consultation = await consultationsService.cancelConsultation(id, req.user!, validated);
      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  };

  public review = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const validated = reviewConsultationSchema.parse(req.body);
      const review = await consultationsService.createReview(id, req.user!, validated);
      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const after = req.query.after as string | undefined;
      const messages = await consultationsService.getMessages(id, req.user!, after);
      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };
}
