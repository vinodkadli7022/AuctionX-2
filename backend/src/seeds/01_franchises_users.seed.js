import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db.js';

const SALT_ROUNDS = 12;

const franchises = [
  { name: 'Mumbai Indians',              shortName: 'MI',  homeCity: 'Mumbai',    primaryColor: '#004BA0' },
  { name: 'Chennai Super Kings',         shortName: 'CSK', homeCity: 'Chennai',   primaryColor: '#F6C000' },
  { name: 'Royal Challengers Bengaluru', shortName: 'RCB', homeCity: 'Bengaluru', primaryColor: '#CC0000' },
  { name: 'Kolkata Knight Riders',       shortName: 'KKR', homeCity: 'Kolkata',   primaryColor: '#3A225D' },
  { name: 'Delhi Capitals',              shortName: 'DC',  homeCity: 'Delhi',     primaryColor: '#0078BC' },
  { name: 'Rajasthan Royals',            shortName: 'RR',  homeCity: 'Jaipur',    primaryColor: '#EA1A85' },
  { name: 'Punjab Kings',               shortName: 'PBKS', homeCity: 'Mohali',   primaryColor: '#ED1B24' },
  { name: 'Sunrisers Hyderabad',         shortName: 'SRH', homeCity: 'Hyderabad', primaryColor: '#F7A721' },
];

export async function seedFranchisesAndUsers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🏏 Seeding franchises...');

    const franchiseRows = [];
    for (const f of franchises) {
      const { rows } = await client.query(
        `INSERT INTO franchises (id, name, short_name, home_city, primary_color)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING
         RETURNING id, name, short_name`,
        [uuidv4(), f.name, f.shortName, f.homeCity, f.primaryColor]
      );
      if (rows[0]) {
        franchiseRows.push(rows[0]);
        console.log(`  ✅ ${rows[0].name}`);
      }
    }

    // Fetch all franchise ids (in case they already existed)
    const { rows: allFranchises } = await client.query(
      `SELECT id, name, short_name FROM franchises ORDER BY name`
    );

    console.log('\n👤 Seeding users...');

    // Auctioneer account
    const auctioneerHash = await bcrypt.hash('Auctioneer@123', SALT_ROUNDS);
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'auctioneer')
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'Head Auctioneer', 'auctioneer@auctionx.in', auctioneerHash]
    );
    console.log('  ✅ auctioneer@auctionx.in (Auctioneer@123)');

    // One franchise user per franchise
    const defaultPass = await bcrypt.hash('Franchise@123', SALT_ROUNDS);
    for (const f of allFranchises) {
      const email = `${f.short_name.toLowerCase()}@auctionx.in`;
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, franchise_id)
         VALUES ($1, $2, $3, $4, 'franchise', $5)
         ON CONFLICT (email) DO NOTHING`,
        [uuidv4(), `${f.name} Owner`, email, defaultPass, f.id]
      );
      console.log(`  ✅ ${email} (Franchise@123) → ${f.name}`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Franchise & user seed complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
