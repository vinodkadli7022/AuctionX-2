import { Router } from 'express';
import { auctionController } from '../controllers/auction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Public — state recovery for all clients
router.get('/session', auctionController.getSession);
router.get('/history', auctionController.getHistory);

// Auctioneer only
router.post('/session/start', authMiddleware, requireRole('auctioneer'), auctionController.startSession);
router.post('/session/end', authMiddleware, requireRole('auctioneer'), auctionController.endSession);
router.post('/nominate/:playerId', authMiddleware, requireRole('auctioneer'), auctionController.nominatePlayer);
router.post('/sold', authMiddleware, requireRole('auctioneer'), auctionController.soldPlayer);
router.post('/unsold', authMiddleware, requireRole('auctioneer'), auctionController.unsoldPlayer);
router.post('/pause', authMiddleware, requireRole('auctioneer'), auctionController.pauseSession);
router.post('/resume', authMiddleware, requireRole('auctioneer'), auctionController.resumeSession);

export default router;
