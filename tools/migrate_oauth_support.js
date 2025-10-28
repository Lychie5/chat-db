const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false
});

async function migrateOAuthSupport() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Début de la migration OAuth...\n');

    // Vérifier si les colonnes existent déjà
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND column_name IN ('provider', 'provider_id', 'photo_url', 'email_verified');
    `);
    
    if (checkColumns.rows.length > 0) {
      console.log('⚠️  Les colonnes OAuth existent déjà. Migration ignorée.');
      return;
    }

    // Ajouter les colonnes pour OAuth
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local',
      ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS photo_url TEXT,
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
    `);
    
    console.log('✅ Colonnes OAuth ajoutées à la table users');

    // Créer un index sur provider + provider_id pour les lookups rapides
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_provider 
      ON users(provider, provider_id);
    `);
    
    console.log('✅ Index créé sur provider/provider_id');

    // Modifier la contrainte de mot de passe pour le rendre optionnel (OAuth users n'ont pas de password)
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN password DROP NOT NULL;
    `);
    
    console.log('✅ Colonne password rendue optionnelle');

    // Créer une table pour les tokens de session OAuth
    await client.query(`
      CREATE TABLE IF NOT EXISTS oauth_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Table oauth_sessions créée');

    console.log('\n✨ Migration OAuth terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter la migration
migrateOAuthSupport()
  .then(() => {
    console.log('\n🎉 Migration complète!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Échec de la migration:', error);
    process.exit(1);
  });
