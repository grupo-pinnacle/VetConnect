import { ConsultationStatus, Role, VetStatus, User, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import {
  CreateConsultationDTO,
  CompleteConsultationDTO,
  CancelConsultationDTO,
  ReviewConsultationDTO,
} from './consultations.schemas';

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  vetStatus: true,
  licenseNumber: true,
  ratingAvg: true,
  ratingCount: true,
  photoUrl: true,
};

export class ConsultationsService {
  public async createConsultation(clientId: string, dto: CreateConsultationDTO) {
    const pet = await prisma.pet.findFirst({
      where: { id: dto.petId, ownerId: clientId, deletedAt: null },
    });

    if (!pet) {
      throw new AppError('Mascota no encontrada o no pertenece al usuario', 404, 'PET_NOT_FOUND');
    }

    const activeCons = await prisma.consultation.findFirst({
      where: {
        petId: dto.petId,
        status: { in: [ConsultationStatus.WAITING, ConsultationStatus.ACTIVE] },
        deletedAt: null,
      },
    });

    if (activeCons) {
      const checkedCons = await this.checkTriageTimeout(activeCons.id);
      if (checkedCons && (checkedCons.status === ConsultationStatus.WAITING || checkedCons.status === ConsultationStatus.ACTIVE)) {
        throw new AppError('La mascota ya cuenta con una consulta activa o en sala de espera', 409, 'CONSULTATION_ALREADY_ACTIVE');
      }
    }

    const availableVet = await prisma.user.findFirst({
      where: {
        role: Role.VET,
        vetStatus: VetStatus.APPROVED,
        isOnline: true,
        deletedAt: null,
      },
      orderBy: { lastSeen: 'desc' },
    });

    const status = availableVet ? ConsultationStatus.ACTIVE : ConsultationStatus.WAITING;
    const startedAt = availableVet ? new Date() : null;

    const consultation = await prisma.consultation.create({
      data: {
        clientId,
        vetId: availableVet ? availableVet.id : null,
        petId: dto.petId,
        notes: dto.notes,
        status,
        startedAt,
      },
      include: {
        pet: true,
        client: { select: userSelectFields },
        vet: { select: userSelectFields },
      },
    });

    return consultation;
  }

  public async checkTriageTimeout(consultationId: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.status !== ConsultationStatus.WAITING) {
      return consultation;
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (consultation.createdAt < fifteenMinutesAgo) {
      return prisma.consultation.update({
        where: { id: consultationId },
        data: {
          status: ConsultationStatus.CANCELLED,
          endedAt: new Date(),
          notes: consultation.notes
            ? `${consultation.notes} [CANCELLED_TIMEOUT_NO_VET_AVAILABLE]`
            : '[CANCELLED_TIMEOUT_NO_VET_AVAILABLE]',
        },
      });
    }

    return consultation;
  }

