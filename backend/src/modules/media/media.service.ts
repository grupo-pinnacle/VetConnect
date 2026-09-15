import fs from 'fs';
import path from 'path';
import { User, Role } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';

const MAX_DAILY_BYTES = 50 * 1024 * 1024; // 50 MB in bytes
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export class MediaService {
  public async uploadMediaFile(
    user: User,
    file: Express.Multer.File,
    consultationId?: string
  ) {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const fileSizeBigInt = BigInt(file.size);

    // 1. Check daily upload counter (RNF-06)
    const counter = await prisma.dailyUploadCounter.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    const currentTotalBytes = counter ? counter.totalBytes : BigInt(0);
    if (currentTotalBytes + fileSizeBigInt > BigInt(MAX_DAILY_BYTES)) {
      // Delete temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new AppError('Cuota diaria de subida superada (maximo 50 MB por dia)', 429, 'UPLOAD_QUOTA_EXCEEDED');
    }

    // 2. Validate consultation if provided
    if (consultationId) {
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
      });

      if (!consultation || consultation.deletedAt) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new AppError('Consulta no encontrada', 404, 'CONSULTATION_NOT_FOUND');
      }

      const isParticipant =
        consultation.clientId === user.id ||
        consultation.vetId === user.id ||
        user.role === Role.ADMIN;

      if (!isParticipant) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new AppError('Acceso denegado: no eres participante de la consulta', 403, 'FORBIDDEN');
      }
    }

    // 3. Move file from `./uploads/tmp/` to `./uploads/`
    const finalFileName = `${Date.now()}-${path.basename(file.path)}`;
    const finalPath = path.join(uploadsDir, finalFileName);
    fs.renameSync(file.path, finalPath);

    // 4. Update daily upload counter atomically
    await prisma.dailyUploadCounter.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      create: {
        userId: user.id,
        date: today,
        count: 1,
        totalBytes: fileSizeBigInt,
      },
      update: {
        count: { increment: 1 },
        totalBytes: { increment: fileSizeBigInt },
      },
    });

    // 5. Persist MediaFile record in DB
    const mediaFile = await prisma.mediaFile.create({
      data: {
        ownerId: user.id,
        consultationId: consultationId || null,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        localPath: finalPath,
      },
    });

    return mediaFile;
  }

  public async getMediaFile(mediaId: string, requester: User) {
    const mediaFile = await prisma.mediaFile.findFirst({
      where: { id: mediaId, deletedAt: null },
      include: { consultation: true },
    });

    if (!mediaFile) {
      throw new AppError('Archivo no encontrado', 404, 'MEDIA_NOT_FOUND');
    }

    // Access control check (ADR-010):
    // Must be file owner, assigned vet for consultation, or admin
    const isOwner = mediaFile.ownerId === requester.id;
    const isAdmin = requester.role === Role.ADMIN;
    let isAssignedVet = false;

    if (mediaFile.consultation) {
      isAssignedVet = mediaFile.consultation.vetId === requester.id;
    }

    if (!isOwner && !isAdmin && !isAssignedVet) {
      throw new AppError('Acceso denegado al archivo medico', 403, 'FORBIDDEN');
    }

    if (!mediaFile.localPath || !fs.existsSync(mediaFile.localPath)) {
      throw new AppError('El archivo fisico no esta disponible en el servidor', 404, 'FILE_NOT_FOUND_ON_DISK');
    }

    return mediaFile;
  }
}
