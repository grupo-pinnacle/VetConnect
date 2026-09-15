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
}
