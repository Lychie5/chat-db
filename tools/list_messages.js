const mysql = require('mysql2/promise');
require('dotenv').config();
(async function(){
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_db',
    connectionLimit: 5
  });
  try {
    const [rows] = await pool.query('SELECT id, conversation_id, pseudo, content, date_envoi FROM messages ORDER BY date_envoi DESC LIMIT 200');
    console.log('total rows fetched=', rows.length);
    const grouped = {};
    for (const r of rows) {
      const conv = String(r.conversation_id);
      grouped[conv] = (grouped[conv] || 0) + 1;
    }
    console.log('grouped by conversation_id (top):')
    const items = Object.entries(grouped).sort((a,b)=>b[1]-a[1]);
    console.dir(items.slice(0,20), {depth:5});
    console.log('\nSample rows:')
    console.dir(rows.slice(0,10), {depth:5});
  } catch (err) { console.error('ERR', err && err.message ? err.message : err) }
  finally { await pool.end(); }
})();
