// Script pour synchroniser les données depuis Render vers Docker local
import pkg from 'pg';
const { Pool } = pkg;

// Configuration Render (source)
const renderPool = new Pool({
  connectionString: 'postgresql://chat_db_p00y_user:LPctgwDjyuVRbpOBal0PHJfrzhw5vBWb@dpg-d3srt1fgi27c73dss3t0-a.oregon-postgres.render.com/chat_db_p00y',
  ssl: {
    rejectUnauthorized: false
  }
});

// Configuration Docker local (destination)
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'chatuser',
  password: 'chatpassword',
  database: 'chat_db',
  ssl: false
});

async function syncData() {
  try {
    console.log('📡 Connexion à Render PostgreSQL...');
    
    // Récupérer les données depuis Render
    console.log('📥 Téléchargement des utilisateurs...');
    const users = await renderPool.query('SELECT * FROM users ORDER BY id');
    
    console.log('📥 Téléchargement des amis...');
    const friends = await renderPool.query('SELECT * FROM friends ORDER BY id');
    
    console.log('📥 Téléchargement des conversations...');
    const conversations = await renderPool.query('SELECT * FROM conversations ORDER BY id');
    
    console.log('📥 Téléchargement des demandes de conversation...');
    const convRequests = await renderPool.query('SELECT * FROM conversation_requests ORDER BY id');
    
    console.log('📥 Téléchargement des messages...');
    const messages = await renderPool.query('SELECT * FROM messages ORDER BY id');
    
    console.log(`\n✅ Données récupérées de Render:
   - ${users.rows.length} utilisateurs
   - ${friends.rows.length} amis
   - ${conversations.rows.length} conversations
   - ${convRequests.rows.length} demandes de conversation
   - ${messages.rows.length} messages\n`);

    // Nettoyage local
    console.log('🗑️  Nettoyage de la base locale...');
    await localPool.query('TRUNCATE users, friends, conversations, conversation_requests, messages CASCADE');

    // Import dans Docker local
    console.log('📤 Import des utilisateurs...');
    for (const user of users.rows) {
      await localPool.query(
        'INSERT INTO users (id, pseudo, created_at) VALUES ($1, $2, $3)',
        [user.id, user.pseudo, user.created_at]
      );
    }

    console.log('📤 Import des amis...');
    for (const friend of friends.rows) {
      await localPool.query(
        'INSERT INTO friends (id, sender, receiver, status, created_at) VALUES ($1, $2, $3, $4, $5)',
        [friend.id, friend.sender, friend.receiver, friend.status, friend.created_at]
      );
    }

    console.log('📤 Import des conversations...');
    for (const conv of conversations.rows) {
      await localPool.query(
        'INSERT INTO conversations (id, user1, user2, created_at) VALUES ($1, $2, $3, $4)',
        [conv.id, conv.user1, conv.user2, conv.created_at]
      );
    }

    console.log('📤 Import des demandes de conversation...');
    for (const req of convRequests.rows) {
      await localPool.query(
        'INSERT INTO conversation_requests (id, sender, receiver, preview, status, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.id, req.sender, req.receiver, req.preview, req.status, req.created_at]
      );
    }

    console.log('📤 Import des messages...');
    for (const msg of messages.rows) {
      await localPool.query(
        'INSERT INTO messages (id, conversation_id, sender, body, created_at) VALUES ($1, $2, $3, $4, $5)',
        [msg.id, msg.conversation_id, msg.sender, msg.body, msg.created_at]
      );
    }

    // Mise à jour des séquences
    console.log('🔢 Mise à jour des séquences...');
    await localPool.query(`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`);
    await localPool.query(`SELECT setval('friends_id_seq', (SELECT COALESCE(MAX(id), 1) FROM friends))`);
    await localPool.query(`SELECT setval('conversation_requests_id_seq', (SELECT COALESCE(MAX(id), 1) FROM conversation_requests))`);

    console.log('\n✅ Synchronisation terminée avec succès !');
    console.log(`\n📊 Base locale maintenant :
   - ${users.rows.length} utilisateurs
   - ${friends.rows.length} amis  
   - ${conversations.rows.length} conversations
   - ${messages.rows.length} messages\n`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await renderPool.end();
    await localPool.end();
  }
}

syncData();
