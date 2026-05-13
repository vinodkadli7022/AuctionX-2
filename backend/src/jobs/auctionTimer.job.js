import { redis, AUCTION_STATE_KEY } from '../config/redis.js';
import { getSecondsRemaining } from '../utils/timer.utils.js';

/**
 * Server-side auction countdown timer.
 * Reads timer end timestamp from Redis every second.
 * On expiry, auto-calls sold or unsold logic.
 */
export function startAuctionTimer(sessionId, playerId, io) {
  // Clear any existing timer
  if (global.auctionTimerInterval) {
    clearInterval(global.auctionTimerInterval);
    global.auctionTimerInterval = null;
  }

  global.auctionTimerInterval = setInterval(async () => {
    try {
      const raw = await redis.get(AUCTION_STATE_KEY);
      if (!raw) {
        clearInterval(global.auctionTimerInterval);
        global.auctionTimerInterval = null;
        return;
      }

      const state = JSON.parse(raw);

      // Stop if session is no longer live or player changed
      if (state.sessionStatus !== 'live' || state.currentPlayerId !== playerId) {
        clearInterval(global.auctionTimerInterval);
        global.auctionTimerInterval = null;
        return;
      }

      if (!state.timerEndTimestamp) return;

      const secondsRemaining = getSecondsRemaining(state.timerEndTimestamp);

      // Emit timer tick
      io.to(sessionId).emit('auction:timer-tick', { secondsRemaining });

      // Timer expired — auto-process
      if (secondsRemaining <= 0) {
        clearInterval(global.auctionTimerInterval);
        global.auctionTimerInterval = null;

        // Dynamically import to avoid circular deps
        const { auctionService } = await import('../services/auction.service.js');

        if (state.leadingFranchiseId) {
          console.log(`⏱️  Timer expired — auto-sold player ${playerId}`);
          await auctionService.soldPlayer(io);
        } else {
          console.log(`⏱️  Timer expired — auto-unsold player ${playerId}`);
          await auctionService.unsoldPlayer(io);
        }
      }
    } catch (err) {
      console.error('Timer job error:', err.message);
    }
  }, 1000);

  console.log(`⏱️  Auction timer started for player ${playerId}`);
}

export function stopAuctionTimer() {
  if (global.auctionTimerInterval) {
    clearInterval(global.auctionTimerInterval);
    global.auctionTimerInterval = null;
    console.log('⏱️  Auction timer stopped');
  }
}
