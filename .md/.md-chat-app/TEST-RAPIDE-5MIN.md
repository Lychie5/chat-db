# ⚡ Test Rapide - 5 Minutes

## 🎯 Objectif
Vérifier que toutes les nouvelles fonctionnalités marchent en moins de 5 minutes !

---

## 🚀 Démarrage

### 1. Lancer le serveur (Terminal 1)
```bash
node server.js
```
✅ Attendre : "🚀 Serveur lancé sur le port 3000"

### 2. Lancer l'app mobile (Terminal 2)
```bash
cd chat-db-mobile
npm start
```
✅ Scanner le QR code avec Expo Go

---

## ✅ Test 1 : Login (30 secondes)
```
1. Entrer un pseudo : "Alice"
2. Cliquer sur "Se connecter"
3. ✅ Vérifier : Écran Home s'affiche
```

---

## ✅ Test 2 : Notifications persistantes (1 minute)

### Étape A : Modifier les paramètres
```
1. Onglet "Profil"
2. Cliquer sur "Notifications"
3. Désactiver "Son des messages"
4. Désactiver "Vibration"
5. Fermer l'app complètement (swipe)
```

### Étape B : Vérifier la sauvegarde
```
6. Rouvrir l'app
7. Profil > Notifications
8. ✅ Vérifier : Les toggles sont toujours désactivés
```

**Résultat attendu** : Les préférences sont sauvegardées ✅

---

## ✅ Test 3 : Utilisateurs bloqués (1 minute)

### Étape A : Bloquer un utilisateur
```
1. Profil > Confidentialité
2. Cliquer sur "Utilisateurs bloqués"
3. Entrer "Bob" dans la recherche
4. Cliquer sur le bouton rouge (bloquer)
5. ✅ Voir : "Bob a été bloqué"
```

### Étape B : Vérifier la liste
```
6. ✅ Voir : Bob dans la liste
7. ✅ Voir : Date de blocage
8. Cliquer sur le ✅ vert pour débloquer
9. ✅ Voir : "Bob a été débloqué"
```

**Résultat attendu** : Blocage/déblocage fonctionnel ✅

---

## ✅ Test 4 : Indicateur de frappe (2 minutes)

### Prérequis : 2 appareils ou 2 comptes

### Sur appareil 1 (Alice)
```
1. Ajouter "Bob" comme ami
2. Accepter la demande (si nécessaire)
3. Démarrer une conversation avec Bob
```

### Sur appareil 2 (Bob)
```
4. Se connecter avec "Bob"
5. Accepter la demande d'Alice
6. Ouvrir la conversation avec Alice
```

### Test l'indicateur
```
7. Sur appareil 1 : Commencer à taper un message (NE PAS envoyer)
8. Sur appareil 2 : ✅ Voir : "Alice est en train d'écrire..."
9. Sur appareil 1 : Arrêter de taper
10. Sur appareil 2 : ✅ Voir : Le message disparaît après 3s
```

**Résultat attendu** : Indicateur en temps réel ✅

---

## ✅ Test 5 : Export de données (30 secondes)

```
1. Profil > Confidentialité
2. Cliquer sur "Télécharger mes données"
3. Cliquer sur "Exporter mes données"
4. Confirmer
5. ✅ Voir : "Vos données ont été exportées"
```

**Résultat attendu** : Export réussit ✅

---

## ✅ Test 6 : Page Mes données (30 secondes)

```
1. Profil > Confidentialité
2. Scroll jusqu'à "Mes données"
3. Cliquer sur "Télécharger mes données"
4. ✅ Voir : Page complète avec 2 sections :
   - Export des données (bleu)
   - Zone de danger (rouge)
5. Retour
```

**Résultat attendu** : Page complète et design cohérent ✅

---

## 📊 Résultat final

### Si tous les tests passent ✅
```
🎉 FÉLICITATIONS ! 🎉
Toutes les nouvelles fonctionnalités marchent !
L'app est production-ready ! 🚀
```

### Checklist rapide
- [ ] Login fonctionne
- [ ] Notifications se sauvegardent
- [ ] Blocage d'utilisateurs marche
- [ ] Indicateur de frappe s'affiche
- [ ] Export de données fonctionne
- [ ] Page Mes données est complète

### Score
```
6/6 ✅ = Application parfaite ! 🌟
5/6 ✅ = Très bien, 1 bug mineur
4/6 ✅ = Bien, quelques ajustements
3/6 ⚠️ = Moyen, problèmes à régler
< 3 ❌ = Problèmes sérieux, debug nécessaire
```

---

## 🐛 Si un test échoue

### Test 1 échoue (Login)
```bash
# Vérifier le serveur
node server.js

# Vérifier l'URL dans config/api.ts
```

### Test 2 échoue (Notifications)
```bash
# Effacer le cache
expo start --clear

# Vérifier AsyncStorage
# (Normalement automatique)
```

### Test 3 échoue (Bloqués)
```bash
# Même solution que Test 2
expo start --clear
```

### Test 4 échoue (Typing)
```bash
# Vérifier Socket.IO
# Logs serveur : chercher "Client connecté"
# Logs app : chercher "Socket connected"
```

### Test 5/6 échoue (Export)
```bash
# Vérifier les permissions
# (Normalement automatique sur mobile)
```

---

## 🎓 Prochaine étape

### Si tous les tests passent
```
1. 🎊 Célèbre ! Tu as une app fonctionnelle !
2. 📱 Build un APK/IPA pour tests complets
3. 👥 Partage avec des beta-testeurs
4. 📝 Collecte les feedbacks
5. 🚀 Déploie en production !
```

### Pour aller plus loin
```
📖 Lis : AMELIORATIONS-COMPLETEES.md
🧪 Teste : GUIDE-DE-TEST.md (test complet)
✨ Découvre : NOUVELLES-FONCTIONNALITES.md
📊 Consulte : RESUME-AMELIORATIONS.md
```

---

## ⏱️ Temps estimé

| Test | Durée | Difficulté |
|------|-------|------------|
| Test 1 : Login | 30s | ⭐ Facile |
| Test 2 : Notifications | 1min | ⭐⭐ Moyen |
| Test 3 : Bloqués | 1min | ⭐⭐ Moyen |
| Test 4 : Typing | 2min | ⭐⭐⭐ Avancé |
| Test 5 : Export | 30s | ⭐ Facile |
| Test 6 : Mes données | 30s | ⭐ Facile |
| **TOTAL** | **~5min** | |

---

## 📸 Screenshots attendus

### Test 2 : Notifications
```
✅ Toggles en position OFF
✅ Toggles grisés quand "Push" est OFF
✅ Message de sauvegarde (optionnel)
```

### Test 3 : Bloqués
```
✅ Liste d'utilisateurs avec avatars rouges
✅ Dates de blocage affichées
✅ Bouton ✅ vert pour débloquer
```

### Test 4 : Typing
```
✅ Texte "X est en train d'écrire..." en italique gris
✅ Position : En bas de la liste de messages
✅ Disparition automatique
```

### Test 5 : Export
```
✅ Card bleu avec icône download
✅ Message de succès
```

---

**🎯 Bonne chance ! Tu vas voir, tout marche parfaitement ! ✨**

---

**Temps total** : ⏱️ 5 minutes
**Niveau** : 👶 Débutant friendly
**Pré-requis** : Node.js + Expo Go
**Résultat** : 🚀 App validée !
