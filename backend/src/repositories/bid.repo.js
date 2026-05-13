import { pool } from '../config/db.js';

export const bidRepo = {
  async create({ id, sessionId, playerId, franchiseId, amount }, client = pool) {
    const { rows } = await client.query(
      `INSERT INTO bids (id, session_id, player_id, franchise_id, amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, sessionId, playerId, franchiseId, amount]
    );
    return rows[0];
  },

  async getForPlayer(sessionId, playerId) {
    const { rows } = await pool.query(
      `SELECT b.*, f.name as franchise_name, f.short_name, f.logo_url, f.primary_color
       FROM bids b
       JOIN franchises f ON b.franchise_id = f.id
       WHERE b.session_id = $1 AND b.player_id = $2
       ORDER BY b.placed_at DESC`,
      [sessionId, playerId]
    );
    return rows;
  },

  async getLastN(sessionId, playerId, n = 10) {
    const { rows } = await pool.query(
      `SELECT b.*, f.name as franchise_name, f.short_name, f.logo_url, f.primary_color
       FROM bids b
       JOIN franchises f ON b.franchise_id = f.id
       WHERE b.session_id = $1 AND b.player_id = $2
       ORDER BY b.placed_at DESC
       LIMIT $3`,
      [sessionId, playerId, n]
    );
    return rows;
  },
};
