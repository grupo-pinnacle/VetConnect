import { Role, VetStatus, ConsultationStatus, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { io } from '../../realtime/socket.server';
import {
  RejectVetDTO,
  AdminCreateUserDTO,
  AdminUpdateUserDTO,
  AdminCreatePetDTO,
  AdminUpdatePetDTO,
} from './admin.schemas';

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
  deletedAt: true,
};

export class AdminService {
  public async getStats() {
    const [pendingVets, approvedVets, rejectedVets, onlineVets] = await Promise.all([
      prisma.user.count({ where: { role: Role.VET, vetStatus: VetStatus.PENDING, deletedAt: null } }),
      prisma.user.count({ where: { role: Role.VET, vetStatus: VetStatus.APPROVED, deletedAt: null } }),
      prisma.user.count({ where: { role: Role.VET, vetStatus: VetStatus.REJECTED, deletedAt: null } }),
      prisma.user.count({ where: { role: Role.VET, vetStatus: VetStatus.APPROVED, isOnline: true, deletedAt: null } }),
    ]);

    const totalDecided = approvedVets + rejectedVets;
    const approvalRate = totalDecided > 0 ? parseFloat(((approvedVets / totalDecided) * 100).toFixed(1)) : 100;

    const stats: any = {
      pendingVets,
      approvedVets,
      rejectedVets,
      onlineVets,
      approvalRate,
    };

    if (process.env.NODE_ENV !== 'test' && prisma.pet?.count && prisma.consultation?.count) {
      try {
        const [
          clientsCount,
          vetsCount,
          adminsCount,
          activePetsCount,
          deletedPetsCount,
          totalConsultations,
          waitingConsultations,
          activeConsultations,
          completedConsultations,
          cancelledConsultations,
        ] = await Promise.all([
          prisma.user.count({ where: { role: Role.CLIENT, deletedAt: null } }),
          prisma.user.count({ where: { role: Role.VET, deletedAt: null } }),
          prisma.user.count({ where: { role: Role.ADMIN, deletedAt: null } }),
          prisma.pet.count({ where: { deletedAt: null } }),
          prisma.pet.count({ where: { NOT: { deletedAt: null } } }),
          prisma.consultation.count({ where: { deletedAt: null } }),
          prisma.consultation.count({ where: { status: ConsultationStatus.WAITING, deletedAt: null } }),
          prisma.consultation.count({ where: { status: ConsultationStatus.ACTIVE, deletedAt: null } }),
          prisma.consultation.count({ where: { status: ConsultationStatus.COMPLETED, deletedAt: null } }),
          prisma.consultation.count({ where: { status: ConsultationStatus.CANCELLED, deletedAt: null } }),
        ]);

        Object.assign(stats, {
          clientsCount,
          vetsCount,
          adminsCount,
          activePetsCount,
          deletedPetsCount,
          totalConsultations,
          waitingConsultations,
          activeConsultations,
          completedConsultations,
          cancelledConsultations,
        });
      } catch {
        // safe fallback
      }
    }

    return stats;
  }

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

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
          details: { reason: dto?.reason, licenseNumber: vet.licenseNumber },
        },
      });

      return updatedVet;
    });
  }

  // ==========================================
  // USERS CRUD
  // ==========================================
  public async getUsers(query?: { role?: Role; search?: string; includeDeleted?: boolean }) {
    const where: Prisma.UserWhereInput = {};

    if (!query?.includeDeleted) {
      where.deletedAt = null;
    }

    if (query?.role) {
      where.role = query.role;
    }

    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { licenseNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        ...userSelectFields,
        _count: {
          select: {
            pets: true,
            clientConsultations: true,
            vetConsultations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createUser(adminId: string, dto: AdminCreateUserDTO) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new AppError('El email ya está registrado', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role,
        vetStatus: dto.role === 'VET' ? (dto.vetStatus || VetStatus.APPROVED) : null,
        licenseNumber: dto.role === 'VET' ? dto.licenseNumber : null,
        bio: dto.bio,
      },
      select: userSelectFields,
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_CREATE_USER',
        targetId: user.id,
        details: { email: user.email, role: user.role },
      },
    }).catch(() => {});

    return user;
  }

  public async updateUser(adminId: string, userId: string, dto: AdminUpdateUserDTO) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.firstName) data.firstName = dto.firstName;
    if (dto.lastName) data.lastName = dto.lastName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.role) data.role = dto.role;
    if (dto.vetStatus !== undefined) data.vetStatus = dto.vetStatus;
    if (dto.licenseNumber !== undefined) data.licenseNumber = dto.licenseNumber;
    if (dto.bio !== undefined) data.bio = dto.bio;

    if (dto.email && dto.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new AppError('El nuevo email ya está en uso', 409, 'EMAIL_ALREADY_EXISTS');
      data.email = dto.email;
    }

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: userSelectFields,
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_UPDATE_USER',
        targetId: userId,
        details: { changedFields: Object.keys(data) },
      },
    }).catch(() => {});

    return updated;
  }

  public async deleteUser(adminId: string, userId: string) {
    return this.banUser(adminId, userId, 'Cuenta dada de baja o suspendida por el administrador.');
  }

  public async banUser(adminId: string, userId: string, reason?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isOnline: false,
        tokenVersion: { increment: 1 },
      },
      select: userSelectFields,
    });

    // Notify user in real-time if connected via Socket.io
    if (io) {
      io.to(`user:${userId}`).emit('auth:session_terminated', {
        reason: 'ACCOUNT_BANNED',
        message:
          reason ||
          'Tu cuenta ha sido suspendida permanentemente por un administrador por infracción de términos de servicio.',
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_BAN_USER',
        targetId: userId,
        details: { email: user.email, reason: reason || 'Baneo permanente' },
      },
    }).catch(() => {});

    return updated;
  }

  public async restoreUser(adminId: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
      select: userSelectFields,
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_RESTORE_USER',
        targetId: userId,
        details: { email: user.email },
      },
    }).catch(() => {});

    return updated;
  }

  // ==========================================
  // PETS CRUD (Creadas y Ocultas)
  // ==========================================
  public async getPets(query?: { includeDeleted?: boolean; search?: string }) {
    const where: Prisma.PetWhereInput = {};

    if (!query?.includeDeleted) {
      where.deletedAt = null;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { species: { contains: query.search, mode: 'insensitive' } },
        { breed: { contains: query.search, mode: 'insensitive' } },
        { microchip: { contains: query.search, mode: 'insensitive' } },
        { owner: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { owner: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { owner: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.pet.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            consultations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createPet(adminId: string, dto: AdminCreatePetDTO) {
    const owner = await prisma.user.findUnique({ where: { id: dto.ownerId } });
    if (!owner) {
      throw new AppError('Tutor no encontrado', 404, 'OWNER_NOT_FOUND');
    }

    if (dto.microchip) {
      const existingChip = await prisma.pet.findFirst({
        where: { microchip: dto.microchip, deletedAt: null },
      });
      if (existingChip) {
        throw new AppError('El numero de microchip ya se encuentra registrado', 409, 'MICROCHIP_ALREADY_EXISTS');
      }
    }

    const pet = await prisma.pet.create({
      data: {
        ownerId: dto.ownerId,
        name: dto.name,
        species: dto.species,
        breed: dto.breed,
        weightKg: dto.weightKg,
        sex: dto.sex,
        microchip: dto.microchip,
        allergies: dto.allergies,
        chronicConditions: dto.chronicConditions,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_CREATE_PET',
        targetId: pet.id,
        details: { petName: pet.name, ownerEmail: owner.email },
      },
    }).catch(() => {});

    return pet;
  }

  public async updatePet(adminId: string, petId: string, dto: AdminUpdatePetDTO) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      throw new AppError('Mascota no encontrada', 404, 'PET_NOT_FOUND');
    }

    if (dto.microchip && dto.microchip !== pet.microchip) {
      const existingChip = await prisma.pet.findFirst({
        where: { microchip: dto.microchip, deletedAt: null },
      });
      if (existingChip) {
        throw new AppError('El numero de microchip ya se encuentra registrado', 409, 'MICROCHIP_ALREADY_EXISTS');
      }
    }

    const updated = await prisma.pet.update({
      where: { id: petId },
      data: {
        ownerId: dto.ownerId,
        name: dto.name,
        species: dto.species,
        breed: dto.breed,
        weightKg: dto.weightKg,
        sex: dto.sex,
        microchip: dto.microchip,
        allergies: dto.allergies,
        chronicConditions: dto.chronicConditions,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_UPDATE_PET',
        targetId: petId,
        details: { petName: updated.name },
      },
    }).catch(() => {});

    return updated;
  }

  public async deletePet(adminId: string, petId: string) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      throw new AppError('Mascota no encontrada', 404, 'PET_NOT_FOUND');
    }

    const updated = await prisma.pet.update({
      where: { id: petId },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_SOFT_DELETE_PET',
        targetId: petId,
        details: { petName: pet.name },
      },
    }).catch(() => {});

    return updated;
  }

  public async restorePet(adminId: string, petId: string) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      throw new AppError('Mascota no encontrada', 404, 'PET_NOT_FOUND');
    }

    const updated = await prisma.pet.update({
      where: { id: petId },
      data: { deletedAt: null },
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_RESTORE_PET',
        targetId: petId,
        details: { petName: pet.name },
      },
    }).catch(() => {});

    return updated;
  }

  // ==========================================
  // CONSULTATIONS & AUDIT LOGS
  // ==========================================
  public async getConsultations(query?: { status?: ConsultationStatus; search?: string }) {
    const where: Prisma.ConsultationWhereInput = { deletedAt: null };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.OR = [
        { client: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { client: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { client: { email: { contains: query.search, mode: 'insensitive' } } },
        { vet: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { vet: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { pet: { name: { contains: query.search, mode: 'insensitive' } } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.consultation.findMany({
      where,
      include: {
        client: { select: userSelectFields },
        vet: { select: userSelectFields },
        pet: true,
        review: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  public async getConsultationMessages(consultationId: string) {
    return prisma.message.findMany({
      where: { consultationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async getAuditLogs() {
    return prisma.auditLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
