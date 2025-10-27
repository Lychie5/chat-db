import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration PostgreSQL : utilise DATABASE_URL si disponible, sinon les variables individuelles
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: process.env.DB_CONN_LIMIT || 10,
    });

pool.connect()
  .then(() => console.log("✅ Connexion PostgreSQL Render OK"))
  .catch(err => console.error("❌ Erreur PostgreSQL :", err.message));

const app = express();
const server = http.createServer(app);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST", "OPTIONS"] },
});

app.use(express.json());
app.use(express.static("public"));
app.use(cors({ origin: CORS_ORIGIN, methods: ["GET", "POST", "OPTIONS"] }));

const activeUsers = new Set();
const userSockets = new Map();

async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error("❌ SQL error:", err.message);
    throw err;
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.get("/api/check-user/:pseudo", async (req, res) => {
  const pseudo = req.params.pseudo;
  try {
    const rows = await query("SELECT * FROM users WHERE pseudo=$1", [pseudo]);
    res.json({ exists: rows.length > 0 });
  } catch {
    res.status(500).json({ error: true });
  }
});

app.get("/api/conversations", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM conversations");
    res.json(rows);
  } catch {
    res.status(500).send("Erreur SQL");
  }
});

app.get("/api/conversations/:user", async (req, res) => {
  const user = req.params.user;
  try {
    const rows = await query(
      "SELECT * FROM conversations WHERE user1=$1 OR user2=$1",
      [user]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Erreur SQL" });
  }
});

app.post("/api/new-conversation", async (req, res) => {
  const { user1, user2 } = req.body;
  if (!user1 || !user2) return res.status(400).send("Champs manquants");
  try {
    const frows = await query(
      "SELECT * FROM friends WHERE ((sender=$1 AND receiver=$2) OR (sender=$2 AND receiver=$1)) AND status='accepted' LIMIT 1",
      [user1, user2]
    );
    if (!frows.length) return res.status(403).json({ error: "not_friends" });
    const exists = await query(
      "SELECT * FROM conversations WHERE (user1=$1 AND user2=$2) OR (user1=$2 AND user2=$1)",
      [user1, user2]
    );
    if (exists.length > 0) return res.json({ id: exists[0].id });
    const result = await query(
      "INSERT INTO conversations (user1, user2) VALUES ($1, $2) RETURNING id",
      [user1, user2]
    );
    res.json({ id: result[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur SQL");
  }
});

// Envoyer une demande de conversation
app.post("/api/send-conversation-request", async (req, res) => {
  const { sender, receiver, preview } = req.body;
  if (!sender || !receiver) return res.status(400).send("Champs manquants");
  
  try {
    // Vérifier qu'ils sont amis
    const friends = await query(
      "SELECT * FROM friends WHERE ((LOWER(sender)=LOWER($1) AND LOWER(receiver)=LOWER($2)) OR (LOWER(sender)=LOWER($2) AND LOWER(receiver)=LOWER($1))) AND status='accepted'",
      [sender, receiver]
    );
    
    if (friends.length === 0) {
      return res.status(403).json({ error: "Vous devez être amis pour démarrer une conversation" });
    }
    
    // Vérifier si une demande existe déjà
    const existing = await query(
      "SELECT * FROM conversation_requests WHERE (LOWER(sender)=LOWER($1) AND LOWER(receiver)=LOWER($2)) OR (LOWER(sender)=LOWER($2) AND LOWER(receiver)=LOWER($1))",
      [sender, receiver]
    );
    
    if (existing.length > 0) {
      return res.status(400).send("Demande déjà existante");
    }
    
    // Vérifier si une conversation existe déjà
    const conv = await query(
      "SELECT * FROM conversations WHERE (LOWER(user1)=LOWER($1) AND LOWER(user2)=LOWER($2)) OR (LOWER(user1)=LOWER($2) AND LOWER(user2)=LOWER($1))",
      [sender, receiver]
    );
    
    if (conv.length > 0) {
      return res.status(400).send("Conversation déjà existante");
    }
    
    // Créer la demande
    await query(
      "INSERT INTO conversation_requests (sender, receiver, preview, status) VALUES ($1, $2, $3, 'pending')",
      [sender, receiver, preview || ""]
    );
    
    // Notifier en temps réel
    io.emit('new conversation request', { sender, receiver, preview });
    
    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur send-conversation-request:", err);
    res.status(500).send("Erreur SQL");
  }
});

// Récupérer les demandes de conversation reçues
app.get("/api/conversation-requests/:user", async (req, res) => {
  const user = req.params.user;
  try {
    const requests = await query(
      "SELECT * FROM conversation_requests WHERE LOWER(receiver)=LOWER($1) AND status='pending'",
      [user]
    );
    res.json(requests);
  } catch (err) {
    console.error("Erreur conversation-requests:", err);
    res.status(500).send("Erreur SQL");
  }
});

// Accepter une demande de conversation
app.post("/api/conversation-accept/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Récupérer la demande
    const requests = await query(
      "SELECT * FROM conversation_requests WHERE id=$1",
      [id]
    );
    
    if (requests.length === 0) {
      return res.status(404).send("Demande introuvable");
    }
    
    const request = requests[0];
    
    // Créer la conversation
    const result = await query(
      "INSERT INTO conversations (user1, user2) VALUES ($1, $2) RETURNING *",
      [request.sender, request.receiver]
    );
    
    // Supprimer la demande
    await query("DELETE FROM conversation_requests WHERE id=$1", [id]);
    
    const conversation = result[0];
    
    // Notifier en temps réel
    io.emit('conversation accepted', {
      id: conversation.id,
      user1: conversation.user1,
      user2: conversation.user2,
      sender: request.sender,
      receiver: request.receiver
    });
    
    res.json(conversation);
  } catch (err) {
    console.error("Erreur conversation-accept:", err);
    res.status(500).send("Erreur SQL");
  }
});

// Refuser une demande de conversation
app.post("/api/conversation-decline/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await query("DELETE FROM conversation_requests WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur conversation-decline:", err);
    res.status(500).send("Erreur SQL");
  }
});

