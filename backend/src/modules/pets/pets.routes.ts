import { Router } from 'express';
import { PetsController } from './pets.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const controller = new PetsController();

router.use(authenticate);

router.post('/', controller.create);
router.get('/', controller.listMine);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
