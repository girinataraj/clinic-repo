const { Pool } = require('pg');

const pool = new Pool({
  host: 'dpg-d8pcj50g4nts73frjnt0-a.oregon-postgres.render.com',
  port: 5432,
  user: 'hari',
  password: '7DDDRgCOh6IRlH1VPu3YHm39j0vE3ESC',
  database: 'clinic_fzjr',
  ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
  try {
    const res = await pool.query('SELECT id, email, role, phone, name FROM auth_users');
    console.log('Users in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error querying DB:', err.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
