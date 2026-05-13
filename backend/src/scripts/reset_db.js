import 'dotenv/config';
import pg from 'pg';
import { seedFranchisesAndUsers } from '../seeds/01_franchises_users.seed.js';
import { seedPlayers } from '../seeds/02_players.seed.js';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetAndSeed() {
  console.log('🚮 Wiping database for a clean start...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Disable triggers to avoid issues during wipe
    await client.query('SET session_replication_role = "replica";');

    // Wipe all data
    const tables = ['bids', 'squad_players', 'auction_sessions', 'players', 'users', 'franchises'];
    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE`);
      console.log(`  ✅ Cleared ${table}`);
    }

    // Add unique constraints if they don't exist
    console.log('\n🛡️ Checking unique constraints...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_short_name') THEN
          ALTER TABLE franchises ADD CONSTRAINT unique_short_name UNIQUE (short_name);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_email') THEN
          ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
        END IF;
      END $$;
    `);
    
    await client.query('SET session_replication_role = "origin";');
    await client.query('COMMIT');

    console.log('\n🌱 Re-seeding official tournament data...');
    
    // Run the existing seed functions
    await seedFranchisesAndUsers();
    await seedPlayers();

    console.log('\n✨ Database reset and seeded successfully with 8 official teams!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Reset failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetAndSeed();
