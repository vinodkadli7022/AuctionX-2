import { auctionService } from '../services/auction.service.js';
import { playerService } from '../services/player.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const auctionController = {
  getSession: asyncHandler(async (req, res) => {
    const state = await auctionService.getLiveState();
    new ApiResponse(200, state || null, state ? 'Live session found' : 'No active session').send(res);
  }),

  startSession: asyncHandler(async (req, res) => {
    const { name = 'IPL Auction 2025' } = req.body;
    const result = await auctionService.startSession(name);
    req.io.emit('auction:session-started', result.state);
    new ApiResponse(201, result, 'Auction session started').send(res);
  }),

  nominatePlayer: asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    const state = await auctionService.nominatePlayer(playerId, req.io);
    req.io.to(state.sessionId).emit('auction:player-nominated', {
      player: state.currentPlayerData,
      timerDuration: 30,
      timerEndTimestamp: state.timerEndTimestamp,
    });
    new ApiResponse(200, state, 'Player nominated').send(res);
  }),

  soldPlayer: asyncHandler(async (req, res) => {
    const result = await auctionService.soldPlayer(req.io);
    new ApiResponse(200, result, 'Player sold').send(res);
  }),

  unsoldPlayer: asyncHandler(async (req, res) => {
    const player = await auctionService.unsoldPlayer(req.io);
    new ApiResponse(200, player, 'Player marked as unsold').send(res);
  }),

  pauseSession: asyncHandler(async (req, res) => {
    const state = await auctionService.pauseSession(req.io);
    new ApiResponse(200, state, 'Session paused').send(res);
  }),

  resumeSession: asyncHandler(async (req, res) => {
    const state = await auctionService.resumeSession(req.io);
    new ApiResponse(200, state, 'Session resumed').send(res);
  }),

  endSession: asyncHandler(async (req, res) => {
    const result = await auctionService.endSession(req.io);
    new ApiResponse(200, result, 'Session ended').send(res);
  }),

  getHistory: asyncHandler(async (_req, res) => {
    const history = await playerService.getSoldHistory();
    new ApiResponse(200, history).send(res);
  }),
};