app.get("/api/messages/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await query(
      "SELECT * FROM messages WHERE conversation_id=$1 ORDER BY id ASC",
      [id]
    );
    res.json(rows);
  } catch {
    res.status(500).send("Erreur SQL");
  }
});

io.on("connection", (socket) => {
  console.log("🔌 Client connecté :", socket.id);

  socket.on("register", (pseudo) => {
    if (!pseudo) return;
    const key = pseudo.toLowerCase();
    let set = userSockets.get(key);
    if (!set) {
      set = new Set();
      userSockets.set(key, set);
    }
    set.add(socket.id);
    console.log(`🔎 ${pseudo} enregistré -> ${socket.id}`);
  });

  socket.on("join conversation", async (convId) => {
    const room = `conv-${convId}`;
    socket.join(room);
    console.log(`🔐 ${socket.id} rejoint ${room}`);
    const rows = await query(
      "SELECT * FROM messages WHERE conversation_id=$1 ORDER BY id ASC",
      [convId]
    );
    io.to(socket.id).emit("conversation history", {
      conversation_id: convId,
      messages: rows,
    });
  });

  socket.on("chat message", async (msg) => {
    if (!msg || !msg.conversation_id || !msg.pseudo || !msg.text) return;
    const convoId = msg.conversation_id;
    const room = `conv-${convoId}`;
    try {
      await query(
        "INSERT INTO messages (conversation_id, sender, body) VALUES ($1, $2, $3)",
        [convoId, msg.pseudo, msg.text]
      );
      io.to(room).emit("chat message", msg);
      console.log(`✉️ Message ${msg.pseudo} → ${room}`);
    } catch (err) {
      console.error("Erreur message :", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Déconnecté :", socket.id);
    for (const [pseudo, set] of userSockets.entries()) {
      if (set.has(socket.id)) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(pseudo);
      }
    }
  });
});

app.post("/api/send-friend-request", async (req, res) => {
  const { sender, receiver } = req.body;
  if (!sender || !receiver) return res.status(400).send("Champs manquants");
  try {
    const results = await query(
      "SELECT * FROM friends WHERE (LOWER(sender)=LOWER($1) AND LOWER(receiver)=LOWER($2)) OR (LOWER(sender)=LOWER($2) AND LOWER(receiver)=LOWER($1))",
      [sender, receiver]
    );
    if (results.length > 0)
      return res.status(400).send("Demande déjà existante");
    await query(
      "INSERT INTO friends (sender, receiver, status) VALUES ($1, $2, 'pending')",
      [sender, receiver]
    );
    
    // Émettre un événement Socket.IO pour notifier le destinataire en temps réel
    io.emit('new friend request', { sender, receiver });
    
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur SQL");
  }
});

app.get("/api/friends/:user", async (req, res) => {
  const user = req.params.user;
  try {
    const results = await query(
      "SELECT * FROM friends WHERE (sender=$1 OR receiver=$1) AND status='accepted'",
      [user]
    );
    res.json(results);
  } catch {
    res.status(500).send("Erreur SQL");
  }
});

// Récupérer les demandes d'amis reçues (en attente)
app.get("/api/friend-requests/:user", async (req, res) => {
  const user = req.params.user;
  try {
    const results = await query(
      "SELECT * FROM friends WHERE LOWER(receiver)=LOWER($1) AND status='pending'",
      [user]
    );
    res.json(results);
  } catch (err) {
    console.error("Erreur lors de la récupération des demandes:", err);
    res.status(500).send("Erreur SQL");
  }
});

app.post("/api/friend-accept/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await query("UPDATE friends SET status='accepted' WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch {
    res.status(500).send("Erreur SQL");
  }
});

app.post("/api/friend-decline/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await query("DELETE FROM friends WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch {
    res.status(500).send("Erreur SQL");
  }
});

app.post("/api/delete-friend", async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    await query(
      "DELETE FROM friends WHERE ((sender=$1 AND receiver=$2) OR (sender=$2 AND receiver=$1)) AND status='accepted'",
      [user1, user2]
    );
    res.sendStatus(200);
  } catch {
    res.status(500).send("Erreur SQL");
  }
});

app.post("/api/login", async (req, res) => {
  const { pseudo } = req.body;
  if (!pseudo) return res.status(400).send("Pseudo manquant");
  activeUsers.add(pseudo);
  try {
    await query("INSERT INTO users (pseudo) VALUES ($1) ON CONFLICT DO NOTHING", [pseudo]);
    res.json({ success: true });
  } catch {
    res.status(500).send("Erreur SQL");
  }
});

app.get("/api/connected", (req, res) => {
  res.json([...activeUsers]);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Serveur lancé sur le port ${PORT}`)
);
