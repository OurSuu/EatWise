const fs = require('fs');
const { Pool } = require('pg');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlLine = env.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
const pool = new Pool({ connectionString: dbUrl });

pool.query('SELECT * FROM users').then(res1 => { 
  console.log('USERS:', res1.rows); 
  return pool.query('SELECT * FROM profiles'); 
}).then(res2 => { 
  console.log('PROFILES:', res2.rows); 
  pool.end(); 
});
