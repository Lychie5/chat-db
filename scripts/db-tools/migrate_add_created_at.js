const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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
    // Ensure backups dir
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

    // Check columns
    const [cols] = await pool.query('SHOW COLUMNS FROM messages');
    const fields = (cols || []).map(c => c.Field);
    console.log('Existing message fields:', fields.join(', '));
    if (fields.includes('created_at')) {
      console.log('created_at already exists. Nothing to do.');
      await pool.end();
      process.exit(0);
    }

    // Backup messages table
    console.log('Backing up messages table...');
    const [rows] = await pool.query('SELECT * FROM messages');
    const backupName = `messages-backup-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    const backupPath = path.join(backupsDir, backupName);
    fs.writeFileSync(backupPath, JSON.stringify({ meta: { created_at: new Date().toISOString() }, rows }, null, 2), 'utf8');
    console.log('Backup written to', backupPath);

    // Add created_at column (nullable, default current_timestamp)
    console.log('Altering table to add created_at column...');
    await pool.query('ALTER TABLE messages ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP');
    console.log('ALTER TABLE succeeded. Populating created_at from date_envoi where present...');

    // Populate created_at from date_envoi if date_envoi exists
    if (fields.includes('date_envoi')) {
      const [res] = await pool.query('UPDATE messages SET created_at = date_envoi WHERE created_at IS NULL');
      console.log('Updated rows count (populating created_at):', res && (res.affectedRows || res.affected_rows || res.affectedRows === 0 ? res.affectedRows : JSON.stringify(res)) );
    } else {
      console.log('No date_envoi column to copy from; created_at remains default for new rows.');
    }

    // Final verification
    const [newCols] = await pool.query('SHOW COLUMNS FROM messages');
    console.log('New message fields:', newCols.map(c => c.Field).join(', '));
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration error:', err && err.message ? err.message : err);
    process.exitCode = 2;
  } finally {
    await pool.end();
  }
})();
