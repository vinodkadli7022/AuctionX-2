import { pool } from '../config/db.js';

export const franchiseRepo = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT * FROM franchises ORDER BY name ASC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM franchises WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async deductPurse(franchiseId, amount, client = pool) {
    const { rows } = await client.query(
      `UPDATE franchises 
       SET purse_remaining = purse_remaining - $2,
           squad_count = squad_count + 1
       WHERE id = $1
       RETURNING *`,
      [franchiseId, amount]
    );
    return rows[0];
  },

  async incrementOverseas(franchiseId, client = pool) {
    const { rows } = await client.query(
      `UPDATE franchises SET overseas_count = overseas_count + 1 WHERE id = $1 RETURNING *`,
      [franchiseId]
    );
    return rows[0];
  },

  async getSquad(franchiseId) {
    const { rows } = await pool.query(
      `SELECT sp.price_paid, sp.acquired_at, p.*
       FROM squad_players sp
       JOIN players p ON sp.player_id = p.id
       WHERE sp.franchise_id = $1
       ORDER BY p.role, p.name`,
      [franchiseId]
    );
    return rows;
  },

  async addToSquad({ id, franchiseId, playerId, pricePaid }, client = pool) {
    const { rows } = await client.query(
      `INSERT INTO squad_players (id, franchise_id, player_id, price_paid)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, franchiseId, playerId, pricePaid]
    );
    return rows[0];
  },

  async getPurseStandings() {
    const { rows } = await pool.query(
      `SELECT id, name, short_name, logo_url, primary_color,
              purse_remaining, purse_total,
              (purse_total - purse_remaining) as purse_spent,
              squad_count, overseas_count
       FROM franchises
       ORDER BY purse_spent DESC`
    );
    return rows;
  },
};
