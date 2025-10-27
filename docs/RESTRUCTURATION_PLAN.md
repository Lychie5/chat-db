# 🗂️ Restructuration du Repository

## Structure proposée :

```
chat-app/
├── 📱 mobile/              (React Native Expo)
│   ├── app/
│   ├── components/
│   ├── config/
│   └── ...
│
├── 🌐 backend/             (Node.js + Express + Socket.IO)
│   ├── src/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── 🎨 frontend/            (Web - HTML/CSS/JS)
│   ├── pages/
│   ├── css/
│   ├── js/
│   └── assets/
│
├── 🗄️ database/
│   ├── schemas/
│   │   ├── postgresql.sql
│   │   └── sqlite.sql
│   └── migrations/
│
├── 🛠️ scripts/            (Outils utilitaires)
│   ├── sync-from-render.js
│   ├── import-backup.js
│   └── db-tools/
│
├── 📦 backups/
│
├── 📚 docs/               (Documentation)
│   ├── setup/
│   ├── deployment/
│   └── guides/
│
├── 🐳 docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── nginx/
│
├── .github/
│   └── workflows/
│
├── .gitignore
├── README.md
└── package.json
```

## Actions à effectuer :

### ✅ À garder (réorganiser)
- backend/ → Déplacer server.js, routes, socket
- frontend/ → Déplacer public/
- mobile/ → Renommer chat-db-mobile/
- database/ → Déplacer schemas + tools/
- scripts/ → Déplacer utilitaires
- docs/ → Déplacer tous les .md

### ❌ À supprimer
- ngrok/ (inutilisé)
- fix-conv-*.* (fichiers de debug obsolètes)
- DIAGNOSTIC-COMPLET.md (debug obsolète)
- .expo/ (généré, déjà dans .gitignore)
- app.json (racine - doit être dans mobile/)
- eas.json (racine - doit être dans mobile/)
- tsconfig.json (racine - doit être dans mobile/)
- manifest.json, service-worker.js (web obsolète)

### 📝 À nettoyer dans package.json
- Supprimer dépendances inutilisées
- Séparer backend et frontend

Lancer la restructuration ? (Y/n)
