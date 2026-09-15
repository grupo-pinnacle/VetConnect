import { Router } from 'express';
import { MediaController } from './media.controller';
import { uploadMiddleware, handleMulterError, verifyMagicBytes } from './media.middleware';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new MediaController();

router.use(authenticate);

router.post(
  '/',
  uploadMiddleware.single('file'),
  handleMulterError,
  verifyMagicBytes,
  controller.upload
);

router.get('/:id', controller.getById);

export default router;
