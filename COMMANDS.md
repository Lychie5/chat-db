# 🎯 Commandes Utiles - Meo Chat

## 🚀 Installation

```bash
# Installation automatique complète
npm run setup:oauth

# Installation manuelle backend
npm install

# Installation manuelle mobile
cd chat-db-mobile && npm install && cd ..

# Migration de la base de données
npm run migrate:oauth
```

---

## 🔧 Développement

### Backend

```bash
# Démarrer le serveur
npm start

# Démarrer avec nodemon (auto-reload)
npm run dev

# Tester la connexion à la base de données
npm run test:db

# Exécuter la migration OAuth
npm run migrate:oauth
```

### Mobile

```bash
cd chat-db-mobile

# Démarrer Expo
npx expo start

# Démarrer sur Android
npx expo start --android

# Démarrer sur iOS
npx expo start --ios

# Rebuild natif (après modification app.json)
npx expo prebuild

# Build Android
npx expo run:android

# Build iOS
npx expo run:ios

# Clear cache
npx expo start --clear
```

---

## 🗄️ Base de données

### PostgreSQL local

```bash
# Se connecter
psql -U username -d database_name

# Lister les tables
\dt

# Voir la structure de la table users
\d users

# Voir les utilisateurs OAuth
SELECT id, username, provider, email, photo_url FROM users WHERE provider != 'local';

# Voir les sessions OAuth actives
SELECT * FROM oauth_sessions;

# Nettoyer les sessions expirées
DELETE FROM oauth_sessions WHERE expires_at < NOW();
```

### Backup et Restore

```bash
# Backup
pg_dump -U username database_name > backup.sql

# Restore
psql -U username database_name < backup.sql

# Backup uniquement les données
pg_dump -U username --data-only database_name > data_backup.sql
```

---

## 🔐 Sécurité

### Générer des secrets

```bash
# JWT Secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# UUID v4
node -e "console.log(require('crypto').randomUUID())"
```

### Vérifier les variables d'environnement

```bash
# Afficher toutes les variables (sans valeurs sensibles)
cat .env | grep -v "SECRET\|PASSWORD"

# Vérifier une variable spécifique
echo $DATABASE_URL
```

---

## 🧪 Tests

### Endpoints API

```bash
# Health check
curl http://localhost:3000/health

# Test OAuth redirect (devrait rediriger vers Google)
curl -L http://localhost:3000/auth/google

# Test récupération du profil (avec token)
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"

# Test upload photo
curl -X POST http://localhost:3000/api/profile/photo \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -F "photo=@/path/to/image.jpg"

# Test modification pseudo
curl -X POST http://localhost:3000/api/profile/username \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"nouveau_pseudo"}'
```

### Deep Linking

```bash
# Android (avec adb)
adb shell am start -W -a android.intent.action.VIEW \
  -d "myapp://auth?token=test&user=%7B%22id%22%3A1%7D"

# iOS (avec Simulator ouvert)
xcrun simctl openurl booted "myapp://auth?token=test&user=%7B%22id%22%3A1%7D"
```

---

## 📦 Build et Déploiement

### Build Production

```bash
# Backend - Installer en production
npm ci --production

# Mobile - Build Android APK
cd chat-db-mobile
eas build --platform android --profile production

# Mobile - Build iOS
eas build --platform ios --profile production
```

### Déploiement Render

```bash
# Vérifier les changements avant commit
git status
git diff

# Commit et push
git add .
git commit -m "feat: Add OAuth authentication"
git push origin main

# Render va automatiquement déployer
```

---

## 🔍 Debugging

### Logs Backend

```bash
# Afficher les logs en temps réel
tail -f logs/server.log

# Rechercher des erreurs
grep "ERROR" logs/server.log

# Afficher les dernières 100 lignes
tail -n 100 logs/server.log
```

### Logs Mobile

```bash
# Logs React Native
npx react-native log-android
npx react-native log-ios

# Logs Expo
npx expo start --dev-client

# Afficher uniquement les erreurs
npx expo start --dev-client --no-dev --minify
```

### Debugging PostgreSQL

```bash
# Voir les connexions actives
SELECT * FROM pg_stat_activity WHERE datname = 'votre_database';

# Tuer une connexion bloquée
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'votre_database' AND state = 'idle in transaction';

# Voir la taille de la base
SELECT pg_size_pretty(pg_database_size('votre_database'));

# Voir les tables les plus volumineuses
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🧹 Nettoyage

### Node Modules

```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Mobile
cd chat-db-mobile
rm -rf node_modules package-lock.json
npm install
```

### Cache Expo

```bash
cd chat-db-mobile

