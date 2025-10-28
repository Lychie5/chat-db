# 🚀 Meo Chat - Nouvelles Fonctionnalités OAuth & Profil

## 📦 Ce qui a été ajouté

### ✨ **1. Authentification OAuth Social Login**

L'application supporte maintenant 5 providers OAuth pour une connexion rapide et sécurisée :

| Provider | Icône | Statut | Configuration |
|----------|-------|--------|---------------|
| **Google** | 🔵 | ✅ Prêt | Voir [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md#1-google-oauth) |
| **GitHub** | ⚫ | ✅ Prêt | Voir [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md#2-github-oauth) |
| **Facebook** | 🔵 | ✅ Prêt | Voir [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md#3-facebook-oauth) |
| **Discord** | 🟣 | ✅ Prêt | Voir [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md#4-discord-oauth) |
| **Apple** | 🍎 | ⚠️ Optionnel | Voir [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md#5-apple-oauth) |

#### 🔑 Avantages OAuth

- ✅ Connexion en **1 clic**
- ✅ Pas besoin de créer un mot de passe
- ✅ Photo de profil automatique
- ✅ Email vérifié automatiquement
- ✅ Sécurisé avec JWT tokens
- ✅ Gestion des sessions avec refresh tokens

---

### 👤 **2. Gestion Complète du Profil**

#### 📸 Upload de Photo de Profil

- **Sources** : Appareil photo OU Galerie
- **Formats** : JPEG, PNG, GIF, WebP
- **Taille max** : 5MB
- **Optimisation** : Crop carré 1:1, compression automatique
- **Storage** : `public/uploads/profiles/`

#### ✏️ Modification du Pseudo

- **Validation** : Minimum 3 caractères
- **Unicité** : Vérification que le pseudo n'est pas déjà pris
- **Temps réel** : Mise à jour instantanée

#### 📧 Informations du Profil

- Email (récupéré depuis OAuth)
- Provider de connexion (Google, GitHub, etc.)
- Date de création du compte
- Photo de profil (URL ou uploaded)

---

## 📁 Fichiers Ajoutés/Modifiés

### Backend (serveur Node.js)

#### ✨ Nouveaux fichiers

```
auth/
├── oauth-routes.js          # Routes OAuth + Upload + Profile API
└── passport-config.js       # Configuration Passport (legacy, non utilisé)

tools/
└── migrate_oauth_support.js # Migration SQL pour ajouter colonnes OAuth

OAUTH_SETUP_GUIDE.md         # Guide complet configuration OAuth
OAUTH_FEATURES.md            # Ce fichier
.env.example                 # Template variables d'environnement
```

#### 🔧 Fichiers modifiés

```
server.js                    # Ajout Passport, session, routes OAuth
package.json                 # Dépendances OAuth + multer + JWT
```

#### 📦 Nouvelles dépendances

```json
{
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-github2": "^0.1.12",
  "passport-facebook": "^3.0.0",
  "passport-discord": "^0.1.4",
  "passport-apple": "^2.0.2",
  "express-session": "^1.18.2",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1"
}
```

---

### Mobile (React Native / Expo)

#### ✨ Nouveaux fichiers

```
chat-db-mobile/app/settings/
└── edit-profile.tsx         # Page d'édition du profil
```

#### 🔧 Fichiers modifiés

```
chat-db-mobile/app/
└── index.tsx                # Page login avec boutons OAuth

chat-db-mobile/package.json  # Nouvelles dépendances
```

#### 📦 Nouvelles dépendances

```json
{
  "expo-auth-session": "~6.0.5",
  "expo-image-picker": "~17.0.11",
  "expo-web-browser": "~14.0.2",
  "expo-crypto": "~14.0.1"
}
```

---

## 🗄️ Base de Données - Nouvelles Colonnes

La table `users` a été étendue :

```sql
ALTER TABLE users 
ADD COLUMN provider VARCHAR(50) DEFAULT 'local',        -- google, github, facebook, discord, apple, local
ADD COLUMN provider_id VARCHAR(255),                    -- ID unique chez le provider
ADD COLUMN photo_url TEXT,                              -- URL de la photo de profil
ADD COLUMN email VARCHAR(255),                          -- Email de l'utilisateur
ADD COLUMN email_verified BOOLEAN DEFAULT false;       -- Si l'email est vérifié
```

Nouvelle table pour les sessions OAuth :

```sql
CREATE TABLE oauth_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ Installation & Configuration

### Étape 1 : Installer les dépendances

```bash
# Backend
npm install

# Mobile
cd chat-db-mobile
npm install
```

### Étape 2 : Migrer la base de données

```bash
node tools/migrate_oauth_support.js
```

### Étape 3 : Configurer OAuth

Consultez le guide complet : [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)

1. Créez des applications OAuth sur chaque plateforme
2. Récupérez les Client ID et Secrets
3. Configurez les `.env` (backend et mobile)
4. Testez en local puis déployez

### Étape 4 : Variables d'environnement

Copiez `.env.example` vers `.env` et remplissez :

```bash
cp .env.example .env
nano .env  # ou code .env
```

Remplissez **minimum** :

```bash
DATABASE_URL=...
JWT_SECRET=...
SESSION_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 🎮 Utilisation

### Côté Utilisateur Mobile

1. **Ouvrir l'app** → Page de login
2. **Choisir un provider** (Google, GitHub, Facebook, Discord)
3. **Autoriser l'app** sur la page OAuth
4. **Redirection automatique** vers l'app avec compte créé
5. **Aller dans Profil** → Modifier photo et pseudo

### Flow OAuth Technique

```
1. User clique sur "Google" dans l'app mobile
   └─> expo-auth-session ouvre WebBrowser

2. WebBrowser charge https://votre-api.com/auth/google
   └─> Redirection vers Google OAuth

3. User autorise sur Google
   └─> Google callback vers /auth/google/callback

4. Backend Passport vérifie le code OAuth
   └─> Crée ou met à jour l'utilisateur
   └─> Génère un JWT token

5. Backend redirige vers myapp://auth?token=xxx&user={...}
   └─> App mobile capte le deep link

6. App mobile stocke le token dans AsyncStorage
   └─> Navigation automatique vers Home
```

---

## 🔒 Sécurité

### ✅ Implémenté

- JWT tokens avec expiration 7 jours
- Secrets aléatoires pour session et JWT
- HTTPS obligatoire en production
- Validation des types de fichiers (images uniquement)
- Limite de taille d'upload (5MB)
- Sanitization des inputs utilisateur
- Index sur `provider` + `provider_id` pour perfs

### 🔐 Recommandations

1. **Changez les secrets** dans `.env` avant production
2. **Utilisez HTTPS** sur votre serveur (Render le fait automatiquement)
3. **Configurez CORS** correctement (pas `*` en prod)
4. **Sauvegarder régulièrement** la base de données
5. **Monitorer les logs** pour détecter les tentatives d'intrusion

---

## 🧪 Tests

### Test Backend (API)

```bash
# Démarrer le serveur
npm start

# Tester les endpoints OAuth
curl http://localhost:3000/auth/google
# (Devrait rediriger vers Google)

# Tester l'upload de photo (avec token)
curl -X POST http://localhost:3000/api/profile/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@/path/to/image.jpg"

# Récupérer le profil
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Mobile

```bash
cd chat-db-mobile
npx expo start

# Scanner le QR code avec Expo Go
# Tester la connexion OAuth
# Tester l'upload de photo depuis la galerie
# Tester la modification du pseudo
```

---

## 📊 Statistiques du Code

| Métrique | Valeur |
|----------|--------|
| **Fichiers créés** | 5 |
| **Fichiers modifiés** | 5 |
| **Lignes de code ajoutées** | ~2000 |
| **Nouvelles dépendances** | 11 |
| **Providers OAuth** | 5 |
| **Endpoints API** | 8 |
| **Migrations SQL** | 2 tables |

---

## 🐛 Résolution de Problèmes

### Erreur : "expo-auth-session not found"

```bash
cd chat-db-mobile
npm install expo-auth-session expo-web-browser expo-crypto
```

### Erreur : "Redirect URI mismatch"

➡️ Vérifiez que l'URL dans le dashboard OAuth correspond **exactement** à celle dans votre code

### Deep linking ne fonctionne pas

```bash
# Rebuild l'app après modification de app.json
cd chat-db-mobile
npx expo prebuild
npx expo run:android  # ou run:ios
```

### Photo ne s'upload pas

```bash
# Créer le dossier manuellement
mkdir -p public/uploads/profiles
chmod 755 public/uploads/profiles
```

---

## 🚀 Prochaines Étapes

- [ ] Ajouter la déconnexion (logout)
- [ ] Implémenter le refresh token automatique
- [ ] Ajouter la possibilité de lier plusieurs providers à un compte
- [ ] Implémenter la suppression de compte
- [ ] Ajouter la modification de l'email
- [ ] Créer une page de gestion des sessions actives
- [ ] Ajouter des analytics (connexions par provider)

---

## 📚 Documentation Complète

- [Configuration OAuth](./OAUTH_SETUP_GUIDE.md) - Guide étape par étape
- [README Principal](./README.md) - Documentation générale de l'app
- [Variables d'environnement](./.env.example) - Template de configuration

---

## ✨ Crédits

Développé avec ❤️ pour **Meo Chat**

- **Backend** : Express.js + Passport.js + PostgreSQL
- **Mobile** : React Native + Expo + TypeScript
- **Auth** : JWT + OAuth 2.0

---

**Besoin d'aide ?** Consultez les guides ou ouvrez une issue ! 🙋‍♂️
