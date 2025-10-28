# Guide Complet : Configuration OAuth pour Meo Chat

Ce guide explique **étape par étape** comment configurer l'authentification OAuth avec Google, GitHub, Facebook, Discord et Apple pour votre application Meo Chat.

---

## 📋 **Table des matières**

1. [Prérequis](#prérequis)
2. [Configuration Google OAuth](#1-google-oauth)
3. [Configuration GitHub OAuth](#2-github-oauth)
4. [Configuration Facebook OAuth](#3-facebook-oauth)
5. [Configuration Discord OAuth](#4-discord-oauth)
6. [Configuration Apple OAuth](#5-apple-oauth)
7. [Configuration de l'environnement](#6-configuration-de-lenvironnement)
8. [Migration de la base de données](#7-migration-de-la-base-de-données)
9. [Configuration du Deep Linking (Mobile)](#8-deep-linking-mobile)
10. [Tests et Déploiement](#9-tests-et-déploiement)

---

## ✅ **Prérequis**

- Node.js 16+ installé
- PostgreSQL configuré
- Accès à votre serveur de production (ex: Render)
- Compte développeur sur chaque plateforme OAuth

---

## 1. 🔵 **Google OAuth**

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Activez l'**API Google+ API**

### Étape 2 : Créer les credentials OAuth

1. Dans le menu, allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **OAuth 2.0 Client ID**
3. Si demandé, configurez l'écran de consentement OAuth :
   - Type : **Externe** (ou Interne si G Suite)
   - Nom de l'application : **Meo Chat**
   - Email d'assistance : votre email
   - Logo (optionnel)
   - Domaine autorisé : `votre-domaine.com`
   - Scopes : `email`, `profile`

### Étape 3 : Configurer le Client ID

1. Type d'application : **Application Web**
2. Nom : **Meo Chat Web**
3. **URIs de redirection autorisés** :
   ```
   http://localhost:3000/auth/google/callback
   https://votre-domaine.onrender.com/auth/google/callback
   ```
4. Cliquez sur **Créer**
5. **Copiez** le `Client ID` et le `Client Secret`

### Étape 4 : Ajouter aux variables d'environnement

```bash
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-secret
```

---

## 2. ⚫ **GitHub OAuth**

### Étape 1 : Créer une OAuth App

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur **New OAuth App**
3. Remplissez le formulaire :
   - **Application name** : Meo Chat
   - **Homepage URL** : `https://votre-domaine.com`
   - **Application description** : Chat application avec React Native
   - **Authorization callback URL** :
     ```
     http://localhost:3000/auth/github/callback
     ```
     *(Ajoutez aussi l'URL de production si nécessaire)*

### Étape 2 : Générer un Client Secret

1. Une fois l'app créée, cliquez sur **Generate a new client secret**
2. **Copiez** le `Client ID` et le `Client Secret`

### Étape 3 : Ajouter aux variables d'environnement

```bash
GITHUB_CLIENT_ID=votre-github-client-id
GITHUB_CLIENT_SECRET=votre-github-secret
```

---

## 3. 🔵 **Facebook OAuth**

### Étape 1 : Créer une App Facebook

1. Allez sur [Facebook for Developers](https://developers.facebook.com/)
2. Cliquez sur **My Apps** → **Create App**
3. Type : **Consumer** (ou Business selon votre cas)
4. Nom de l'app : **Meo Chat**

### Étape 2 : Ajouter Facebook Login

1. Dans le dashboard de votre app, cliquez sur **Add Product**
2. Sélectionnez **Facebook Login** → **Set Up**
3. Type : **Web**
4. Configurez les **Valid OAuth Redirect URIs** :
   ```
   http://localhost:3000/auth/facebook/callback
   https://votre-domaine.onrender.com/auth/facebook/callback
   ```

### Étape 3 : Obtenir les credentials

1. Allez dans **Settings** → **Basic**
2. **Copiez** l'**App ID** et l'**App Secret**

### Étape 4 : Passer en mode Production

1. Dans le dashboard, passez l'app en **Live Mode** (bouton en haut)
2. Remplissez les informations obligatoires (Privacy Policy URL, etc.)

### Étape 5 : Ajouter aux variables d'environnement

```bash
FACEBOOK_APP_ID=votre-app-id
FACEBOOK_APP_SECRET=votre-app-secret
```

---

## 4. 🟣 **Discord OAuth**

### Étape 1 : Créer une Application Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez sur **New Application**
3. Nom : **Meo Chat**

### Étape 2 : Configurer OAuth2

1. Dans le menu de gauche, allez dans **OAuth2**
2. Ajoutez des **Redirects** :
   ```
   http://localhost:3000/auth/discord/callback
   https://votre-domaine.onrender.com/auth/discord/callback
   ```
3. **Copiez** le `Client ID` et le `Client Secret`

### Étape 3 : Ajouter aux variables d'environnement

```bash
DISCORD_CLIENT_ID=votre-discord-client-id
DISCORD_CLIENT_SECRET=votre-discord-secret
```

---

## 5. 🍎 **Apple OAuth** *(Optionnel - Plus complexe)*

⚠️ **Note** : Apple OAuth nécessite un compte Apple Developer payant (99€/an).

### Étape 1 : Créer un App ID

1. Allez sur [Apple Developer](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles** → **Identifiers** → **+**
3. Sélectionnez **App IDs** → **Continue**
4. Type : **App**
5. Description : **Meo Chat**
6. Bundle ID : `com.votrecompagnie.meochat`
7. Cochez **Sign in with Apple**

### Étape 2 : Créer un Service ID

1. **Identifiers** → **+** → **Services IDs**
2. Description : **Meo Chat Web**
3. Identifier : `com.votrecompagnie.meochat.service`
4. Cochez **Sign in with Apple** → **Configure**
5. Domains and Subdomains : `votre-domaine.com`
6. Return URLs : `https://votre-domaine.com/auth/apple/callback`

### Étape 3 : Créer une clé privée

1. **Keys** → **+**
2. Key Name : **Meo Chat Apple Sign In Key**
3. Cochez **Sign in with Apple** → **Configure**
4. Sélectionnez votre App ID
5. **Continue** → **Register**
6. **Téléchargez** le fichier `.p8` (important, vous ne pourrez plus le télécharger !)

### Étape 4 : Ajouter aux variables d'environnement

```bash
APPLE_SERVICE_ID=com.votrecompagnie.meochat.service
APPLE_TEAM_ID=votre-team-id (trouvable sur Apple Developer)
APPLE_KEY_ID=votre-key-id (dans Keys)
APPLE_PRIVATE_KEY_PATH=./auth/AuthKey.p8
```

Placez le fichier `.p8` dans le dossier `auth/` de votre projet.

---

## 6. ⚙️ **Configuration de l'environnement**

Créez ou modifiez votre fichier `.env` à la racine du projet :

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
API_URL=https://votre-app.onrender.com
JWT_SECRET=votre-secret-jwt-tres-long-et-aleatoire
SESSION_SECRET=votre-secret-session-tres-long-et-aleatoire

# OAuth - Google
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# OAuth - GitHub
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# OAuth - Facebook
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx

# OAuth - Discord
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx

# OAuth - Apple (optionnel)
APPLE_SERVICE_ID=com.votrecompagnie.meochat.service
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY_PATH=./auth/AuthKey.p8
```

⚠️ **IMPORTANT** : Ne commitez **JAMAIS** ce fichier dans Git ! Ajoutez-le à `.gitignore` :

```bash
echo ".env" >> .gitignore
```

---

## 7. 💾 **Migration de la base de données**

Exécutez le script de migration pour ajouter les colonnes OAuth :

```bash
node tools/migrate_oauth_support.js
```

Ce script ajoute :
- `provider` (google, github, facebook, discord, apple, local)
- `provider_id` (ID unique chez le provider)
- `email` (email de l'utilisateur OAuth)
- `email_verified` (si l'email est vérifié)
- `photo_url` (URL de la photo de profil)
- Table `oauth_sessions` (pour stocker les tokens de refresh)

---

## 8. 📱 **Deep Linking (Mobile)**

### Étape 1 : Configurer le scheme dans app.json

Modifiez `chat-db-mobile/app.json` :

```json
{
  "expo": {
    "scheme": "myapp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "myapp",
              "host": "auth"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:votre-domaine.com"]
    }
  }
}
```

### Étape 2 : Tester le deep linking

En développement, testez avec :

```bash
# Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://auth?token=test"

# iOS (avec Simulator ouvert)
xcrun simctl openurl booted "myapp://auth?token=test"
```

---

## 9. 🧪 **Tests et Déploiement**

### Tests en local

1. **Démarrez le serveur** :
   ```bash
   npm start
   ```

2. **Testez chaque provider** :
   - Ouvrez `http://localhost:3000/auth/google`
   - Vérifiez la redirection et le callback

3. **Testez l'app mobile** :
   ```bash
   cd chat-db-mobile
   npx expo start
   ```

### Déploiement sur Render

1. Ajoutez toutes les variables d'environnement dans **Render Dashboard** → **Environment**

2. Redéployez :
   ```bash
   git add .
   git commit -m "Add OAuth authentication"
   git push
   ```

3. Mettez à jour les URLs de callback sur chaque plateforme OAuth avec votre URL Render

### Tests de production

1. **Testez chaque provider OAuth** depuis l'app mobile
2. Vérifiez que les profils sont bien créés dans la base de données
3. Testez l'upload de photo de profil
4. Testez la modification du pseudo

---

## 🔒 **Sécurité**

### Bonnes pratiques

1. ✅ Utilisez HTTPS en production
2. ✅ Générez des secrets longs et aléatoires (32+ caractères)
3. ✅ Ne commitez jamais les secrets dans Git
4. ✅ Validez les JWT tokens côté serveur
5. ✅ Limitez la taille des fichiers uploadés (5MB max)
6. ✅ Filtrez les types de fichiers autorisés (images uniquement)
7. ✅ Sanitizez les inputs utilisateur

### Générer des secrets sécurisés

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 **Résolution de problèmes**

### Erreur : "Redirect URI mismatch"

➡️ Vérifiez que l'URL de callback dans votre code correspond **exactement** à celle configurée sur la plateforme OAuth (avec/sans trailing slash, http vs https)

### Erreur : "Token invalide"

➡️ Vérifiez que `JWT_SECRET` est identique entre le serveur et l'app mobile

### Deep linking ne fonctionne pas

➡️ Assurez-vous que le scheme `myapp://` est configuré dans `app.json` et que l'app a été rebuild

### Photo de profil ne s'upload pas

➡️ Vérifiez les permissions de l'app mobile (Camera & Photos) et que le dossier `public/uploads/profiles` existe

---

## 🎉 **Félicitations !**

Votre application Meo Chat dispose maintenant d'une authentification OAuth complète avec 5 providers ! 🚀

### Prochaines étapes

- [ ] Ajouter la déconnexion OAuth
- [ ] Implémenter le refresh token
- [ ] Ajouter la synchronisation des contacts
- [ ] Améliorer l'UI des boutons OAuth

---

**Besoin d'aide ?** Consultez la documentation officielle :
- [Passport.js](http://www.passportjs.org/)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [JWT](https://jwt.io/)
