import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL complète de votre base de données Render
const client = new Client({
  connectionString: 'postgresql://chat_db_p00y_user:LPctgwDjyuVRbpOBal0PHJfrzhw5vBWb@dpg-d3srt1fgi27c73dss3t0-a.oregon-postgres.render.com/chat_db_p00y',
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  try {
    console.log('🔌 Connexion à PostgreSQL Render...');
    await client.connect();
    console.log('✅ Connecté !');
    
    console.log('📄 Lecture du schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema-postgresql.sql'), 'utf8');
    
    console.log('🔨 Création des tables...');
    await client.query(schema);
    
    console.log('✅ Tables créées avec succès !');
    console.log('');
    console.log('📋 Vérification des tables...');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('✅ Tables existantes :');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await client.end();
    console.log('🔌 Déconnexion');
  }
}

initDatabase();
