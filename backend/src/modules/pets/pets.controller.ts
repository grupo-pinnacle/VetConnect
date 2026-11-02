import { Response, NextFunction } from 'express';
import { PetsService } from './pets.service';
import { createPetSchema, updatePetSchema } from './pets.schemas';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const petsService = new PetsService();

export class PetsController {
  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPetSchema.parse(req.body);
      const pet = await petsService.createPet(req.user!.id, validated);
      res.status(201).json({
        success: true,
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  };

  public listMine = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pets = await petsService.getPetsByOwner(req.user!.id);
      res.status(200).json({
        success: true,
        data: pets,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const petId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const pet = await petsService.getPetById(petId, req.user!);
      res.status(200).json({
        success: true,
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const petId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = updatePetSchema.parse(req.body);
      const pet = await petsService.updatePet(petId, req.user!, validated);
      res.status(200).json({
        success: true,
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const petId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await petsService.deletePet(petId, req.user!);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const petId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await petsService.getPetById(petId, req.user!);
      const { name, title, type, fileUrl, url } = req.body || {};
      const docName = (name || title || (req.file ? req.file.originalname : 'Documento clínico')).trim();
      const docType = type || 'Estudio médico';
      const document = {
        id: `doc-${Date.now()}`,
        petId,
        name: docName,
        type: docType,
        url: fileUrl || url || (req.file ? `/uploads/${req.file.filename}` : null),
        date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
        size: req.file ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
        createdAt: new Date().toISOString(),
      };
      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };
}
