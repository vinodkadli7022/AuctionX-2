import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware, requireRole('auctioneer'));

router.get('/bids/:playerId', adminController.getBidsForPlayer);
router.get('/stats', adminController.getStats);

export default router;
