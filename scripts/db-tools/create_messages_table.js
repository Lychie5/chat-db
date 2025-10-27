const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

(async function(){
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_db',
    connectionLimit: 2
  });

  try {
    const ddl = `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id BIGINT NOT NULL,
      sender VARCHAR(100) NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (conversation_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    console.log('📦 Creating messages table if not exists...');
    const [r] = await pool.query(ddl);
    console.log('✅ DDL executed.');

    // optionally show columns
    const [cols] = await pool.query('SHOW COLUMNS FROM messages');
    console.log('messages columns:');
    console.dir(cols.map(c => c.Field));
  } catch (err) {
    console.error('Migration error:', err && err.message ? err.message : err);
    process.exitCode = 2;
  } finally {
    await pool.end();
  }
})();
