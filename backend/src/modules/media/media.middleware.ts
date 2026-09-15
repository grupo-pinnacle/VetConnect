import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler';

// Multer storage in `./uploads/tmp/`
const uploadTmpDir = path.resolve(process.cwd(), 'uploads/tmp');
if (!fs.existsSync(uploadTmpDir)) {
  fs.mkdirSync(uploadTmpDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadTmpDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file limit
  },
});

export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('El archivo excede el limite maximo de 10 MB', 413, 'FILE_TOO_LARGE'));
    }
  }
  next(err);
};

// Magic Bytes Verification Middleware
export const verifyMagicBytes = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('No se adjunto ningun archivo', 400, 'NO_FILE_PROVIDED'));
  }

  const filePath = req.file.path;

  try {
    const buffer = Buffer.alloc(32);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 32, 0);
    fs.closeSync(fd);

    const hex = buffer.toString('hex', 0, 8).toUpperCase();

    // Check Magic Bytes
    const isJpeg = hex.startsWith('FFD8FF');
    const isPng = hex.startsWith('89504E47');
    const isPdf = hex.startsWith('25504446');

    if (!isJpeg && !isPng && !isPdf) {
      // Clean up invalid temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return next(new AppError('Tipo de archivo no permitido. Solo se permiten formatos JPEG, PNG y PDF', 400, 'INVALID_FILE_TYPE'));
    }

    next();
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(new AppError('Error verificando la firma binaria del archivo', 400, 'MAGIC_BYTES_VERIFICATION_FAILED'));
  }
};
