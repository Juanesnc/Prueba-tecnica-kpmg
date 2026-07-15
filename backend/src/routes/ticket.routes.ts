import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { RoleName } from '../models/enums';
import {
  createTicketSchema,
  updateTicketSchema,
  listTicketsSchema,
} from '../validators/ticket.validator';

const router = Router();

// Todas las rutas de tickets requieren autenticación (JWT).
router.use(authenticate);

// Resumen estadístico. Debe ir antes de "/:id" para no colisionar.
router.get('/stats', asyncHandler(ticketController.stats));

router.get('/', validate(listTicketsSchema, 'query'), asyncHandler(ticketController.list));
router.post('/', validate(createTicketSchema), asyncHandler(ticketController.create));

router.get('/:id', asyncHandler(ticketController.getById));
router.put('/:id', validate(updateTicketSchema), asyncHandler(ticketController.update));

// RN-02: solo admin puede eliminar.
router.delete('/:id', authorize(RoleName.ADMIN), asyncHandler(ticketController.remove));

// HU-08: historial (solo lectura, RN-03).
router.get('/:id/history', asyncHandler(ticketController.history));

export default router;
