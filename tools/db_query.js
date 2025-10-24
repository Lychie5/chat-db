const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const convId = process.argv[2];
  if (!convId) {
    console.error('Usage: node tools/db_query.js <conversation_id>');
    process.exit(2);
  }
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_db',
    connectionLimit: 5
  });
  try {
    // detect timestamp column
    const [cols] = await pool.query('SHOW COLUMNS FROM messages');
    const fields = (cols || []).map(c => c.Field);
    const ts = fields.includes('created_at') ? 'created_at' : (fields.includes('date_envoi') ? 'date_envoi' : null);
    const orderClause = ts ? ` ORDER BY \`${ts}\`` : '';
    const [rows] = await pool.query(`SELECT * FROM messages WHERE conversation_id = ?${orderClause}`, [convId]);
    console.log('rows count=', rows.length, ' (order by=', ts, ')');
    console.dir(rows.slice(-20), { depth: 4 });
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
  } finally {
    await pool.end();
  }
}

main();
