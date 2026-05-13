import { v4 as uuidv4 } from 'uuid';
import { parse } from 'csv-parse/sync';
import Joi from 'joi';
import { playerRepo } from '../repositories/player.repo.js';
import { ApiError } from '../utils/ApiError.js';

const VALID_ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'];
const VALID_NATIONALITIES = ['Indian', 'Overseas'];
const VALID_BASE_PRICES = [20, 30, 50, 75, 100, 150, 200];

const playerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid(...VALID_ROLES).required(),
  nationality: Joi.string().valid(...VALID_NATIONALITIES).required(),
  age: Joi.number().integer().min(15).max(50).required(),
  iplCaps: Joi.number().integer().min(0).default(0),
  basePrice: Joi.number().valid(...VALID_BASE_PRICES).required(),
});

export const playerService = {
  async getPlayers({ role, nationality, status, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    return playerRepo.findAll({ role, nationality, status, search, limit: parseInt(limit), offset });
  },

  async getPlayerById(id) {
    const player = await playerRepo.findById(id);
    if (!player) throw ApiError.notFound('Player not found');
    return player;
  },

  async createPlayer({ name, role, nationality, age, iplCaps, basePrice }, photoUrl) {
    const { error, value } = playerSchema.validate({ name, role, nationality, age, iplCaps, basePrice });
    if (error) throw ApiError.unprocessable('Invalid player data', error.details.map(d => ({ field: d.path[0], message: d.message })));

    return playerRepo.create({ id: uuidv4(), ...value, photoUrl });
  },

  async bulkUploadCSV(csvBuffer) {
    let records;
    try {
      records = parse(csvBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      throw ApiError.unprocessable('Invalid CSV format: ' + err.message);
    }

    const valid = [];
    const errors = [];

    records.forEach((record, index) => {
      const row = {
        name: record.name,
        role: record.role,
        nationality: record.nationality,
        age: parseInt(record.age, 10),
        iplCaps: parseInt(record.ipl_caps || record.iplCaps || 0, 10),
        basePrice: parseInt(record.base_price || record.basePrice, 10),
      };

      const { error, value } = playerSchema.validate(row, { abortEarly: false });
      if (error) {
        errors.push({
          row: index + 2,
          name: record.name || '(unnamed)',
          errors: error.details.map(d => d.message),
        });
      } else {
        valid.push({ id: uuidv4(), ...value, photoUrl: record.photo_url || null });
      }
    });

    if (errors.length > 0) {
      throw ApiError.unprocessable('CSV validation failed', errors);
    }

    const inserted = await playerRepo.bulkCreate(valid);
    return { inserted: inserted.length, players: inserted };
  },

  async getUpcomingPlayers() {
    return playerRepo.getUpcoming();
  },

  async getSoldHistory() {
    return playerRepo.getSoldHistory();
  },
};
