import { v4 as uuidv4 } from 'uuid';
import { redis, AUCTION_STATE_KEY, BID_LOCK_PREFIX, BID_LOCK_TTL_MS } from '../config/redis.js';
import { bidRepo } from '../repositories/bid.repo.js';
import { franchiseRepo } from '../repositories/franchise.repo.js';
import { ApiError } from '../utils/ApiError.js';
import { formatMoney } from '../utils/money.utils.js';
import { getTimerEndTimestamp, BID_EXTENSION_SECONDS } from '../utils/timer.utils.js';

const MIN_BID_INCREMENT = 5; // 5 Lakhs minimum increment

export const bidService = {
  /**
   * Process a bid atomically using Redis distributed lock.
   * Returns updated auction state on success.
   */
  async placeBid({ franchiseId, amount, sessionId }, io) {
    const lockKey = `${BID_LOCK_PREFIX}${sessionId}`;

    // Attempt to acquire distributed lock
    const lockAcquired = await redis.set(lockKey, '1', 'NX', 'PX', BID_LOCK_TTL_MS);
    if (!lockAcquired) {
      throw ApiError.conflict('Another bid is being processed. Please try again.');
    }

    try {
      // Read current state inside lock
      const raw = await redis.get(AUCTION_STATE_KEY);
      if (!raw) throw ApiError.badRequest('No active auction session');

      const state = JSON.parse(raw);

      // Validate session
      if (state.sessionId !== sessionId) throw ApiError.badRequest('Session mismatch');
      if (state.sessionStatus !== 'live') throw ApiError.badRequest('Session is not active');
      if (!state.currentPlayerId) throw ApiError.badRequest('No player currently nominated');

      // Validate timer
      if (state.timerEndTimestamp && Date.now() > state.timerEndTimestamp) {
        throw ApiError.badRequest('Bidding window has closed for this player');
      }

      // Validate bid amount
      // Rule: If it's the first bid, they can match the currentHighestBid (base price).
      // Otherwise, they must exceed it by at least the MIN_BID_INCREMENT.
      const isFirstBid = (state.bidCount || 0) === 0;
      const minRequired = isFirstBid ? state.currentHighestBid : state.currentHighestBid + MIN_BID_INCREMENT;

      if (amount < minRequired) {
        throw ApiError.badRequest(
          `Bid must be at least ${formatMoney(minRequired)}`
        );
      }

      // Validate franchise constraints (server-authoritative)
      const franchise = await franchiseRepo.findById(franchiseId);
      if (!franchise) throw ApiError.notFound('Franchise not found');

      if (franchise.purse_remaining < amount) {
        throw ApiError.badRequest(
          `Insufficient purse. Available: ${formatMoney(franchise.purse_remaining)}`
        );
      }

      if (franchise.squad_count >= 25) {
        throw ApiError.badRequest('Squad limit of 25 reached');
      }

      const player = state.currentPlayerData;
      if (player?.nationality === 'Overseas' && franchise.overseas_count >= 8) {
        throw ApiError.badRequest('Overseas player limit (8) reached');
      }

      // Extend timer on new bid (IPL rule: 10 seconds after each bid)
      const newTimerEnd = getTimerEndTimestamp(BID_EXTENSION_SECONDS);

      // Update Redis state atomically
      const newState = {
        ...state,
        currentHighestBid: amount,
        leadingFranchiseId: franchiseId,
        leadingFranchiseName: franchise.name,
        leadingFranchiseLogoUrl: franchise.logo_url,
        leadingFranchiseColor: franchise.primary_color,
        timerEndTimestamp: newTimerEnd,
        bidCount: (state.bidCount || 0) + 1,
      };

      await redis.set(AUCTION_STATE_KEY, JSON.stringify(newState));

      // Save bid to PostgreSQL asynchronously (don't block socket response)
      bidRepo.create({
        id: uuidv4(),
        sessionId,
        playerId: state.currentPlayerId,
        franchiseId,
        amount,
      }).catch(err => console.error('Async bid save error:', err));

      // Emit to all clients in session room
      const bidPayload = {
        amount,
        amountFormatted: formatMoney(amount),
        franchiseId,
        franchiseName: franchise.name,
        franchiseLogo: franchise.logo_url,
        franchiseColor: franchise.primary_color,
        newTimerEnd,
        bidCount: newState.bidCount,
        timestamp: new Date().toISOString(),
      };

      io.to(sessionId).emit('auction:bid-placed', bidPayload);

      return newState;
    } finally {
      // Always release the lock
      await redis.del(lockKey);
    }
  },

  async getBidHistory(sessionId, playerId) {
    return bidRepo.getForPlayer(sessionId, playerId);
  },

  async getLastBids(sessionId, playerId, n = 10) {
    return bidRepo.getLastN(sessionId, playerId, n);
  },
};
