-- Schema PostgreSQL pour chat-db
-- À exécuter sur votre base de données Render

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  pseudo VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des amis
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(100) NOT NULL,
  receiver VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user1 VARCHAR(100) NOT NULL,
  user2 VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des demandes de conversation
CREATE TABLE IF NOT EXISTS conversation_requests (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(100) NOT NULL,
  receiver VARCHAR(100) NOT NULL,
  preview TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender VARCHAR(100) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_friends_sender ON friends(sender);
CREATE INDEX IF NOT EXISTS idx_friends_receiver ON friends(receiver);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_requests_receiver ON conversation_requests(receiver);
