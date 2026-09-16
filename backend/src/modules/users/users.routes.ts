import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new UsersController();

router.use(authenticate);

router.patch('/profile', controller.updateProfile);

export default router;
