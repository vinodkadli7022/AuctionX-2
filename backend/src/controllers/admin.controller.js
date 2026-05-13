import { bidService } from '../services/bid.service.js';
import { auctionService } from '../services/auction.service.js';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const adminController = {
  getBidsForPlayer: asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    const state = await auctionService.getLiveState();
    const sessionId = state?.sessionId || req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId required' });
    }

    const bids = await bidService.getBidHistory(sessionId, playerId);
    new ApiResponse(200, bids).send(res);
  }),

  getStats: asyncHandler(async (_req, res) => {
    const { rows: [stats] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM players WHERE status = 'sold') AS players_sold,
        (SELECT COUNT(*) FROM players WHERE status = 'unsold') AS players_unsold,
        (SELECT COUNT(*) FROM players WHERE status = 'upcoming') AS players_upcoming,
        (SELECT COUNT(*) FROM bids) AS total_bids,
        (SELECT COALESCE(SUM(sold_price), 0) FROM players WHERE status = 'sold') AS total_purse_spent
    `);
    new ApiResponse(200, stats).send(res);
  }),
};
