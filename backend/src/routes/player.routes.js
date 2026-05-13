import { Router } from 'express';
import multer from 'multer';
import { playerController } from '../controllers/player.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Both photo and CSV use memory storage — controller handles Cloudinary upload
const memStorage = multer.memoryStorage();
const uploadPhoto = multer({ storage: memStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadCSV   = multer({ storage: memStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/',              authMiddleware, playerController.getPlayers);
router.get('/upcoming',      authMiddleware, playerController.getUpcoming);
router.get('/sold-history',  playerController.getSoldHistory);
router.get('/:id',           authMiddleware, playerController.getPlayerById);

router.post(
  '/',
  authMiddleware,
  requireRole('auctioneer'),
  uploadPhoto.single('photo'),
  playerController.createPlayer
);

router.post(
  '/bulk-upload',
  authMiddleware,
  requireRole('auctioneer'),
  uploadCSV.single('csv'),
  playerController.bulkUpload
);

export default router;
