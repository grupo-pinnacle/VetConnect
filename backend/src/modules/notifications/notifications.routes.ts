import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new NotificationsController();

router.use(authenticate);

router.post('/register-token', controller.registerToken);
router.get('/', controller.listMine);
router.patch('/:id/read', controller.markRead);

export default router;
