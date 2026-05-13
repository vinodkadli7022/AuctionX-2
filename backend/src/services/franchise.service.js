import { franchiseRepo } from '../repositories/franchise.repo.js';
import { ApiError } from '../utils/ApiError.js';
import { formatMoney } from '../utils/money.utils.js';

export const franchiseService = {
  async getAllFranchises() {
    const franchises = await franchiseRepo.findAll();
    return franchises.map(f => ({
      ...f,
      purse_remaining_formatted: formatMoney(f.purse_remaining),
      purse_total_formatted: formatMoney(f.purse_total),
      purse_spent: f.purse_total - f.purse_remaining,
      purse_spent_formatted: formatMoney(f.purse_total - f.purse_remaining),
    }));
  },

  async getFranchiseById(id) {
    const f = await franchiseRepo.findById(id);
    if (!f) throw ApiError.notFound('Franchise not found');
    return {
      ...f,
      purse_remaining_formatted: formatMoney(f.purse_remaining),
      purse_spent: f.purse_total - f.purse_remaining,
      purse_spent_formatted: formatMoney(f.purse_total - f.purse_remaining),
    };
  },

  async getSquad(franchiseId) {
    const franchise = await franchiseRepo.findById(franchiseId);
    if (!franchise) throw ApiError.notFound('Franchise not found');

    const squad = await franchiseRepo.getSquad(franchiseId);

    // Group by role
    const grouped = squad.reduce((acc, player) => {
      if (!acc[player.role]) acc[player.role] = [];
      acc[player.role].push({
        ...player,
        price_paid_formatted: formatMoney(player.price_paid),
      });
      return acc;
    }, {});

    return {
      franchise: {
        ...franchise,
        purse_remaining_formatted: formatMoney(franchise.purse_remaining),
      },
      squad: grouped,
      total: squad.length,
    };
  },

  async getPurseStandings() {
    const standings = await franchiseRepo.getPurseStandings();
    return standings.map(f => ({
      ...f,
      purse_remaining_formatted: formatMoney(f.purse_remaining),
      purse_spent_formatted: formatMoney(parseInt(f.purse_spent, 10)),
    }));
  },
};
