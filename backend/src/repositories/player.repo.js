import { pool } from '../config/db.js';

export const playerRepo = {
  async findAll({ role, nationality, status, search, limit = 20, offset = 0 }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (role) { conditions.push(`role = $${idx++}`); params.push(role); }
    if (nationality) { conditions.push(`nationality = $${idx++}`); params.push(nationality); }
    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (search) {
      conditions.push(`name ILIKE $${idx++}`);
      params.push(`%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM players ${where}`;
    const dataQuery = `
      SELECT p.*, f.name as sold_to_name, f.short_name as sold_to_short, f.logo_url as sold_to_logo, f.primary_color as sold_to_color
      FROM players p
      LEFT JOIN franchises f ON p.sold_to_franchise_id = f.id
      ${where}
      ORDER BY p.created_at ASC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, -2)),
      pool.query(dataQuery, params),
    ]);

    return {
      total: parseInt(countResult.rows[0].count, 10),
      players: dataResult.rows,
    };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT p.*, f.name as sold_to_name, f.short_name as sold_to_short, f.logo_url as sold_to_logo
       FROM players p
       LEFT JOIN franchises f ON p.sold_to_franchise_id = f.id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ id, name, role, nationality, age, iplCaps, basePrice, photoUrl }) {
    const { rows } = await pool.query(
      `INSERT INTO players (id, name, role, nationality, age, ipl_caps, base_price, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, role, nationality, age, iplCaps, basePrice, photoUrl || null]
    );
    return rows[0];
  },

  async bulkCreate(players) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = [];
      for (const p of players) {
        const { rows } = await client.query(
          `INSERT INTO players (id, name, role, nationality, age, ipl_caps, base_price, photo_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [p.id, p.name, p.role, p.nationality, p.age, p.iplCaps, p.basePrice, p.photoUrl || null]
        );
        inserted.push(rows[0]);
      }
      await client.query('COMMIT');
      return inserted;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE players SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0];
  },

  async markSold(id, franchiseId, soldPrice) {
    const { rows } = await pool.query(
      `UPDATE players SET status = 'sold', sold_to_franchise_id = $2, sold_price = $3
       WHERE id = $1 RETURNING *`,
      [id, franchiseId, soldPrice]
    );
    return rows[0];
  },

  async markUnsold(id) {
    const { rows } = await pool.query(
      `UPDATE players SET status = 'unsold', sold_to_franchise_id = NULL, sold_price = NULL
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  async getUpcoming() {
    const { rows } = await pool.query(
      `SELECT * FROM players WHERE status = 'upcoming' ORDER BY base_price DESC, name ASC`
    );
    return rows;
  },

  async getSoldHistory() {
    const { rows } = await pool.query(
      `SELECT p.*, f.name as franchise_name, f.short_name, f.logo_url, f.primary_color
       FROM players p
       JOIN franchises f ON p.sold_to_franchise_id = f.id
       WHERE p.status = 'sold'
       ORDER BY p.sold_price DESC`,
    );
    return rows;
  },
};
