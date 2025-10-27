const mysql = require('mysql2/promise');
require('dotenv').config();
(async function(){
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_db',
    connectionLimit: 2
  });
  try {
    const [rows] = await pool.query('SHOW COLUMNS FROM messages');
    console.log('messages columns:');
    console.dir(rows, { depth: 4 });
  } catch (err) { console.error('ERR', err && err.message ? err.message : err) }
  finally { await pool.end(); }
})();
