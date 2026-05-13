import { franchiseService } from '../services/franchise.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const franchiseController = {
  getAllFranchises: asyncHandler(async (_req, res) => {
    const franchises = await franchiseService.getAllFranchises();
    new ApiResponse(200, franchises).send(res);
  }),

  getFranchiseById: asyncHandler(async (req, res) => {
    const franchise = await franchiseService.getFranchiseById(req.params.id);
    new ApiResponse(200, franchise).send(res);
  }),

  getSquad: asyncHandler(async (req, res) => {
    const data = await franchiseService.getSquad(req.params.id);
    new ApiResponse(200, data).send(res);
  }),

  getPurseStandings: asyncHandler(async (_req, res) => {
    const standings = await franchiseService.getPurseStandings();
    new ApiResponse(200, standings).send(res);
  }),
};
