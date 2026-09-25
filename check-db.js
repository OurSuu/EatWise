const fs = require('fs');
const { Pool } = require('pg');

const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlLine = env.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');

const pool = new Pool({ connectionString: dbUrl });

pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
  .then(res => {
    console.log(res.rows);
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
