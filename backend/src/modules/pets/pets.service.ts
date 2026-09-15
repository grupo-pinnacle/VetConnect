import { User, Role } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { CreatePetDTO, UpdatePetDTO } from './pets.schemas';

export class PetsService {
  public async createPet(ownerId: string, dto: CreatePetDTO) {
    if (dto.microchip) {
      const existing = await prisma.pet.findFirst({
        where: { microchip: dto.microchip, deletedAt: null },
      });
      if (existing) {
        throw new AppError('El numero de microchip ya se encuentra registrado', 409, 'MICROCHIP_ALREADY_EXISTS');
      }
    }

    const pet = await prisma.pet.create({
      data: {
        ownerId,
        name: dto.name,
        species: dto.species,
        breed: dto.breed,
        weightKg: dto.weightKg || null,
        sex: dto.sex || null,
        microchip: dto.microchip || null,
        allergies: dto.allergies || null,
        chronicConditions: dto.chronicConditions || null,
      },
    });

    return pet;
  }

  public async getPetsByOwner(ownerId: string) {
    return prisma.pet.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getPetById(petId: string, requester: User) {
    const pet = await prisma.pet.findFirst({
      where: { id: petId, deletedAt: null },
      include: {
        owner: true,
      },
    });

    if (!pet) {
      throw new AppError('Mascota no encontrada', 404, 'PET_NOT_FOUND');
    }

    // Access control: Owner, VET, or ADMIN
    const isOwner = pet.ownerId === requester.id;
    const isAdmin = requester.role === Role.ADMIN;
    const isVet = requester.role === Role.VET;

    if (!isOwner && !isAdmin && !isVet) {
      throw new AppError('Acceso denegado', 403, 'FORBIDDEN');
    }

    // PII Redaction rule:
    // When a VET accesses a pet, redact owner email/phone unless there is a consultation between this VET and this pet
    let redactPII = false;
    if (isVet && !isOwner && !isAdmin) {
      const activeOrPastConsultation = await prisma.consultation.findFirst({
        where: {
          petId: pet.id,
          vetId: requester.id,
          deletedAt: null,
        },
      });

      if (!activeOrPastConsultation) {
        redactPII = true;
      }
    }

    const ownerData = {
      id: pet.owner.id,
      firstName: pet.owner.firstName,
      lastName: pet.owner.lastName,
      email: redactPII ? '[REDACTED]' : pet.owner.email,
      phone: redactPII ? '[REDACTED]' : pet.owner.phone,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { owner, ...petData } = pet;
    return {
      ...petData,
      owner: ownerData,
    };
  }

  public async updatePet(petId: string, requester: User, dto: UpdatePetDTO) {
    const pet = await prisma.pet.findFirst({
      where: { id: petId, deletedAt: null },
    });

    if (!pet) {
      throw new AppError('Mascota no encontrada', 404, 'PET_NOT_FOUND');
    }

    if (pet.ownerId !== requester.id && requester.role !== Role.ADMIN) {
      throw new AppError('Acceso denegado: solo el dueño puede modificar la mascota', 403, 'FORBIDDEN');
    }

    if (dto.microchip && dto.microchip !== pet.microchip) {
      const existing = await prisma.pet.findFirst({
        where: { microchip: dto.microchip, deletedAt: null },
      });
      if (existing) {
        throw new AppError('El numero de microchip ya se encuentra registrado', 409, 'MICROCHIP_ALREADY_EXISTS');
      }
    }

    return prisma.pet.update({
      where: { id: petId },
      data: dto,
    });
  }

  public async deletePet(petId: string, requester: User) {
    const pet = await prisma.pet.findFirst({
      where: { id: petId, deletedAt: null },
    });

    if (!pet) {
      throw new AppError('Mascota no encontrada', 404, 'PET_NOT_FOUND');
    }

    if (pet.ownerId !== requester.id && requester.role !== Role.ADMIN) {
      throw new AppError('Acceso denegado: solo el dueño puede eliminar la mascota', 403, 'FORBIDDEN');
    }

    // Soft-delete
    await prisma.pet.update({
      where: { id: petId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Mascota eliminada exitosamente' };
  }
}
