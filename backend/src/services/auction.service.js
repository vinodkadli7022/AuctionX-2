import { v4 as uuidv4 } from 'uuid';
import { redis, AUCTION_STATE_KEY } from '../config/redis.js';
import { auctionRepo } from '../repositories/auction.repo.js';
import { playerRepo } from '../repositories/player.repo.js';
import { franchiseRepo } from '../repositories/franchise.repo.js';
import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { formatMoney } from '../utils/money.utils.js';
import { getTimerEndTimestamp, BID_EXTENSION_SECONDS } from '../utils/timer.utils.js';

export const auctionService = {
  async getLiveState() {
    const raw = await redis.get(AUCTION_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  },

  async setLiveState(state) {
    await redis.set(AUCTION_STATE_KEY, JSON.stringify(state));
  },

  async startSession(name) {
    // Check no active session exists
    const existing = await auctionRepo.findActiveSession();
    if (existing) throw ApiError.conflict('An active auction session already exists');

    const sessionId = uuidv4();
    const session = await auctionRepo.createSession({ id: sessionId, name });
    await auctionRepo.updateStatus(sessionId, 'live');

    const initialState = {
      sessionId,
      sessionName: name,
      sessionStatus: 'live',
      currentPlayerId: null,
      currentPlayerData: null,
      currentHighestBid: 0,
      leadingFranchiseId: null,
      leadingFranchiseName: null,
      leadingFranchiseLogoUrl: null,
      leadingFranchiseColor: null,
      timerEndTimestamp: null,
      bidCount: 0,
    };

    await this.setLiveState(initialState);
    return { session, state: initialState };
  },

  async nominatePlayer(playerId, io) {
    const state = await this.getLiveState();
    if (!state) throw ApiError.badRequest('No active auction session');
    if (state.sessionStatus !== 'live') throw ApiError.badRequest('Session is not live');

    const player = await playerRepo.findById(playerId);
    if (!player) throw ApiError.notFound('Player not found');
    if (player.status !== 'upcoming') throw ApiError.conflict(`Player status is "${player.status}", not upcoming`);

    // Stop existing timer job if running
    if (global.auctionTimerInterval) {
      clearInterval(global.auctionTimerInterval);
      global.auctionTimerInterval = null;
    }

    await playerRepo.updateStatus(playerId, 'in-auction');
    await auctionRepo.setCurrentPlayer(state.sessionId, playerId);

    const timerEndTimestamp = getTimerEndTimestamp(30);

    const newState = {
      ...state,
      currentPlayerId: playerId,
      currentPlayerData: player,
      currentHighestBid: player.base_price,
      leadingFranchiseId: null,
      leadingFranchiseName: null,
      leadingFranchiseLogoUrl: null,
      leadingFranchiseColor: null,
      timerEndTimestamp,
      bidCount: 0,
    };

    await this.setLiveState(newState);

    // Start server-side timer
    const { startAuctionTimer } = await import('../jobs/auctionTimer.job.js');
    startAuctionTimer(state.sessionId, playerId, io);

    return newState;
  },

  async soldPlayer(io) {
    const state = await this.getLiveState();
    if (!state) throw ApiError.badRequest('No active auction session');
    if (!state.currentPlayerId) throw ApiError.badRequest('No player currently nominated');
    if (!state.leadingFranchiseId) throw ApiError.badRequest('No bids placed for this player');

    // Stop timer
    if (global.auctionTimerInterval) {
      clearInterval(global.auctionTimerInterval);
      global.auctionTimerInterval = null;
    }

    const { playerId, leadingFranchiseId, currentHighestBid, sessionId } = state;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate franchise constraints
      const franchise = await franchiseRepo.findById(leadingFranchiseId);
      if (!franchise) throw ApiError.notFound('Leading franchise not found');
      if (franchise.purse_remaining < currentHighestBid) {
        throw ApiError.badRequest('Franchise has insufficient purse for final price');
      }

      const player = state.currentPlayerData;
      const isOverseas = player.nationality === 'Overseas';

      if (isOverseas && franchise.overseas_count >= 8) {
        throw ApiError.badRequest('Franchise has reached overseas player limit');
      }
      if (franchise.squad_count >= 25) {
        throw ApiError.badRequest('Franchise has reached squad limit');
      }

      // Atomic DB operations
      await playerRepo.markSold(state.currentPlayerId, leadingFranchiseId, currentHighestBid);
      await franchiseRepo.deductPurse(leadingFranchiseId, currentHighestBid, client);
      if (isOverseas) await franchiseRepo.incrementOverseas(leadingFranchiseId, client);
      await franchiseRepo.addToSquad({
        id: uuidv4(),
        franchiseId: leadingFranchiseId,
        playerId: state.currentPlayerId,
        pricePaid: currentHighestBid,
      }, client);
      await auctionRepo.clearCurrentPlayer(sessionId);

      await client.query('COMMIT');

      // Update franchise data
      const updatedFranchise = await franchiseRepo.findById(leadingFranchiseId);

      // Update Redis state
      const newState = {
        ...state,
        currentPlayerId: null,
        currentPlayerData: null,
        currentHighestBid: 0,
        leadingFranchiseId: null,
        leadingFranchiseName: null,
        leadingFranchiseLogoUrl: null,
        timerEndTimestamp: null,
        bidCount: 0,
      };
      await this.setLiveState(newState);

      // Emit events
      const soldPayload = {
        player: { ...player, status: 'sold', sold_price: currentHighestBid, sold_price_formatted: formatMoney(currentHighestBid) },
        franchise: { id: franchise.id, name: franchise.name, shortName: franchise.short_name, logoUrl: franchise.logo_url, primaryColor: franchise.primary_color },
        finalPrice: currentHighestBid,
        finalPriceFormatted: formatMoney(currentHighestBid),
      };

      io.to(sessionId).emit('auction:player-sold', soldPayload);
      io.to(`franchise:${leadingFranchiseId}`).emit('franchise:purse-updated', {
        franchiseId: leadingFranchiseId,
        purseRemaining: updatedFranchise.purse_remaining,
        purseRemainingFormatted: formatMoney(updatedFranchise.purse_remaining),
        squadCount: updatedFranchise.squad_count,
        overseasCount: updatedFranchise.overseas_count,
      });

      return soldPayload;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async unsoldPlayer(io) {
    const state = await this.getLiveState();
    if (!state) throw ApiError.badRequest('No active auction session');
    if (!state.currentPlayerId) throw ApiError.badRequest('No player currently nominated');

    // Stop timer
    if (global.auctionTimerInterval) {
      clearInterval(global.auctionTimerInterval);
      global.auctionTimerInterval = null;
    }

    await playerRepo.markUnsold(state.currentPlayerId);
    await auctionRepo.clearCurrentPlayer(state.sessionId);

    const player = state.currentPlayerData;
    const newState = {
      ...state,
      currentPlayerId: null,
      currentPlayerData: null,
      currentHighestBid: 0,
      leadingFranchiseId: null,
      leadingFranchiseName: null,
      timerEndTimestamp: null,
      bidCount: 0,
    };
    await this.setLiveState(newState);

    io.to(state.sessionId).emit('auction:player-unsold', { player });
    return player;
  },

  async pauseSession(io) {
    const state = await this.getLiveState();
    if (!state) throw ApiError.badRequest('No active auction session');

    if (global.auctionTimerInterval) {
      clearInterval(global.auctionTimerInterval);
      global.auctionTimerInterval = null;
    }

    await auctionRepo.updateStatus(state.sessionId, 'paused');
    const newState = { ...state, sessionStatus: 'paused' };
    await this.setLiveState(newState);

    io.to(state.sessionId).emit('auction:session-paused');
    return newState;
  },

  async resumeSession(io) {
    const state = await this.getLiveState();
    if (!state) throw ApiError.badRequest('No active auction session');

    await auctionRepo.updateStatus(state.sessionId, 'live');
    const newState = { ...state, sessionStatus: 'live' };
    await this.setLiveState(newState);

    io.to(state.sessionId).emit('auction:session-resumed');

    // Resume timer if player is nominated
    if (state.currentPlayerId) {
      const { startAuctionTimer } = await import('../jobs/auctionTimer.job.js');
      startAuctionTimer(state.sessionId, state.currentPlayerId, io);
    }

    return newState;
  },

  async endSession(io) {
    const state = await this.getLiveState();
    if (!state) throw ApiError.badRequest('No active auction session');

    if (global.auctionTimerInterval) {
      clearInterval(global.auctionTimerInterval);
      global.auctionTimerInterval = null;
    }

    await auctionRepo.updateStatus(state.sessionId, 'ended');
    await redis.del(AUCTION_STATE_KEY);

    io.to(state.sessionId).emit('auction:session-ended');
    return state;
  },
};
