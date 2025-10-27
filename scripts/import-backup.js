// Script pour importer un backup JSON dans PostgreSQL Docker
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Configuration PostgreSQL Docker
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'chatuser',
  password: 'chatpassword',
  database: 'chat_db',
  ssl: false
});

async function importBackup(backupFile) {
  try {
    console.log(`📂 Lecture du fichier ${backupFile}...`);
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const tables = data.tables;

    console.log('🗑️  Nettoyage des tables existantes...');
    await pool.query('TRUNCATE users, friends, conversations, conversation_requests, messages CASCADE');

    // Import users
    console.log(`👤 Import de ${tables.users.length} utilisateurs...`);
    for (const user of tables.users) {
      await pool.query(
        'INSERT INTO users (id, pseudo, created_at) VALUES ($1, $2, $3) ON CONFLICT (pseudo) DO NOTHING',
        [user.id, user.pseudo, user.date_inscription || new Date()]
      );
    }

    // Import friends
    console.log(`👥 Import de ${tables.friends.length} relations d'amis...`);
    for (const friend of tables.friends) {
      await pool.query(
        'INSERT INTO friends (id, sender, receiver, status, created_at) VALUES ($1, $2, $3, $4, $5)',
        [friend.id, friend.sender, friend.receiver, friend.status, friend.date_action || friend.created_at || new Date()]
      );
    }

    // Import conversations
    console.log(`💬 Import de ${tables.conversations.length} conversations...`);
    for (const conv of tables.conversations) {
      await pool.query(
        'INSERT INTO conversations (id, user1, user2, created_at) VALUES ($1, $2, $3, $4)',
        [conv.id, conv.user1, conv.user2, conv.created_at || new Date()]
      );
    }

    // Import conversation_requests
    console.log(`📬 Import de ${tables.conversation_requests.length} demandes de conversation...`);
    for (const req of tables.conversation_requests) {
      await pool.query(
        'INSERT INTO conversation_requests (id, sender, receiver, preview, status, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.id, req.sender, req.receiver, req.preview, req.status, req.created_at || new Date()]
      );
    }

    // Import messages
    console.log(`✉️  Import de ${tables.messages.length} messages...`);
    const conversationIds = new Set(tables.conversations.map(c => c.id));
    let skipped = 0;
    for (const msg of tables.messages) {
      // Ignorer les messages sans conversation valide
      if (!conversationIds.has(msg.conversation_id)) {
        skipped++;
        continue;
      }
      await pool.query(
        'INSERT INTO messages (id, conversation_id, sender, body, created_at) VALUES ($1, $2, $3, $4, $5)',
        [msg.id, msg.conversation_id, msg.pseudo || msg.sender, msg.content || msg.body, msg.date_envoi || msg.created_at || new Date()]
      );
    }
    if (skipped > 0) {
      console.log(`   ⚠️  ${skipped} messages orphelins ignorés`);
    }

    // Reset sequences pour les auto-increment
    console.log('🔢 Mise à jour des séquences...');
    try {
      await pool.query(`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`);
      await pool.query(`SELECT setval('friends_id_seq', (SELECT COALESCE(MAX(id), 1) FROM friends))`);
      // Conversations et messages utilisent des timestamps comme IDs, on ne touche pas aux séquences
      await pool.query(`SELECT setval('conversation_requests_id_seq', (SELECT COALESCE(MAX(id), 1) FROM conversation_requests))`);
    } catch (e) {
      console.log('   ⚠️  Impossible de mettre à jour certaines séquences (IDs trop grands)');
    }

    console.log('✅ Import terminé avec succès !');
    
    // Stats
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM friends) as friends,
        (SELECT COUNT(*) FROM conversations) as conversations,
        (SELECT COUNT(*) FROM messages) as messages
    `);
    console.log('\n📊 Statistiques:');
    console.log(`   - Utilisateurs: ${stats.rows[0].users}`);
    console.log(`   - Amis: ${stats.rows[0].friends}`);
    console.log(`   - Conversations: ${stats.rows[0].conversations}`);
    console.log(`   - Messages: ${stats.rows[0].messages}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Utiliser le backup le plus récent
const backupFile = process.argv[2] || 'backups/backup-2025-10-12T21-24-43-772Z.json';
importBackup(backupFile);
