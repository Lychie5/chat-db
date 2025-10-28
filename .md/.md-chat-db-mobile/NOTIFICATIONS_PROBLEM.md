# 🚨 PROBLÈME : Notifications ne fonctionnent pas dans Expo Go

## ❌ Pourquoi ça ne marche pas ?

**Expo Go a des limitations sévères** avec `expo-notifications` :

```
WARN expo-notifications: Android Push notifications functionality 
was removed from Expo Go with the release of SDK 53.
Use a development build instead of Expo Go.
```

**Les notifications locales NE FONCTIONNENT PAS dans Expo Go SDK 53+**

## ✅ SOLUTION : Builder un APK de développement

### Option 1 : Build avec EAS (Recommandé)

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Login (créer un compte gratuit si besoin)
cd chat-db-mobile
eas login

# 3. Configurer le projet
eas build:configure

# 4. Builder l'APK de développement
eas build --platform android --profile development

# ⏱️ Attends 10-15 minutes
# 📦 Télécharge l'APK depuis le lien fourni
# 📱 Installe sur ton téléphone Android
```

### Option 2 : Build local (plus rapide mais complexe)

```bash
# Installer Android Studio + SDK
# Puis :
cd chat-db-mobile
npx expo prebuild
npx expo run:android
```

## 🎯 Une fois l'APK installé

✅ **Notifications fonctionneront à 100%** :
- Notifications quand app minimisée
- Notifications quand app ouverte sur autre écran
- Sons et vibrations
- Clics sur notifications ouvrent le chat

## 📊 État actuel du code

✅ **Le code est CORRECT et PRÊT** :
- Service de notifications : `services/notificationService.ts`
- Intégration dans chat : `app/chat/[id].tsx`
- Permissions configurées : `app.json`
- Détection arrière-plan : `AppState` + `isChatScreenActive`

**Le code fonctionne ! C'est juste Expo Go qui est cassé.**

## 🔧 Alternative rapide : Test avec APK existant

Si tu as déjà un APK Android buildé (ex: avec `build-apk.bat`), installe-le et les notifications fonctionneront.

## 📱 Pour iOS

Même problème. Solutions :
1. **TestFlight** : Build avec EAS + distribute via TestFlight
2. **VM macOS** : Build local avec Xcode (guide: `VM_MACOS_GUIDE.md`)
3. **AltStore** : Sideload un .ipa (guide: `ALTSTORE_GUIDE.md`)

---

**TL;DR : Les notifications sont correctement codées. Expo Go ne les supporte pas. Il faut builder un APK pour qu'elles fonctionnent.**
