# 🍎 Build .IPA pour AltStore

## Méthode 1 : Build local avec Expo (Sans EAS, sans Apple Developer)

### Prérequis
- ✅ AltStore installé sur ton iPhone
- ✅ Node.js installé
- ✅ Xcode (si tu as un Mac) OU EAS Build (si pas de Mac)

---

## 🚀 Option A : Build avec EAS (Sans Mac, sans compte payant)

### Étape 1 : Créer un certificat Ad-Hoc

```bash
# Configure le projet pour build Ad-Hoc
cd chat-db-mobile
```

### Étape 2 : Modifier eas.json pour Ad-Hoc

Créer un profil "adhoc" dans eas.json :
```json
{
  "build": {
    "adhoc": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildType": "adhoc"
      }
    }
  }
}
```

### Étape 3 : Build sans Apple Developer Account

```bash
# Build avec certificat auto-signé
eas build --platform ios --profile adhoc --local
```

**Problème** : Même avec EAS, il faut un Apple Developer account pour signer l'IPA.

---

## 🎯 Option B : Expo Export + Signer manuellement (MEILLEURE SOLUTION)

### Étape 1 : Exporter le projet

```bash
cd chat-db-mobile
npx expo export
```

### Étape 2 : Utiliser expo-cli pour créer l'IPA

```bash
# Créer un build standalone
npx expo build:ios
```

**Problème** : Expo build:ios est déprécié et nécessite aussi Apple Developer.

---

## ✅ Option C : Utiliser EAS avec ton Apple ID gratuit (SOLUTION OPTIMALE)

Même sans compte Developer payant, tu peux créer un IPA avec ton Apple ID gratuit pour AltStore !

### Étape 1 : Modifier eas.json

```json
{
  "build": {
    "altstore": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildType": "development-client"
      },
      "developmentClient": true
    }
  }
}
```

### Étape 2 : Build avec Apple ID gratuit

```bash
eas build --platform ios --profile altstore
```

Quand demandé :
- Apple ID : ton email
- Mot de passe : ton mot de passe Apple
- Team : Sélectionne "Personal Team" (gratuit)

### Étape 3 : Télécharger l'IPA

Une fois le build terminé, télécharge l'IPA depuis :
https://expo.dev/accounts/mehau/projects/chat-app/builds

### Étape 4 : Installer avec AltStore

1. Envoie le fichier .ipa sur ton iPhone (AirDrop, iCloud, email)
2. Ouvre AltStore sur iPhone
3. Onglet "My Apps" → "+"
4. Sélectionne le fichier .ipa
5. ✅ L'app s'installe !

---

## 🔧 Script automatisé
