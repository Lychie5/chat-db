# 🔔 Notifications Push - Guide d'utilisation

## ✅ Ce qui a été configuré

### 1. **Notifications locales** (actuellement activées)
- ✅ Notification quand tu reçois un message (app en arrière-plan)
- ✅ Clic sur la notification ouvre directement le chat
- ✅ Fonctionne sur Android et iOS
- ✅ Aucun serveur externe requis

### 2. **Comment ça marche**

**Quand tu reçois un message :**
- Si l'app est **ouverte** → Pas de notification (tu vois déjà le message)
- Si l'app est en **arrière-plan** → 🔔 Notification pop-up
- Si l'app est **fermée** → Pas de notification (limitations Expo Go)

**Comportement :**
```
Message reçu → Vérification (pas toi ?) → Notification "💬 Nom: message"
```

## 📱 Test des notifications

### Test 1 : En arrière-plan
1. Ouvre l'app Expo Go avec ton compte (ex: Meo)
2. Va sur un chat
3. **Minimise l'app** (retour à l'écran d'accueil)
4. Demande à un ami d'envoyer un message depuis le site web
5. **Tu devrais recevoir une notification** 🔔

### Test 2 : Clic sur notification
1. Reçois une notification
2. Clique dessus
3. L'app s'ouvre directement sur le chat

## 🚀 Pour aller plus loin : Push Notifications

Les notifications actuelles ne fonctionnent que si l'app est en arrière-plan. Pour recevoir des notifications **même quand l'app est fermée**, il faut :

### Prérequis :
- ✅ Build APK/IPA (pas Expo Go)
- ✅ Compte Expo (gratuit)
- ✅ Configuration backend

### Étapes :

1. **Récupérer le Push Token**
```typescript
import * as Notifications from 'expo-notifications';

const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'votre-project-id'
});
```

2. **Envoyer le token au backend**
```javascript
// Backend doit stocker : user_id <-> push_token
await api.post('/api/register-push-token', { 
  pseudo: 'Meo', 
  token: token.data 
});
```

3. **Backend envoie les notifications**
```javascript
// Quand un message est envoyé
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: recipientPushToken,
    title: `💬 ${senderName}`,
    body: messageText,
    data: { conversationId }
  })
});
```

## 🎯 État actuel

✅ **Activé :**
- Notifications locales en arrière-plan
- Sons et vibrations
- Navigation automatique au clic

❌ **Non activé (nécessite plus de travail) :**
- Push notifications avec app fermée
- Notifications sur site web (nécessite Service Worker)
- Badge de compteur de messages non lus

## 📝 Prochaines étapes suggérées

Si tu veux des notifications complètes :

1. **Ajouter la gestion des push tokens dans le backend**
   - Nouvelle table `push_tokens(user_id, token, platform)`
   - Route POST `/api/register-push-token`
   
2. **Envoyer les notifications depuis server.js**
   - Quand un message socket arrive
   - Vérifier si le destinataire est offline
   - Envoyer push notification

3. **Builder l'APK**
   - `eas build --platform android`
   - Installer sur ton téléphone
   - Les push fonctionneront même app fermée

Veux-tu que je t'aide à mettre ça en place ? 🚀