  public async checkVetDisconnectTimeout(consultationId: string, disconnectedAt: Date) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.status !== ConsultationStatus.ACTIVE) {
      return consultation;
    }

    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    if (disconnectedAt < threeMinutesAgo) {
      return prisma.consultation.update({
        where: { id: consultationId },
        data: {
          status: ConsultationStatus.CANCELLED,
          endedAt: new Date(),
          notes: consultation.notes
            ? `${consultation.notes} [VET_DISCONNECTED_TIMEOUT]`
            : '[VET_DISCONNECTED_TIMEOUT]',
        },
      });
    }

    return consultation;
  }

  public async assignConsultation(consultationId: string, vetUser: User) {
    if (vetUser.role !== Role.VET || vetUser.vetStatus !== VetStatus.APPROVED) {
      throw new AppError('Solo veterinarios aprobados pueden atender consultas', 403, 'VET_NOT_APPROVED');
    }

    await this.checkTriageTimeout(consultationId);

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    if (consultation.status !== ConsultationStatus.WAITING) {
      throw new AppError('La consulta no se encuentra en sala de espera', 400, 'INVALID_STATUS');
    }

    return prisma.consultation.update({
      where: { id: consultationId },
      data: {
        vetId: vetUser.id,
        status: ConsultationStatus.ACTIVE,
        startedAt: new Date(),
      },
      include: {
        pet: true,
        client: { select: userSelectFields },
        vet: { select: userSelectFields },
      },
    });
  }

  public async completeConsultation(consultationId: string, vetUser: User, dto: CompleteConsultationDTO) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    if (consultation.vetId !== vetUser.id && vetUser.role !== Role.ADMIN) {
      throw new AppError('Solo el veterinario asignado puede finalizar la consulta', 403, 'FORBIDDEN');
    }

    if (consultation.status !== ConsultationStatus.ACTIVE) {
      throw new AppError('Solo se pueden finalizar consultas en estado ACTIVE', 400, 'INVALID_STATUS');
    }

    return prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: ConsultationStatus.COMPLETED,
        endedAt: new Date(),
        diagnosisNotes: dto.diagnosisNotes,
      },
      include: {
        pet: true,
        client: { select: userSelectFields },
        vet: { select: userSelectFields },
      },
    });
  }

  public async cancelConsultation(consultationId: string, requester: User, dto?: CancelConsultationDTO) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    const isClient = consultation.clientId === requester.id;
    const isVet = consultation.vetId === requester.id;
    const isAdmin = requester.role === Role.ADMIN;

    if (!isClient && !isVet && !isAdmin) {
      throw new AppError('Acceso denegado', 403, 'FORBIDDEN');
    }

    if (consultation.status === ConsultationStatus.COMPLETED || consultation.status === ConsultationStatus.CANCELLED) {
      throw new AppError('La consulta ya ha finalizado', 400, 'CONSULTATION_ALREADY_ENDED');
    }

    const reasonText = dto?.reason ? ` [Razón: ${dto.reason}]` : '';

    return prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: ConsultationStatus.CANCELLED,
        endedAt: new Date(),
        notes: consultation.notes ? `${consultation.notes}${reasonText}` : reasonText,
      },
    });
  }

  public async getConsultationById(consultationId: string, requester: User) {
    await this.checkTriageTimeout(consultationId);

    const consultation = await prisma.consultation.findFirst({
      where: { id: consultationId, deletedAt: null },
      include: {
        pet: true,
        client: { select: userSelectFields },
        vet: { select: userSelectFields },
        prescriptions: true,
        review: true,
      },
    });

    if (!consultation) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    const isClient = consultation.clientId === requester.id;
    const isVet = consultation.vetId === requester.id;
    const isAdmin = requester.role === Role.ADMIN;

    if (!isClient && !isVet && !isAdmin) {
      throw new AppError('Acceso denegado', 403, 'FORBIDDEN');
    }

    return consultation;
  }

  public async getMine(requester: User) {
    if (requester.role === Role.VET) {
      const waitingList = await prisma.consultation.findMany({
        where: { status: ConsultationStatus.WAITING, deletedAt: null },
      });

      for (const cons of waitingList) {
        await this.checkTriageTimeout(cons.id);
      }

      return prisma.consultation.findMany({
        where: {
          OR: [{ vetId: requester.id }, { status: ConsultationStatus.WAITING }],
          deletedAt: null,
        },
        include: { pet: true, client: { select: userSelectFields } },
        orderBy: { createdAt: 'desc' },
      });
    }

    const clientWaitingList = await prisma.consultation.findMany({
      where: { clientId: requester.id, status: ConsultationStatus.WAITING, deletedAt: null },
    });

    for (const cons of clientWaitingList) {
      await this.checkTriageTimeout(cons.id);
    }

    return prisma.consultation.findMany({
      where: { clientId: requester.id, deletedAt: null },
      include: { pet: true, vet: { select: userSelectFields } },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createReview(consultationId: string, clientUser: User, dto: ReviewConsultationDTO) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { review: true },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    if (consultation.clientId !== clientUser.id) {
      throw new AppError('Solo el tutor asignado puede calificar la consulta', 403, 'FORBIDDEN');
    }

    if (consultation.status !== ConsultationStatus.COMPLETED) {
      throw new AppError('Solo se pueden calificar consultas completadas', 400, 'CONSULTATION_NOT_COMPLETED');
    }

    if (!consultation.vetId) {
      throw new AppError('La consulta no posee un veterinario asignado', 400, 'NO_VET_ASSIGNED');
    }

    if (consultation.review) {
      throw new AppError('La consulta ya ha sido calificada anteriormente', 409, 'REVIEW_ALREADY_EXISTS');
    }

    // Atomic transaction (ADR-019 & ADR-023)
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const review = await tx.review.create({
        data: {
          consultationId,
          clientId: clientUser.id,
          vetId: consultation.vetId!,
          rating: dto.rating,
          comment: dto.comment || null,
        },
      });

      // Recalculate VET ratingAvg and ratingCount
      const allVetReviews = await tx.review.findMany({
        where: { vetId: consultation.vetId! },
        select: { rating: true },
      });

      const ratingCount = allVetReviews.length;
      const totalStars = allVetReviews.reduce((sum, r) => sum + r.rating, 0);
      const ratingAvg = ratingCount > 0 ? parseFloat((totalStars / ratingCount).toFixed(2)) : 0;

      await tx.user.update({
        where: { id: consultation.vetId! },
        data: {
          ratingAvg,
          ratingCount,
        },
      });

      return review;
    });
  }

  public async getMessages(consultationId: string, requester: User, afterIsoString?: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    const isClient = consultation.clientId === requester.id;
    const isVet = consultation.vetId === requester.id;
    const isAdmin = requester.role === Role.ADMIN;

    if (!isClient && !isVet && !isAdmin) {
      throw new AppError('Acceso denegado', 403, 'FORBIDDEN');
    }

    const whereFilter: any = {
      consultationId,
      deletedAt: null,
    };

    if (afterIsoString) {
      whereFilter.createdAt = {
        gt: new Date(afterIsoString),
      };
    }

    return prisma.message.findMany({
      where: whereFilter,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });
  }
}