# Clear cache Metro Bundler
npx expo start --clear

# Clear cache npm
npm cache clean --force

# Réinitialiser complètement
rm -rf node_modules .expo ios android package-lock.json
npm install
npx expo prebuild
```

### Fichiers temporaires

```bash
# Supprimer les logs
rm -rf logs/*.log

# Supprimer les backups anciens
rm -rf backups/*-2024-*.json

# Supprimer les photos de profil de test
rm -rf public/uploads/profiles/profile-test-*.jpg
```

---

## 📊 Monitoring

### Statistiques serveur

```bash
# Nombre d'utilisateurs
psql -U username -d database -c "SELECT COUNT(*) FROM users;"

# Utilisateurs par provider
psql -U username -d database -c "
  SELECT provider, COUNT(*) 
  FROM users 
  GROUP BY provider 
  ORDER BY COUNT(*) DESC;
"

# Sessions actives
psql -U username -d database -c "
  SELECT COUNT(*) 
  FROM oauth_sessions 
  WHERE expires_at > NOW();
"

# Dernières inscriptions
psql -U username -d database -c "
  SELECT username, provider, created_at 
  FROM users 
  ORDER BY created_at DESC 
  LIMIT 10;
"
```

### Santé du serveur

```bash
# CPU et mémoire
top

# Espace disque
df -h

# Processus Node.js
ps aux | grep node

# Ports en écoute
netstat -tuln | grep 3000
```

---

## 🔄 Maintenance

### Mise à jour des dépendances

```bash
# Vérifier les updates disponibles
npm outdated

# Mettre à jour un package spécifique
npm update passport

# Mettre à jour tous les packages (attention!)
npm update

# Mettre à jour npm lui-même
npm install -g npm@latest
```

### Optimisation base de données

```bash
# Vacuum et analyze
psql -U username -d database -c "VACUUM ANALYZE;"

# Réindexer
psql -U username -d database -c "REINDEX DATABASE database_name;"

# Nettoyer les sessions expirées (à faire régulièrement)
psql -U username -d database -c "
  DELETE FROM oauth_sessions 
  WHERE expires_at < NOW() - INTERVAL '7 days';
"
```

---

## 🆘 Aide

### Documentation

```bash
# Lire la documentation OAuth
cat OAUTH_SETUP_GUIDE.md | less

# Rechercher dans la documentation
grep -r "Google OAuth" *.md

# Ouvrir dans VS Code
code OAUTH_SETUP_GUIDE.md
```

### Support

```bash
# Vérifier la version de Node
node --version

# Vérifier la version de npm
npm --version

# Vérifier la version d'Expo
npx expo --version

# Informations système
npx expo doctor
```

---

## 🎓 Commandes utiles pour apprendre

### Analyser le code

```bash
# Compter les lignes de code backend
find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l

# Compter les lignes de code mobile
find chat-db-mobile/app -name "*.tsx" | xargs wc -l

# Rechercher un mot dans le code
grep -r "passport" --include="*.js"

# Voir la structure du projet
tree -L 2 -I "node_modules"
```

### Git

```bash
# Voir l'historique des commits
git log --oneline --graph

# Voir les fichiers modifiés
git status

# Voir les différences
git diff

# Créer une branche pour tester
git checkout -b test-oauth

# Revenir à main
git checkout main
```

---

## 📝 Snippets utiles

### Créer un nouvel endpoint OAuth

```javascript
// Dans auth/oauth-routes.js
app.get('/api/monendpoint', verifyJWT, async (req, res) => {
  try {
    // Votre code ici
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```

### Ajouter une colonne à la BDD

```javascript
// Créer un fichier tools/migrate_add_column.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query('ALTER TABLE users ADD COLUMN nouvelle_colonne TEXT;');
  console.log('✅ Migration OK');
  await pool.end();
}

migrate();
```

---

**💡 Astuce** : Ajoutez ces commandes dans vos alias shell pour aller plus vite !

```bash
# Dans ~/.bashrc ou ~/.zshrc
alias meo-start="npm start"
alias meo-mobile="cd chat-db-mobile && npx expo start"
alias meo-migrate="npm run migrate:oauth"
alias meo-logs="tail -f logs/server.log"
```
