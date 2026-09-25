const fs = require('fs');
const { Pool } = require('pg');

const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlLine = env.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');

const pool = new Pool({ connectionString: dbUrl });

async function fix() {
  try {
    console.log("Creating profiles table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gender VARCHAR(50) DEFAULT 'Man',
        age VARCHAR(50) DEFAULT '',
        height VARCHAR(50) DEFAULT '',
        weight VARCHAR(50) DEFAULT '',
        lifestyle VARCHAR(255) DEFAULT '',
        targets TEXT[] DEFAULT '{}',
        default_location VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Database fixed!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

fix();
