# 📱 Guide de Build - App Native

## Option 1 : Build APK Android (Gratuit) ⭐

### Étape 1 : Installer EAS CLI
```bash
npm install -g eas-cli
```

### Étape 2 : Login Expo
```bash
eas login
```

### Étape 3 : Configurer le projet
```bash
eas build:configure
```

### Étape 4 : Build APK (Android)
```bash
# Build APK pour installer directement sur ton téléphone
eas build --platform android --profile preview

# OU Build AAB pour Google Play Store
eas build --platform android --profile production
```

### Étape 5 : Télécharger et installer
- Reçois un lien de téléchargement par email
- Télécharge l'APK sur ton téléphone
- Installe l'APK (autorise les sources inconnues dans les paramètres)
- 🎉 Ton app est maintenant installée comme une vraie app !

---

## Option 2 : Build iOS (IPA) - Nécessite compte Apple Developer ($99/an)

```bash
eas build --platform ios --profile preview
```

---

## Option 3 : Expo Development Build (Développement rapide)

### Créer un build de développement personnalisé
```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

### Lancer en mode développement
```bash
npx expo start --dev-client
```

---

## Option 4 : Expo Go avec Deep Link (Sans build)

### Créer un QR code permanent
1. Publier l'app sur Expo :
```bash
eas update --branch production --message "Initial release"
```

2. Ton app sera accessible via une URL permanente
3. Scanner une seule fois dans Expo Go
4. L'app reste dans l'historique d'Expo Go

---

## 🚀 Solution Rapide (2 minutes)

### Pour tester immédiatement :

```bash
cd chat-db-mobile
npx expo start --tunnel
```

- Scan le QR code UNE FOIS
- L'app reste dans l'historique d'Expo Go
- Clique dessus pour la relancer sans rescanner

---

## 📦 Recommandation

Pour une **vraie app native** :
1. `eas build --platform android --profile preview`
2. Télécharge l'APK
3. Installe sur ton téléphone
4. 🎉 App native prête !

**Avantages** :
- ✅ Icône sur l'écran d'accueil
- ✅ Pas besoin d'Expo Go
- ✅ Fonctionne comme une vraie app
- ✅ Peut être partagée avec d'autres
- ✅ Push notifications natives
