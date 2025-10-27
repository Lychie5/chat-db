# 🍎 Guide iOS - Installer ton app sur iPhone

## 📋 Pré-requis

✅ **Compte Apple ID** (gratuit) - https://appleid.apple.com  
✅ **iPhone** avec iOS 13+  
❌ **Pas besoin de Mac**  
❌ **Pas besoin de $99/an** pour tester  

---

## 🚀 Méthode 1 : Expo Go (Le plus rapide - 30 secondes)

### Étapes :
1. **Installe Expo Go** sur l'App Store
2. **Lance le serveur** :
   ```bash
   npx expo start --tunnel
   ```
3. **Scan le QR code** dans Expo Go
4. ✅ Ton app se lance !

### Bonus : Garder l'app accessible
- L'app reste dans l'historique d'Expo Go
- Clique dessus pour relancer sans rescanner
- **Limitation** : Besoin d'Expo Go installé

---

## 🎯 Méthode 2 : TestFlight (Vraie app native) ⭐ RECOMMANDÉ

### Avantages :
- ✅ Vraie app native iOS
- ✅ Icône sur l'écran d'accueil
- ✅ Pas besoin d'Expo Go
- ✅ Peut être partagée avec d'autres (jusqu'à 10,000 testeurs)
- ✅ **GRATUIT**

### Étapes :

#### 1. Installer EAS CLI
```bash
npm install -g eas-cli
```

#### 2. Login Expo
```bash
eas login
```
Créer un compte gratuit sur https://expo.dev si besoin

#### 3. Configurer le projet
```bash
eas build:configure
```

#### 4. Build iOS
```bash
eas build --platform ios --profile preview
```

**Ce qui va se passer** :
- EAS te demande ton Apple ID
- EAS crée automatiquement les certificats (pas besoin de Mac !)
- Build dans le cloud (~10-15 minutes)
- Tu reçois un email avec le lien

#### 5. Installer sur iPhone

**Option A : Via TestFlight (recommandé)**
1. Installe **TestFlight** depuis l'App Store
2. Clique sur le lien reçu par email
3. Accepte l'invitation
4. Télécharge et installe l'app
5. 🎉 Ton app est installée !

**Option B : Installation directe (Ad-Hoc)**
1. Ajoute l'UUID de ton iPhone dans le portail Apple Developer
2. Rebuild avec le profil ad-hoc
3. Installe via le lien direct

---

## 🔧 Méthode 3 : Development Build (Pour développement)

```bash
eas build --platform ios --profile development
```

**Avantages** :
- Hot reload en temps réel
- Meilleur pour le développement
- Fonctionne avec `npx expo start --dev-client`

---

## 📱 Méthode 4 : PWA (Progressive Web App)

### Super simple, aucun build !

1. Ouvre Safari sur iPhone
2. Va sur **https://meo-mv5n.onrender.com**
3. Appuie sur **Partager** (icône carré avec flèche)
4. **"Sur l'écran d'accueil"**
5. ✅ L'app s'installe comme une app native !

**Avantages** :
- ✅ Instantané (0 minute)
- ✅ Pas de build nécessaire
- ✅ Fonctionne offline (avec service worker)
- ✅ Mises à jour automatiques
- ✅ Icône sur l'écran d'accueil
- ❌ Pas d'accès aux fonctions natives (caméra, notifications push)

---

## 🎬 Résumé

| Méthode | Temps | Native | Gratuit | Recommandé |
|---------|-------|--------|---------|------------|
| **Expo Go** | 30s | ❌ | ✅ | Tests rapides |
| **TestFlight** | 15 min | ✅ | ✅ | ⭐ Production |
| **PWA** | 10s | ⚠️ | ✅ | Alternative rapide |
| **Dev Build** | 15 min | ✅ | ✅ | Développement |

---

## 🚀 Commandes rapides

```bash
# Build iOS avec TestFlight
eas build --platform ios --profile preview

# OU double-cliquer sur :
build-ios.bat

# OU pour tester rapidement :
npx expo start --tunnel
# Puis scanner avec Expo Go
```

---

## 🆘 Problèmes courants

### "Pas de certificat iOS"
- EAS les crée automatiquement
- Fournis juste ton Apple ID quand demandé

### "Pas de Mac"
- Pas besoin ! EAS build dans le cloud

### "$99/an requis ?"
- Non pour TestFlight (gratuit)
- Oui seulement pour publier sur l'App Store

### "Build trop long"
- Première fois : 15-20 min
- Builds suivants : 5-10 min
- Alternative : Utilise Expo Go pour tester rapidement

---

## 💡 Ma recommandation

**Pour tester rapidement** :
→ Expo Go (30 secondes)

**Pour une vraie app** :
→ TestFlight (15 minutes, une seule fois)

**Pour le web** :
→ PWA (10 secondes, Safari → "Sur l'écran d'accueil")

---

## 📞 Besoin d'aide ?

1. Documentation EAS : https://docs.expo.dev/build/introduction/
2. TestFlight : https://developer.apple.com/testflight/
3. Expo Discord : https://chat.expo.dev
