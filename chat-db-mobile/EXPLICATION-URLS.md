# 🔌 Explication : SOCKET_URL vs BASE_URL vs Base de données

## 📍 Vos URLs actuelles (CORRECTES ✅)

```typescript
BASE_URL: 'https://meo-mv5n.onrender.com'
SOCKET_URL: 'https://meo-mv5n.onrender.com'
```

**Les deux pointent vers le MÊME serveur !** C'est normal et correct.

---

## 🤔 Pourquoi deux URLs identiques ?

### 1️⃣ **BASE_URL** (API REST)
Utilisée pour les requêtes HTTP classiques :
```javascript
// Exemples d'utilisation :
fetch(`${BASE_URL}/api/login`)           // Se connecter
fetch(`${BASE_URL}/api/conversations`)   // Récupérer conversations
fetch(`${BASE_URL}/api/messages/123`)    // Récupérer messages
```

### 2️⃣ **SOCKET_URL** (WebSocket)
Utilisée pour la communication en temps réel :
```javascript
// Connexion Socket.IO
const socket = io(SOCKET_URL);

// Recevoir des messages en direct
socket.on('message', (data) => {
  console.log('Nouveau message reçu !', data);
});

// Recevoir des notifications
socket.on('new conversation request', (data) => {
  console.log('Nouvelle demande !', data);
});
```

---

## 🏗️ Architecture complète de votre app

```
┌─────────────────────────────────────────────────────────┐
│  📱 iPhone (Application Mobile Expo)                    │
│                                                          │
│  Connexion à: https://meo-mv5n.onrender.com            │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ BASE_URL (fetch)                         │          │
│  │ ↓                                         │          │
│  │ • POST /api/login                        │          │
│  │ • GET /api/conversations                 │          │
│  │ • GET /api/friends/username              │          │
│  │ • POST /api/send-message                 │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ SOCKET_URL (Socket.IO WebSocket)        │          │
│  │ ↓                                         │          │
│  │ • Écoute 'message' (nouveau message)     │          │
│  │ • Écoute 'new conversation request'      │          │
│  │ • Écoute 'friend request'                │          │
│  │ • Émet 'join' pour rejoindre une room    │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
                        ↓
                        ↓ HTTPS + WebSocket
                        ↓
┌─────────────────────────────────────────────────────────┐
│  🖥️ SERVEUR (Render)                                   │
│  https://meo-mv5n.onrender.com                         │
│                                                          │
│  📄 server.js contient:                                │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ Express.js (API REST)                    │          │
│  │                                           │          │
│  │ app.get('/api/conversations', ...)       │          │
│  │ app.post('/api/login', ...)              │          │
│  │ app.get('/api/messages/:id', ...)        │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ Socket.IO (WebSocket)                    │          │
│  │                                           │          │
│  │ io.on('connection', (socket) => {        │          │
│  │   socket.on('message', ...)              │          │
│  │   socket.emit('message', ...)            │          │
│  │ })                                        │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  Variables d'environnement (.env):                      │
│  • PORT=8080                                            │
│  • DB_HOST=...                                          │
│  • DB_USER=...                                          │
│  • DB_PASSWORD=...                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
                        ↓ SQL (pg library)
                        ↓
┌─────────────────────────────────────────────────────────┐
│  🗄️ BASE DE DONNÉES PostgreSQL                         │
│  (Railway/Render Database)                              │
│                                                          │
│  URL interne: mysql.railway.internal:3306               │
│  ou similar...                                          │
│                                                          │
│  ⚠️ JAMAIS accessible directement depuis l'app mobile! │
│                                                          │
│  Tables:                                                 │
│  • users                                                 │
│  • conversations                                         │
│  • messages                                              │
│  • friends                                               │
│  • conversation_requests                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Pourquoi l'app mobile ne se connecte PAS directement à la DB ?

### ❌ **MAUVAIS** (Dangereux)
```
Application Mobile ──→ Base de données PostgreSQL
                      ❌ Expose les credentials
                      ❌ Pas de validation
                      ❌ Pas de sécurité
```

### ✅ **BON** (Sécurisé)
```
Application Mobile ──→ API Server ──→ Base de données
                      ✅ Credentials cachés
                      ✅ Validation côté serveur
                      ✅ Contrôle d'accès
```

---

## 📝 Exemple concret : Envoyer un message

### Dans votre app mobile (React Native) :

```typescript
// 1. Envoi via API REST
const sendMessage = async (conversationId, text) => {
  const response = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      pseudo: currentUser,
      content: text
    })
  });
  return response.json();
};

// 2. Recevoir en temps réel via Socket.IO
import io from 'socket.io-client';

const socket = io(SOCKET_URL);

socket.on('message', (messageData) => {
  console.log('Message reçu en direct !', messageData);
  // Mettre à jour l'interface utilisateur
  addMessageToUI(messageData);
});
```

### Dans server.js (sur Render) :

```javascript
// Réception de la requête API
app.post('/api/messages', async (req, res) => {
  const { conversation_id, pseudo, content } = req.body;
  
  // ⬇️ ICI : Connexion à la base de données PostgreSQL
  const result = await pool.query(
    'INSERT INTO messages (conversation_id, pseudo, content) VALUES ($1, $2, $3) RETURNING *',
    [conversation_id, pseudo, content]
  );
  
  const message = result.rows[0];
  
  // ⬇️ Envoyer à tous les clients connectés via Socket.IO
  io.to(conversation_id).emit('message', message);
  
  res.json(message);
});
```

---

## 🎯 Résumé simple

| Concept | C'est quoi ? | Valeur dans votre cas |
|---------|--------------|----------------------|
| **BASE_URL** | L'URL de votre serveur API | `https://meo-mv5n.onrender.com` |
| **SOCKET_URL** | L'URL de votre serveur WebSocket | `https://meo-mv5n.onrender.com` (même serveur !) |
| **Base de données** | PostgreSQL hébergée ailleurs | Accessible uniquement par server.js via credentials secrets |

---

## ✅ Votre configuration est PARFAITE !

Les deux URLs sont identiques parce que :
- Votre serveur Express gère à la fois l'API REST **ET** Socket.IO
- C'est le setup le plus simple et le plus courant
- Ça fonctionne très bien !

Dans certains projets complexes, on peut avoir :
```
BASE_URL: https://api.example.com
SOCKET_URL: https://ws.example.com  // Serveur séparé
```

Mais pour votre cas, **un seul serveur suffit largement** ! 🎉
