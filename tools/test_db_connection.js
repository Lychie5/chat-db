#!/usr/bin/env node
// Script simple pour tester la connexion MySQL en utilisant les mêmes vars d'environnement
// Usage: node tools/test_db_connection.js

const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  try {
    const useUrl = process.env.DATABASE_URL && /mysql(2)?:\/\//.test(process.env.DATABASE_URL);
    const config = useUrl
      ? (() => {
          let url = process.env.DATABASE_URL;
          url = url.replace(/^mysql2:\/\//i, 'mysql://');
          const u = new URL(url);
          return {
            host: u.hostname,
            port: u.port || 3306,
            user: decodeURIComponent(u.username),
            password: decodeURIComponent(u.password),
            database: u.pathname.replace(/^\//, ''),
            ssl:
              process.env.DB_REQUIRE_SSL === 'true' || process.env.RAILWAY_DB_SSL === 'true'
                ? { rejectUnauthorized: process.env.RAILWAY_ALLOW_INSECURE === 'true' ? false : true }
                : undefined,
          };
        })()
      : {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'chat_db',
        };

    console.log('Attempting connection with config:', { host: config.host, port: config.port, user: config.user, database: config.database, hasSSL: !!config.ssl });

    const pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: process.env.DB_CONN_LIMIT ? parseInt(process.env.DB_CONN_LIMIT, 10) : 5,
      queueLimit: 0,
    });

    // Try a simple query
    const [rows] = await pool.query('SELECT 1 AS ok');
    console.log('Connected, SELECT 1 =>', rows);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
}

main();
