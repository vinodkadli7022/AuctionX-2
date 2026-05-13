import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import { playerService } from '../services/player.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Upload a buffer to Cloudinary using the upload_stream API.
 * Returns the secure URL of the uploaded image.
 */
async function uploadBufferToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'auctionx/players',
        public_id: filename,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export const playerController = {
  getPlayers: asyncHandler(async (req, res) => {
    const { role, nationality, status, search, page = 1, limit = 20 } = req.query;
    const result = await playerService.getPlayers({ role, nationality, status, search, page: +page, limit: +limit });
    new ApiResponse(200, result).send(res);
  }),

  getPlayerById: asyncHandler(async (req, res) => {
    const player = await playerService.getPlayerById(req.params.id);
    new ApiResponse(200, player).send(res);
  }),

  createPlayer: asyncHandler(async (req, res) => {
    const { name, role, nationality, age, iplCaps, basePrice } = req.body;
    let photoUrl = null;

    if (req.file?.buffer) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      photoUrl = await uploadBufferToCloudinary(req.file.buffer, slug);
    }

    const player = await playerService.createPlayer(
      { name, role, nationality, age: +age, iplCaps: +(iplCaps || 0), basePrice: +basePrice },
      photoUrl
    );
    new ApiResponse(201, player, 'Player created successfully').send(res);
  }),

  bulkUpload: asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file required' });
    const result = await playerService.bulkUploadCSV(req.file.buffer);
    new ApiResponse(201, result, `${result.inserted} players uploaded successfully`).send(res);
  }),

  getUpcoming: asyncHandler(async (req, res) => {
    const players = await playerService.getUpcomingPlayers();
    new ApiResponse(200, players).send(res);
  }),

  getSoldHistory: asyncHandler(async (req, res) => {
    const players = await playerService.getSoldHistory();
    new ApiResponse(200, players).send(res);
  }),
};
