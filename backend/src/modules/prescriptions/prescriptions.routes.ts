import { Router } from 'express';
import { PrescriptionsController } from './prescriptions.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new PrescriptionsController();

router.use(authenticate);

router.post('/consultations/:id/prescriptions', controller.create);
router.get('/prescriptions/:id', controller.getById);

export default router;
