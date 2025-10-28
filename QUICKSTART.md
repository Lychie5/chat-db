# ⚡ Quick Start - OAuth Authentication

## 🚀 Installation en 5 minutes

### Option 1 : Installation automatique (recommandé)

```bash
npm run setup:oauth
```

Le script va :
- ✅ Installer toutes les dépendances
- ✅ Créer le fichier .env avec secrets générés
- ✅ Migrer la base de données
- ✅ Vérifier la configuration

### Option 2 : Installation manuelle

```bash
# 1. Installer les dépendances backend
npm install

# 2. Installer les dépendances mobile
cd chat-db-mobile
npm install
cd ..

# 3. Copier et configurer .env
cp .env.example .env
# Remplir DATABASE_URL et générer des secrets

# 4. Migrer la base de données
npm run migrate:oauth
```

---

## 🔑 Générer des secrets

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 Configuration OAuth Minimale

### Google OAuth (le plus simple)

1. **Google Cloud Console** : https://console.cloud.google.com/
2. **Créer un projet** → APIs & Services → Credentials
3. **Create Credentials** → OAuth 2.0 Client ID
4. **Type** : Web Application
5. **Redirect URI** : `http://localhost:3000/auth/google/callback`
6. **Copier** Client ID et Secret dans `.env`

```bash
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

### GitHub OAuth

1. **GitHub Settings** : https://github.com/settings/developers
2. **New OAuth App**
3. **Callback URL** : `http://localhost:3000/auth/github/callback`
4. **Copier** Client ID et Secret dans `.env`

```bash
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

---

## 🧪 Tester en local

```bash
# Terminal 1 : Backend
npm start

# Terminal 2 : Mobile
cd chat-db-mobile
npx expo start
```

Testez :
1. Ouvrez l'app mobile sur votre téléphone (Expo Go)
2. Cliquez sur "Google" ou "GitHub"
3. Autorisez l'accès
4. Vous devriez être redirigé vers l'app avec votre compte créé

---

## 🐛 Problèmes courants

### "Cannot find module 'passport'"
```bash
npm install
```

### "expo-auth-session not found"
```bash
cd chat-db-mobile
npm install
```

### "Redirect URI mismatch"
➡️ Vérifiez que l'URL dans le dashboard OAuth correspond exactement à celle dans votre code

### Deep linking ne marche pas
```bash
cd chat-db-mobile
npx expo prebuild
npx expo run:android  # ou run:ios
```

---

## 📚 Documentation complète

- **Guide OAuth complet** : [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)
- **Fonctionnalités** : [OAUTH_FEATURES.md](./OAUTH_FEATURES.md)
- **Variables d'environnement** : [.env.example](./.env.example)

---

## ✨ En production (Render)

1. **Ajouter les variables** dans Render Dashboard → Environment
2. **Mettre à jour les Redirect URIs** sur chaque plateforme OAuth avec votre URL Render :
   ```
   https://votre-app.onrender.com/auth/google/callback
   https://votre-app.onrender.com/auth/github/callback
   ```
3. **Déployer** :
   ```bash
   git add .
   git commit -m "Add OAuth authentication"
   git push
   ```

---

🎉 **C'est tout !** Votre app dispose maintenant d'une authentification OAuth professionnelle.
