import { Router } from 'express';
import { franchiseController } from '../controllers/franchise.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', franchiseController.getAllFranchises);
router.get('/standings', franchiseController.getPurseStandings);
router.get('/:id', franchiseController.getFranchiseById);
router.get('/:id/squad', authMiddleware, franchiseController.getSquad);

export default router;
