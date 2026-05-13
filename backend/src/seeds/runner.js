import { seedFranchisesAndUsers } from './01_franchises_users.seed.js';
import { seedPlayers } from './02_players.seed.js';
import { pool } from '../config/db.js';

async function runSeeds() {
  console.log('🌱 Starting database seeding...\n');
  try {
    await seedFranchisesAndUsers();
    console.log('-----------------------------------');
    await seedPlayers();
    console.log('\n✅ All seeds completed successfully!');
  } catch (err) {
    console.error('\n❌ Seeding failed.');
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runSeeds();
