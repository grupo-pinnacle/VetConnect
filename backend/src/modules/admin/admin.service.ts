import { Role, VetStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { RejectVetDTO } from './admin.schemas';

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  vetStatus: true,
  licenseNumber: true,
  bio: true,
  photoUrl: true,
  ratingAvg: true,
  ratingCount: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
  updatedAt: true,
};

export class AdminService {
  public async getPendingVets() {
    return prisma.user.findMany({
      where: {
        role: Role.VET,
        vetStatus: VetStatus.PENDING,
        deletedAt: null,
      },
      select: userSelectFields,
      orderBy: { createdAt: 'asc' },
    });
  }

  public async approveVet(vetId: string, adminId: string) {
    const vet = await prisma.user.findFirst({
      where: { id: vetId, role: Role.VET, deletedAt: null },
    });

    if (!vet) {
      throw new AppError('Veterinario no encontrado', 404, 'VET_NOT_FOUND');
    }

    return prisma.$transaction(async (tx) => {
      const updatedVet = await tx.user.update({
        where: { id: vetId },
        data: { vetStatus: VetStatus.APPROVED },
        select: userSelectFields,
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'APPROVE_VET',
          targetId: vetId,
          details: { licenseNumber: vet.licenseNumber, previousStatus: vet.vetStatus },
        },
      });

      return updatedVet;
    });
  }

  public async rejectVet(vetId: string, adminId: string, dto?: RejectVetDTO) {
    const vet = await prisma.user.findFirst({
      where: { id: vetId, role: Role.VET, deletedAt: null },
    });

    if (!vet) {
      throw new AppError('Veterinario no encontrado', 404, 'VET_NOT_FOUND');
    }

    return prisma.$transaction(async (tx) => {
      const updatedVet = await tx.user.update({
        where: { id: vetId },
        data: { vetStatus: VetStatus.REJECTED },
        select: userSelectFields,
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'REJECT_VET',
          targetId: vetId,
          details: { reason: dto?.reason || 'Rechazado por auditoria administrativa' },
        },
      });

      return updatedVet;
    });
  }
}
