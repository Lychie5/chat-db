#!/usr/bin/env node
// Test de connexion multi-SGBD (MySQL ou Postgres) en utilisant les mêmes variables d'env
// Usage: node tools/test_db_connection_multi.js

const url = require('url');
const mysql = require('mysql2/promise');
const { Client: PGClient } = require('pg');

function parseDatabaseKind() {
  if (process.env.DATABASE_URL) {
    const u = process.env.DATABASE_URL.toLowerCase();
    if (u.startsWith('mysql')) return 'mysql';
    if (u.startsWith('postgres') || u.startsWith('postgresql')) return 'postgres';
  }
  // fallback to DB_HOST presence
  if (process.env.DB_HOST) {
    const host = process.env.DB_HOST.toLowerCase();
    if (host.includes('postgres') || host.includes('pg')) return 'postgres';
  }
  // default mysql (project historically used MySQL)
  return 'mysql';
}

async function testMySQL() {
  try {
    const useUrl = process.env.DATABASE_URL && /mysql(2)?:\/\//.test(process.env.DATABASE_URL);
    const config = useUrl
      ? (() => {
          let u = process.env.DATABASE_URL.replace(/^mysql2:\/\//i, 'mysql://');
          const parsed = new URL(u);
          return {
            host: parsed.hostname,
            port: parsed.port || 3306,
            user: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
            database: parsed.pathname.replace(/^\//, ''),
            ssl: process.env.DB_REQUIRE_SSL === 'true' || process.env.RAILWAY_DB_SSL === 'true' ? { rejectUnauthorized: process.env.RAILWAY_ALLOW_INSECURE === 'true' ? false : true } : undefined,
          };
        })()
      : {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'chat_db',
        };

    console.log('Testing MySQL with', { host: config.host, port: config.port, user: config.user, database: config.database, ssl: !!config.ssl });
    const pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 2 });
    const [rows] = await pool.query('SELECT 1 AS ok');
    console.log('MySQL OK:', rows);
    await pool.end();
  } catch (err) {
    console.error('MySQL connection error:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
}

async function testPostgres() {
  try {
    let clientConfig;
    if (process.env.DATABASE_URL) {
      clientConfig = { connectionString: process.env.DATABASE_URL, ssl: process.env.DB_REQUIRE_SSL === 'true' || process.env.RAILWAY_DB_SSL === 'true' ? { rejectUnauthorized: process.env.RAILWAY_ALLOW_INSECURE === 'true' ? false : true } : false };
    } else {
      clientConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
        ssl: process.env.DB_REQUIRE_SSL === 'true' || process.env.RAILWAY_DB_SSL === 'true' ? { rejectUnauthorized: process.env.RAILWAY_ALLOW_INSECURE === 'true' ? false : true } : false,
      };
    }

    console.log('Testing Postgres with', { host: clientConfig.host || '(via DATABASE_URL)', port: clientConfig.port || '(via DATABASE_URL)', ssl: !!clientConfig.ssl });

    const client = new PGClient(clientConfig);
    await client.connect();
    const res = await client.query('SELECT 1 AS ok');
    console.log('Postgres OK:', res.rows);
    await client.end();
  } catch (err) {
    console.error('Postgres connection error:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
}

(async () => {
  const kind = parseDatabaseKind();
  console.log('Detected DB kind:', kind);
  if (kind === 'mysql') await testMySQL();
  else await testPostgres();
  process.exit(0);
})();
