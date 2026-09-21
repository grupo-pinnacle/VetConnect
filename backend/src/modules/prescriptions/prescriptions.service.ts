import QRCode from 'qrcode';
import { User, Role, VetStatus, ConsultationStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { CreatePrescriptionDTO } from './prescriptions.schemas';

export class PrescriptionsService {
  public async createPrescription(
    consultationId: string,
    user: User,
    dto: CreatePrescriptionDTO
  ) {
    const isVet = user.role === Role.VET;
    const isAdmin = user.role === Role.ADMIN;

    if (!isVet && !isAdmin) {
      throw new AppError('Acceso denegado', 403, 'FORBIDDEN');
    }

    if (isVet && user.vetStatus !== VetStatus.APPROVED) {
      throw new AppError('Solo veterinarios con matricula aprobada pueden emitir recetas', 403, 'VET_NOT_APPROVED');
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
    }

    if (consultation.vetId !== user.id && !isAdmin) {
      throw new AppError('Solo el veterinario asignado a la consulta puede emitir la receta', 403, 'FORBIDDEN');
    }

    if (consultation.status !== ConsultationStatus.ACTIVE && consultation.status !== ConsultationStatus.COMPLETED) {
      throw new AppError('Solo se pueden emitir recetas durante o al finalizar la consulta', 400, 'INVALID_STATUS');
    }

    const prescription = await prisma.prescription.create({
      data: {
        consultationId,
        vetId: user.id,
        medication: dto.medication,
        dosage: dto.dosage,
        frequency: dto.frequency,
        durationDays: dto.durationDays,
        indications: dto.indications,
      },
      include: {
        vet: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            licenseNumber: true,
          },
        },
        consultation: {
          include: {
            pet: true,
            client: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    const verifyUrl = `https://app.vetconnect.com.ar/prescriptions/${prescription.id}`;
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    } catch (err) {
      console.error('Failed to generate QR code for prescription:', err);
    }

    return {
      ...prescription,
      qrCodeDataUrl,
      verifyUrl,
    };
  }

  public async getPrescriptionById(prescriptionId: string, _requester?: User) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        vet: {
          select: { id: true, firstName: true, lastName: true, licenseNumber: true },
        },
        consultation: {
          include: {
            pet: true,
            client: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new AppError('Receta no encontrada', 404, 'PRESCRIPTION_NOT_FOUND');
    }

    const verifyUrl = `https://app.vetconnect.com.ar/prescriptions/${prescription.id}`;
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    } catch (err) {
      console.error('Failed to generate QR code for prescription:', err);
    }

    return {
      ...prescription,
      qrCodeDataUrl,
      verifyUrl,
    };
  }
}
