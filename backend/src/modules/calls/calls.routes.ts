import { Router } from 'express';
import { CallsController } from './calls.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new CallsController();

router.use(authenticate);

router.post('/:consultationId/token', controller.getToken);
router.post('/:consultationId/ring', controller.ring);

export default router;
