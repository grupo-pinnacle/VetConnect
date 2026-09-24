import { Router } from 'express';
import { Role } from '@prisma/client';
import { AdminController } from './admin.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

const router = Router();
const controller = new AdminController();

router.use(authenticate);
router.use(requireRole(Role.ADMIN));

router.get('/stats', controller.getStats);
router.get('/vets/pending', controller.getPendingVets);
router.patch('/vets/:id/approve', controller.approveVet);
router.patch('/vets/:id/reject', controller.rejectVet);

export default router;
