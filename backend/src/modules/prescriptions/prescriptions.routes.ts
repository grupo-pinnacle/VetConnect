import { Router } from 'express';
import { PrescriptionsController } from './prescriptions.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new PrescriptionsController();

router.post('/consultations/:id/prescriptions', authenticate, controller.create);
router.get('/prescriptions/:id', controller.getById);

export default router;
