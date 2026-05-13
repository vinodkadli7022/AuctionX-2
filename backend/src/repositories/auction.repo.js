import { pool } from '../config/db.js';

export const auctionRepo = {
  async createSession({ id, name }) {
    const { rows } = await pool.query(
      `INSERT INTO auction_sessions (id, name, status)
       VALUES ($1, $2, 'scheduled')
       RETURNING *`,
      [id, name]
    );
    return rows[0];
  },

  async findActiveSession() {
    const { rows } = await pool.query(
      `SELECT * FROM auction_sessions WHERE status IN ('live', 'paused') ORDER BY created_at DESC LIMIT 1`
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM auction_sessions WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const updates = {
      live: `status = 'live', started_at = NOW()`,
      paused: `status = 'paused'`,
      ended: `status = 'ended', ended_at = NOW()`,
    };
    const { rows } = await pool.query(
      `UPDATE auction_sessions SET ${updates[status] || `status = '${status}'`} WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  async setCurrentPlayer(sessionId, playerId) {
    const { rows } = await pool.query(
      `UPDATE auction_sessions SET current_player_id = $2 WHERE id = $1 RETURNING *`,
      [sessionId, playerId]
    );
    return rows[0];
  },

  async clearCurrentPlayer(sessionId) {
    const { rows } = await pool.query(
      `UPDATE auction_sessions SET current_player_id = NULL WHERE id = $1 RETURNING *`,
      [sessionId]
    );
    return rows[0];
  },
};
