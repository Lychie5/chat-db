## 🔴 SOLUTION RAPIDE : Request Timed Out

### L'erreur que vous avez :
```
There was a problem running the requested app.
Unknown error: The request timed out
```

**Cause :** Votre iPhone n'arrive pas à se connecter au serveur Metro sur votre PC.

---

## ✅ SOLUTION LA PLUS SIMPLE (à essayer EN PREMIER)

### Entrer l'URL manuellement dans Expo Go

**NE SCANNEZ PAS le QR code**, faites ceci à la place :

1. **Sur votre iPhone, ouvrez l'app Expo Go**

2. **En bas de l'écran, tapez sur "Enter URL manually"**

3. **Entrez cette URL EXACTEMENT :**
   ```
   exp://192.168.178.87:8081
   ```

4. **Tapez "Connect"**

5. **Attendez 30 secondes - 1 minute** ⏳

✅ L'app devrait se charger !

---

## 🔍 Si ça ne marche toujours pas

### Vérification 1 : Même réseau WiFi

**Sur votre PC :**
- Paramètres → Réseau et Internet → WiFi
- Notez le nom du réseau (ex: "Freebox-12345")

**Sur votre iPhone :**
- Réglages → WiFi
- Vérifiez que vous êtes sur le **MÊME réseau**

### Vérification 2 : Firewall Windows

Le firewall Windows peut bloquer la connexion.

**Test rapide :**
1. Cherchez "Pare-feu Windows" dans le menu Démarrer
2. Cliquez sur "Paramètres avancés"
3. Règles de trafic entrant → Cherchez "Node.js"
4. Si vous ne voyez rien, le firewall bloque !

**Solution temporaire (pour tester) :**
1. Paramètres → Mise à jour et sécurité → Sécurité Windows
2. Pare-feu et protection réseau
3. Réseau privé → Désactiver le pare-feu (TEMPORAIREMENT)
4. Essayez de vous connecter
5. **Réactivez le pare-feu après !**

### Vérification 3 : Adresse IP correcte

Dans le terminal, vous voyez :
```
› Metro waiting on exp://192.168.178.87:8081
```

Vérifiez que `192.168.178.87` est bien l'IP de votre PC :

```powershell
ipconfig
```

Cherchez "Carte réseau sans fil Wi-Fi" → "Adresse IPv4"

Si c'est différent, utilisez la VRAIE adresse IPv4 dans Expo Go.

---

## 🌐 Alternative : Mode Tunnel (plus lent mais fonctionne sans WiFi)

Si vraiment rien ne marche, utilisez le mode tunnel :

1. **Arrêtez Expo** (Ctrl+C dans le terminal)

2. **Installez ngrok :**
   ```powershell
   npm install -g @expo/ngrok
   ```

3. **Relancez avec tunnel :**
   ```powershell
   cd chat-db-mobile
   npx expo start --tunnel
   ```

4. **Attendez 1-2 minutes** (génération du tunnel)

5. **Scannez le nouveau QR code**

Le tunnel utilise Internet au lieu du WiFi local, donc ça contourne le problème de réseau.

---

## 📱 Test rapide : Mode Web

Pour vérifier que tout fonctionne côté serveur :

1. Dans le terminal Expo, appuyez sur **`w`**
2. Votre navigateur s'ouvre
3. Si l'app s'affiche = Le serveur fonctionne ✅
4. Donc le problème est bien la connexion PC ↔ iPhone

---

## 🎯 Récapitulatif

**À essayer dans cet ordre :**

1. ✅ **Entrer l'URL manuellement** dans Expo Go (`exp://192.168.178.87:8081`)
2. Vérifier le **même WiFi** sur PC et iPhone
3. **Désactiver temporairement le firewall** Windows (pour tester)
4. Utiliser le **mode tunnel** si vraiment bloqué

**90% du temps, la solution 1 suffit !** 🎉

---

## 🆘 Si RIEN ne marche

Il y a un dernier recours :

**Développer en mode Web d'abord :**
```powershell
cd chat-db-mobile
npx expo start --web
```

Votre app s'ouvrira dans le navigateur. Vous pouvez développer comme ça, puis tester sur iPhone plus tard quand le réseau sera configuré.
