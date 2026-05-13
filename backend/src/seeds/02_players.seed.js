import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db.js';

const players = [
  // Batsmen (Indian)
  { name: 'Rohit Sharma', role: 'Batsman', nationality: 'Indian', age: 37, iplCaps: 243, basePrice: 200 },
  { name: 'Virat Kohli', role: 'Batsman', nationality: 'Indian', age: 35, iplCaps: 237, basePrice: 200 },
  { name: 'Shubman Gill', role: 'Batsman', nationality: 'Indian', age: 24, iplCaps: 91, basePrice: 200 },
  { name: 'Suryakumar Yadav', role: 'Batsman', nationality: 'Indian', age: 33, iplCaps: 139, basePrice: 200 },
  { name: 'Shreyas Iyer', role: 'Batsman', nationality: 'Indian', age: 29, iplCaps: 101, basePrice: 150 },
  { name: 'Ruturaj Gaikwad', role: 'Batsman', nationality: 'Indian', age: 27, iplCaps: 52, basePrice: 100 },
  { name: 'Yashasvi Jaiswal', role: 'Batsman', nationality: 'Indian', age: 22, iplCaps: 37, basePrice: 100 },
  { name: 'Rinku Singh', role: 'Batsman', nationality: 'Indian', age: 26, iplCaps: 31, basePrice: 50 },
  { name: 'Devdutt Padikkal', role: 'Batsman', nationality: 'Indian', age: 23, iplCaps: 57, basePrice: 50 },
  { name: 'Prithvi Shaw', role: 'Batsman', nationality: 'Indian', age: 24, iplCaps: 71, basePrice: 50 },
  { name: 'Manish Pandey', role: 'Batsman', nationality: 'Indian', age: 34, iplCaps: 170, basePrice: 50 },
  { name: 'Ajinkya Rahane', role: 'Batsman', nationality: 'Indian', age: 36, iplCaps: 172, basePrice: 50 },
  { name: 'Sai Sudharsan', role: 'Batsman', nationality: 'Indian', age: 22, iplCaps: 13, basePrice: 30 },
  { name: 'Abhinav Manohar', role: 'Batsman', nationality: 'Indian', age: 29, iplCaps: 17, basePrice: 20 },
  { name: 'Rahul Tripathi', role: 'Batsman', nationality: 'Indian', age: 33, iplCaps: 89, basePrice: 75 },
  
  // Batsmen (Overseas)
  { name: 'David Warner', role: 'Batsman', nationality: 'Overseas', age: 37, iplCaps: 176, basePrice: 200 },
  { name: 'Kane Williamson', role: 'Batsman', nationality: 'Overseas', age: 33, iplCaps: 77, basePrice: 200 },
  { name: 'Steve Smith', role: 'Batsman', nationality: 'Overseas', age: 35, iplCaps: 103, basePrice: 200 },
  { name: 'Faf du Plessis', role: 'Batsman', nationality: 'Overseas', age: 39, iplCaps: 130, basePrice: 200 },
  { name: 'Travis Head', role: 'Batsman', nationality: 'Overseas', age: 30, iplCaps: 10, basePrice: 150 },
  { name: 'Harry Brook', role: 'Batsman', nationality: 'Overseas', age: 25, iplCaps: 11, basePrice: 150 },
  { name: 'David Miller', role: 'Batsman', nationality: 'Overseas', age: 34, iplCaps: 121, basePrice: 150 },
  { name: 'Rovman Powell', role: 'Batsman', nationality: 'Overseas', age: 30, iplCaps: 17, basePrice: 100 },
  { name: 'Dewald Brevis', role: 'Batsman', nationality: 'Overseas', age: 21, iplCaps: 7, basePrice: 50 },
  { name: 'Jason Roy', role: 'Batsman', nationality: 'Overseas', age: 33, iplCaps: 21, basePrice: 150 },

  // Bowlers (Indian)
  { name: 'Jasprit Bumrah', role: 'Bowler', nationality: 'Indian', age: 30, iplCaps: 120, basePrice: 200 },
  { name: 'Mohammed Shami', role: 'Bowler', nationality: 'Indian', age: 33, iplCaps: 110, basePrice: 200 },
  { name: 'Mohammed Siraj', role: 'Bowler', nationality: 'Indian', age: 30, iplCaps: 79, basePrice: 150 },
  { name: 'Bhuvneshwar Kumar', role: 'Bowler', nationality: 'Indian', age: 34, iplCaps: 160, basePrice: 150 },
  { name: 'Yuzvendra Chahal', role: 'Bowler', nationality: 'Indian', age: 33, iplCaps: 145, basePrice: 150 },
  { name: 'Kuldeep Yadav', role: 'Bowler', nationality: 'Indian', age: 29, iplCaps: 73, basePrice: 100 },
  { name: 'Ravichandran Ashwin', role: 'Bowler', nationality: 'Indian', age: 37, iplCaps: 197, basePrice: 200 },
  { name: 'Arshdeep Singh', role: 'Bowler', nationality: 'Indian', age: 25, iplCaps: 51, basePrice: 100 },
  { name: 'Ravi Bishnoi', role: 'Bowler', nationality: 'Indian', age: 23, iplCaps: 52, basePrice: 75 },
  { name: 'Mukesh Kumar', role: 'Bowler', nationality: 'Indian', age: 30, iplCaps: 10, basePrice: 50 },
  { name: 'Prasiddh Krishna', role: 'Bowler', nationality: 'Indian', age: 28, iplCaps: 51, basePrice: 75 },
  { name: 'Deepak Chahar', role: 'Bowler', nationality: 'Indian', age: 31, iplCaps: 73, basePrice: 100 },
  { name: 'T Natarajan', role: 'Bowler', nationality: 'Indian', age: 33, iplCaps: 47, basePrice: 50 },
  { name: 'Avesh Khan', role: 'Bowler', nationality: 'Indian', age: 27, iplCaps: 47, basePrice: 75 },

  // Bowlers (Overseas)
  { name: 'Trent Boult', role: 'Bowler', nationality: 'Overseas', age: 34, iplCaps: 88, basePrice: 200 },
  { name: 'Kagiso Rabada', role: 'Bowler', nationality: 'Overseas', age: 29, iplCaps: 69, basePrice: 200 },
  { name: 'Rashid Khan', role: 'Bowler', nationality: 'Overseas', age: 25, iplCaps: 109, basePrice: 200 },
  { name: 'Mitchell Starc', role: 'Bowler', nationality: 'Overseas', age: 34, iplCaps: 27, basePrice: 200 },
  { name: 'Pat Cummins', role: 'Bowler', nationality: 'Overseas', age: 31, iplCaps: 42, basePrice: 200 },
  { name: 'Anrich Nortje', role: 'Bowler', nationality: 'Overseas', age: 30, iplCaps: 40, basePrice: 150 },
  { name: 'Jofra Archer', role: 'Bowler', nationality: 'Overseas', age: 29, iplCaps: 40, basePrice: 150 },
  { name: 'Mustafizur Rahman', role: 'Bowler', nationality: 'Overseas', age: 28, iplCaps: 48, basePrice: 100 },

  // All-Rounders (Indian)
  { name: 'Hardik Pandya', role: 'All-Rounder', nationality: 'Indian', age: 30, iplCaps: 123, basePrice: 200 },
  { name: 'Ravindra Jadeja', role: 'All-Rounder', nationality: 'Indian', age: 35, iplCaps: 226, basePrice: 200 },
  { name: 'Axar Patel', role: 'All-Rounder', nationality: 'Indian', age: 30, iplCaps: 136, basePrice: 150 },
  { name: 'Washington Sundar', role: 'All-Rounder', nationality: 'Indian', age: 24, iplCaps: 58, basePrice: 75 },
  { name: 'Shivam Dube', role: 'All-Rounder', nationality: 'Indian', age: 30, iplCaps: 51, basePrice: 75 },
  { name: 'Krunal Pandya', role: 'All-Rounder', nationality: 'Indian', age: 33, iplCaps: 113, basePrice: 100 },
  { name: 'Deepak Hooda', role: 'All-Rounder', nationality: 'Indian', age: 29, iplCaps: 107, basePrice: 75 },
  { name: 'Rahul Tewatia', role: 'All-Rounder', nationality: 'Indian', age: 31, iplCaps: 81, basePrice: 50 },
  { name: 'Venkatesh Iyer', role: 'All-Rounder', nationality: 'Indian', age: 29, iplCaps: 36, basePrice: 50 },
  { name: 'Shahrukh Khan', role: 'All-Rounder', nationality: 'Indian', age: 29, iplCaps: 33, basePrice: 30 },
  { name: 'Nitish Reddy', role: 'All-Rounder', nationality: 'Indian', age: 21, iplCaps: 2, basePrice: 20 },
  { name: 'Abhishek Sharma', role: 'All-Rounder', nationality: 'Indian', age: 23, iplCaps: 47, basePrice: 30 },

  // All-Rounders (Overseas)
  { name: 'Ben Stokes', role: 'All-Rounder', nationality: 'Overseas', age: 33, iplCaps: 45, basePrice: 200 },
  { name: 'Cameron Green', role: 'All-Rounder', nationality: 'Overseas', age: 25, iplCaps: 16, basePrice: 200 },
  { name: 'Sam Curran', role: 'All-Rounder', nationality: 'Overseas', age: 25, iplCaps: 46, basePrice: 200 },
  { name: 'Glenn Maxwell', role: 'All-Rounder', nationality: 'Overseas', age: 35, iplCaps: 124, basePrice: 200 },
  { name: 'Marcus Stoinis', role: 'All-Rounder', nationality: 'Overseas', age: 34, iplCaps: 82, basePrice: 150 },
  { name: 'Mitchell Marsh', role: 'All-Rounder', nationality: 'Overseas', age: 32, iplCaps: 38, basePrice: 150 },
  { name: 'Sunil Narine', role: 'All-Rounder', nationality: 'Overseas', age: 36, iplCaps: 162, basePrice: 150 },
  { name: 'Moeen Ali', role: 'All-Rounder', nationality: 'Overseas', age: 36, iplCaps: 59, basePrice: 150 },

  // Wicketkeepers (Indian)
  { name: 'MS Dhoni', role: 'Wicketkeeper', nationality: 'Indian', age: 42, iplCaps: 250, basePrice: 200 },
  { name: 'Rishabh Pant', role: 'Wicketkeeper', nationality: 'Indian', age: 26, iplCaps: 98, basePrice: 200 },
  { name: 'KL Rahul', role: 'Wicketkeeper', nationality: 'Indian', age: 32, iplCaps: 118, basePrice: 200 },
  { name: 'Sanju Samson', role: 'Wicketkeeper', nationality: 'Indian', age: 29, iplCaps: 152, basePrice: 150 },
  { name: 'Ishan Kishan', role: 'Wicketkeeper', nationality: 'Indian', age: 25, iplCaps: 91, basePrice: 150 },
  { name: 'Dinesh Karthik', role: 'Wicketkeeper', nationality: 'Indian', age: 38, iplCaps: 242, basePrice: 100 },
  { name: 'Wriddhiman Saha', role: 'Wicketkeeper', nationality: 'Indian', age: 39, iplCaps: 161, basePrice: 75 },
  { name: 'Jitesh Sharma', role: 'Wicketkeeper', nationality: 'Indian', age: 30, iplCaps: 26, basePrice: 50 },
  { name: 'Dhruv Jurel', role: 'Wicketkeeper', nationality: 'Indian', age: 23, iplCaps: 13, basePrice: 30 },

  // Wicketkeepers (Overseas)
  { name: 'Jos Buttler', role: 'Wicketkeeper', nationality: 'Overseas', age: 33, iplCaps: 96, basePrice: 200 },
  { name: 'Quinton de Kock', role: 'Wicketkeeper', nationality: 'Overseas', age: 31, iplCaps: 96, basePrice: 200 },
  { name: 'Jonny Bairstow', role: 'Wicketkeeper', nationality: 'Overseas', age: 34, iplCaps: 39, basePrice: 150 },
  { name: 'Heinrich Klaasen', role: 'Wicketkeeper', nationality: 'Overseas', age: 32, iplCaps: 19, basePrice: 150 },
];

export async function seedPlayers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if players already exist
    const { rows: existing } = await client.query('SELECT COUNT(*) FROM players');
    if (parseInt(existing[0].count) > 0) {
      console.log(`🏏 Players already seeded (${existing[0].count} found). Skipping.`);
      return;
    }

    console.log(`🏏 Seeding ${players.length} players...`);

    for (const p of players) {
      await client.query(
        `INSERT INTO players (id, name, role, nationality, age, ipl_caps, base_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), p.name, p.role, p.nationality, p.age, p.iplCaps, p.basePrice]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Successfully seeded ${players.length} players.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed players:', err);
    throw err;
  } finally {
    client.release();
  }
}
