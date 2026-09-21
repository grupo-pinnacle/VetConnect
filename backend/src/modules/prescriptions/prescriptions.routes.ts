import { Router } from 'express';
import { PrescriptionsController } from './prescriptions.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new PrescriptionsController();

// Public QR verification endpoint for third-party pharmacies / official scans
router.get('/prescriptions/:id', controller.getByIdPublic);

// Authenticated creation of official digital prescriptions
router.post('/consultations/:id/prescriptions', authenticate, controller.create);

export default router;
