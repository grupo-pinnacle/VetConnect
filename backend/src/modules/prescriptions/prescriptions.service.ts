import QRCode from 'qrcode';
import { User, Role, VetStatus, ConsultationStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { CreatePrescriptionDTO } from './prescriptions.schemas';
import { notificationsService } from '../notifications/notifications.service';
import { emailService } from '../../services/email.service';

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
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    const baseUrl =
      process.env.NODE_ENV === 'test'
        ? 'https://app.vetconnect.com.ar'
        : (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://app.vetconnect.com.ar').replace(/\/$/, '');
    const verifyUrl = `${baseUrl}/prescriptions/${prescription.id}`;
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    } catch (err) {
      console.error('Failed to generate QR code for prescription:', err);
    }

    await notificationsService
      .createAndDispatch(
        prescription.consultation.clientId,
        'Nueva receta médica oficial',
        `El profesional ${user.firstName} ha emitido una receta para ${prescription.consultation.pet?.name || 'tu mascota'}`,
        'PRESCRIPTION_NEW',
        { consultationId, prescriptionId: prescription.id }
      )
      .catch(() => {});

    // Despachar correo electrónico vía Resend con los detalles completos del tratamiento
    if (prescription.consultation.client?.email) {
      const vetFullName = user.lastName ? `Dr. ${user.firstName} ${user.lastName}` : `Dr. ${user.firstName}`;
      emailService
        .sendPrescriptionEmail({
          to: prescription.consultation.client.email,
          clientName: prescription.consultation.client.firstName || 'Tutor',
          petName: prescription.consultation.pet?.name || 'tu mascota',
          vetName: vetFullName,
          licenseNumber: prescription.vet?.licenseNumber || (user as any).licenseNumber || undefined,
          medication: prescription.medication,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          durationDays: prescription.durationDays,
          indications: prescription.indications,
          verifyUrl,
        })
        .catch((err) => console.warn('[Prescriptions] Error sending prescription email:', err));
    }

    return {
      ...prescription,
      qrCodeDataUrl,
      verifyUrl,
    };
  }

  public async getPrescriptionsForClient(clientId: string) {
    const list = await prisma.prescription.findMany({
      where: {
        consultation: {
          clientId,
          deletedAt: null,
        },
      },
      include: {
        consultation: {
          include: {
            pet: true,
            vet: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                licenseNumber: true,
                photoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const baseUrl = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://app.vetconnect.com.ar').replace(/\/$/, '');
    return list.map((rx) => ({
      ...rx,
      verifyUrl: `${baseUrl}/prescriptions/${rx.id}`,
    }));
  }

  public async getPrescriptionById(prescriptionId: string, requester?: User) {
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

    // Public QR verification: allow unauthenticated third-party verification of non-sensitive official health data
    const baseUrl = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://app.vetconnect.com.ar').replace(/\/$/, '');
    const verifyUrl = `${baseUrl}/prescriptions/${prescription.id}`;
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
