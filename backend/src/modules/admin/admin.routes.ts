import { Router } from 'express';
import { Role } from '@prisma/client';
import { AdminController } from './admin.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

const router = Router();
const controller = new AdminController();

router.use(authenticate);
router.use(requireRole(Role.ADMIN));

// Stats & Audits
router.get('/stats', controller.getStats);
router.get('/audit-logs', controller.getAuditLogs);

// SENASA Vets Verification
router.get('/vets/pending', controller.getPendingVets);
router.patch('/vets/:id/approve', controller.approveVet);
router.patch('/vets/:id/reject', controller.rejectVet);

// Users Management (CRUD)
router.get('/users', controller.getUsers);
router.post('/users', controller.createUser);
router.patch('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);
router.patch('/users/:id/restore', controller.restoreUser);

// Pets Management (CRUD - Creadas y Ocultas)
router.get('/pets', controller.getPets);
router.post('/pets', controller.createPet);
router.patch('/pets/:id', controller.updatePet);
router.delete('/pets/:id', controller.deletePet);
router.patch('/pets/:id/restore', controller.restorePet);

// Consultations Management
router.get('/consultations', controller.getConsultations);

export default router;
