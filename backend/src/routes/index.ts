import { Router } from 'express';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);

export default router;
