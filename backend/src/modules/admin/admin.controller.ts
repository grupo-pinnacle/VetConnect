import { Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import {
  rejectVetSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminCreatePetSchema,
  adminUpdatePetSchema,
} from './admin.schemas';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { Role, ConsultationStatus } from '@prisma/client';

const adminService = new AdminService();

const getParamId = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export class AdminController {
  public getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  public getPendingVets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vets = await adminService.getPendingVets();
      res.status(200).json({ success: true, data: vets });
    } catch (error) {
      next(error);
    }
  };

  public approveVet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const vet = await adminService.approveVet(id, req.user!.id);
      res.status(200).json({ success: true, data: vet });
    } catch (error) {
      next(error);
    }
  };

  public rejectVet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const validated = req.body && req.body.reason ? rejectVetSchema.parse(req.body) : undefined;
      const vet = await adminService.rejectVet(id, req.user!.id, validated);
      res.status(200).json({ success: true, data: vet });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // USERS CRUD
  // ==========================================
  public getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, search, includeDeleted } = req.query;
      const users = await adminService.getUsers({
        role: role as Role,
        search: search as string,
        includeDeleted: includeDeleted === 'true',
      });
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = adminCreateUserSchema.parse(req.body);
      const user = await adminService.createUser(req.user!.id, validated);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const validated = adminUpdateUserSchema.parse(req.body);
      const user = await adminService.updateUser(req.user!.id, id, validated);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const user = await adminService.deleteUser(req.user!.id, id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public banUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const reason = req.body?.reason as string | undefined;
      const user = await adminService.banUser(req.user!.id, id, reason);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public restoreUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const user = await adminService.restoreUser(req.user!.id, id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // PETS CRUD (Creadas y Ocultas)
  // ==========================================
  public getPets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { includeDeleted, search } = req.query;
      const pets = await adminService.getPets({
        includeDeleted: includeDeleted === 'true',
        search: search as string,
      });
      res.status(200).json({ success: true, data: pets });
    } catch (error) {
      next(error);
    }
  };

  public createPet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = adminCreatePetSchema.parse(req.body);
      const pet = await adminService.createPet(req.user!.id, validated);
      res.status(201).json({ success: true, data: pet });
    } catch (error) {
      next(error);
    }
  };

  public updatePet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const validated = adminUpdatePetSchema.parse(req.body);
      const pet = await adminService.updatePet(req.user!.id, id, validated);
      res.status(200).json({ success: true, data: pet });
    } catch (error) {
      next(error);
    }
  };

  public deletePet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const pet = await adminService.deletePet(req.user!.id, id);
      res.status(200).json({ success: true, data: pet });
    } catch (error) {
      next(error);
    }
  };

  public restorePet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const pet = await adminService.restorePet(req.user!.id, id);
      res.status(200).json({ success: true, data: pet });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // CONSULTATIONS & AUDIT LOGS
  // ==========================================
  public getConsultations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, search } = req.query;
      const consultations = await adminService.getConsultations({
        status: status as ConsultationStatus,
        search: search as string,
      });
      res.status(200).json({ success: true, data: consultations });
    } catch (error) {
      next(error);
    }
  };

  public getConsultationMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParamId(req.params.id);
      const messages = await adminService.getConsultationMessages(id);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  };

  public getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await adminService.getAuditLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  };
}
