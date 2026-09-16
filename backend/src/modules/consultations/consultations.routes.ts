import { Router } from 'express';
import { ConsultationsController } from './consultations.controller';
import { authenticate } from '../auth/auth.middleware';
import { consultationRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();
const controller = new ConsultationsController();

router.use(authenticate);

router.post('/', consultationRateLimiter, controller.create);
router.get('/mine', controller.getMine);
router.get('/:id', controller.getById);
router.patch('/:id/assign', controller.assign);
router.patch('/:id/complete', controller.complete);
router.patch('/:id/cancel', controller.cancel);
router.post('/:id/review', controller.review);
router.get('/:id/messages', controller.getMessages);

export default router;
