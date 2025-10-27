# Configuration de l'application mobile Meo

## 🔴 ÉTAPE OBLIGATOIRE : Configurer l'URL de votre serveur

### 1. Trouvez votre URL Render

Allez sur votre dashboard Render et copiez l'URL de votre service web.
Exemple : `https://chat-app-xyz.onrender.com`

### 2. Modifiez le fichier `config/api.ts`

Ouvrez `chat-db-mobile/config/api.ts` et remplacez :

```typescript
BASE_URL: __DEV__ 
  ? 'http://localhost:8080'
  : 'https://YOUR-APP-NAME.onrender.com', // 🔴 À REMPLACER !
```

Par votre vraie URL Render :

```typescript
BASE_URL: __DEV__ 
  ? 'http://localhost:8080'
  : 'https://chat-app-xyz.onrender.com', // ✅ Votre URL !
```

### 3. Installez les nouvelles dépendances

```bash
cd chat-db-mobile
npm install
```

### 4. Lancez l'application

```bash
npx expo start
```

## 📱 Test de connexion

1. Ouvrez l'app sur votre téléphone iOS
2. Entrez un pseudo
3. Cliquez sur "Se connecter"
4. Si vous voyez une erreur de connexion :
   - Vérifiez que votre URL Render est correcte
   - Vérifiez que votre serveur Render est en ligne
   - Vérifiez votre connexion internet

## 🐛 Problèmes courants

### "Network request failed"
- Votre téléphone doit être connecté à Internet
- L'URL du serveur dans `config/api.ts` doit être correcte
- Le serveur Render doit être en ligne

### Base de données ne fonctionne pas
- Vérifiez les variables d'environnement sur Render
- Vérifiez que PostgreSQL est bien connecté
- Consultez les logs sur Render

## 📝 Prochaines étapes

Actuellement, l'app mobile a seulement :
- ✅ Page de connexion
- ✅ Connexion à l'API

À développer :
- ❌ Liste des conversations
- ❌ Chat en temps réel
- ❌ Liste d'amis
- ❌ Notifications

Référez-vous aux fichiers dans `/public/js/` pour voir comment l'app web fonctionne et recréez ces fonctionnalités en React Native.
