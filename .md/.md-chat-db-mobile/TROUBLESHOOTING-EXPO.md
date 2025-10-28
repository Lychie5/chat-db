# 🐛 Résolution du problème : Expo ne charge pas sur iPhone

## ✅ Problème résolu : Expo démarrait depuis le mauvais dossier

### Ce qui était cassé :
```
❌ Expo installé dans chat-app/package.json
❌ Expo démarrait depuis C:\Users\mehau\...\chat-app (MAUVAIS)
✅ Doit démarrer depuis C:\Users\mehau\...\chat-app\chat-db-mobile (BON)
```

### Correction appliquée :
1. ✅ Supprimé Expo du package.json parent
2. ✅ Nettoyé les dépendances
3. ✅ Relancé Expo depuis le bon dossier

---

## 📱 Maintenant, pour charger l'app sur votre iPhone :

### Étape 1 : Vérifier qu'Expo tourne correctement

Dans le terminal, vous devez voir :
```
✅ Starting project at C:\Users\mehau\...\chat-db-mobile
✅ Metro waiting on exp://192.168.178.87:8081
✅ QR Code affiché
```

### Étape 2 : Scanner le QR Code

**Option A : Avec l'app Appareil photo (iPhone)**
1. Ouvrez l'app Appareil photo native
2. Pointez vers le QR code
3. Une notification apparaît en haut
4. Tapez dessus → Ouvre Expo Go

**Option B : Avec Expo Go directement**
1. Ouvrez l'app Expo Go
2. Tapez sur "Scan QR Code"
3. Scannez le QR code du terminal

### Étape 3 : Attendre le chargement

**Premier lancement = 1-2 minutes** ⏳
- Metro Bundler compile le code JavaScript
- L'app se télécharge sur votre téléphone
- Soyez patient !

---

## 🔴 Si l'app ne charge toujours pas :

### Erreur : "Unable to connect to Metro"

**Cause :** Votre PC et iPhone ne sont pas sur le même réseau WiFi

**Solution :**
1. Vérifiez que les deux sont sur le **même WiFi**
2. Dans le terminal Expo, appuyez sur `m` → "Dev tools"
3. Notez l'URL affichée (ex: `exp://192.168.178.87:8081`)
4. Dans Expo Go, tapez manuellement cette URL

### Erreur : "Network request failed"

**Cause :** Problème de firewall Windows

**Solution :**
1. Ouvrez "Pare-feu Windows Defender"
2. Cliquez sur "Autoriser une app via le pare-feu"
3. Cherchez "Node.js" et cochez les deux cases (privé + public)
4. Redémarrez Expo

### Erreur : L'app se charge mais affiche une erreur rouge

**Scénarios possibles :**

#### 1. "Cannot find module '@react-native-async-storage/async-storage'"
```bash
cd chat-db-mobile
npm install @react-native-async-storage/async-storage@1.23.1
```

#### 2. "Unable to resolve module 'expo-router'"
```bash
cd chat-db-mobile
npm install expo-router@~3.5.0
```

#### 3. Erreur de typage TypeScript
Dans le terminal Metro, appuyez sur `r` pour recharger

### Erreur : L'app reste bloquée sur le splash screen blanc

**Solution :**
1. Dans le terminal, appuyez sur `r` pour recharger
2. Fermez complètement Expo Go sur iPhone (glisser vers le haut)
3. Rescannez le QR code

---

## 🧪 Tester que l'app fonctionne

Une fois l'app chargée, vous devriez voir :

```
┌─────────────────────────────────┐
│                                 │
│   Bienvenue sur Meo! 🎉        │
│   Application de chat           │
│                                 │
│   ┌─────────────────────────┐  │
│   │ Entrez votre pseudo     │  │
│   └─────────────────────────┘  │
│                                 │
│   [  Se connecter  ]           │
│                                 │
│   ⚠️ Configurez d'abord l'URL  │
│                                 │
└─────────────────────────────────┘
```

Si vous voyez cet écran = **✅ SUCCESS !**

---

## 🚀 Commandes utiles Expo

Dans le terminal où Expo tourne :

| Touche | Action |
|--------|--------|
| `r` | Recharger l'app |
| `m` | Ouvrir le menu de dev |
| `j` | Ouvrir le debugger |
| `w` | Ouvrir dans navigateur web |
| `Ctrl+C` | Arrêter Expo |

---

## 📋 Checklist de dépannage

- [ ] Expo démarre depuis `chat-db-mobile/` (pas le dossier parent)
- [ ] QR Code s'affiche dans le terminal
- [ ] iPhone et PC sur le même WiFi
- [ ] Expo Go installé sur iPhone
- [ ] Firewall Windows autorise Node.js
- [ ] Les dépendances sont installées (`npm install`)
- [ ] Attendre 1-2 minutes au premier lancement

---

## 💡 Astuces

### Pour un chargement plus rapide :
```bash
npx expo start --tunnel
```
Utilise un tunnel (pas besoin d'être sur le même WiFi) mais plus lent

### Pour voir les logs en direct :
Les erreurs de votre app s'afficheront dans le terminal où Expo tourne

### Pour reset complètement :
```bash
cd chat-db-mobile
npx expo start --clear
```

---

## 🎯 État actuel

✅ Expo installé dans le bon dossier
✅ Metro Bundler démarre correctement  
✅ QR Code généré
⏳ En attente : Scan du QR code sur iPhone

**Prochaine étape :** Scannez le QR code et attendez 1-2 minutes ! 🚀
