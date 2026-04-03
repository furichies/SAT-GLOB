const { Pool } = require('pg');

// Connection string from .env (without DIRECT_URL for test)
const connectionString = process.env.DATABASE_URL;
console.log('Testing connection string:', connectionString.replace(/:[^:@]+@/g, ':****@'));

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Query succeeded:', res.rows[0]);
    pool.end();
  })
  .catch(err => {
    console.error('❌ Query failed:', err.message);
    pool.end();
  });