import { pool } from '../config/db.js';

export const userRepo = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT u.*, f.name as franchise_name, f.short_name, f.logo_url, f.primary_color,
              f.purse_remaining, f.squad_count, f.overseas_count
       FROM users u
       LEFT JOIN franchises f ON u.franchise_id = f.id
       WHERE u.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ id, name, email, passwordHash, role, franchiseId }) {
    const { rows } = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, franchise_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, franchise_id, created_at`,
      [id, name, email, passwordHash, role, franchiseId || null]
    );
    return rows[0];
  },

  async updateRefreshToken(userId, hashedToken) {
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [hashedToken, userId]
    );
  },

  async findByRefreshToken(hashedToken) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE refresh_token = $1 LIMIT 1',
      [hashedToken]
    );
    return rows[0] || null;
  },

  async clearRefreshToken(userId) {
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE id = $1',
      [userId]
    );
  },
};
