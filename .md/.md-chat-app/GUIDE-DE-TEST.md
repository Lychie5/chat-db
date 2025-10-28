# 🧪 Guide de test - Meo Chat App

## Prérequis
- Expo Go installé sur votre téléphone
- Serveur Node.js lancé (`node server.js`)
- Base de données PostgreSQL configurée

## 🚀 Lancer l'application

```bash
# Dans le dossier chat-db-mobile
cd chat-db-mobile
npm start
# ou
expo start
```

## ✅ Checklist de test

### 1. Login
- [ ] Entrer un pseudo
- [ ] Se connecter avec succès
- [ ] Vérifier qu'on arrive sur l'écran Home

### 2. Amis
- [ ] Aller dans l'onglet "Amis"
- [ ] Chercher et ajouter un ami
- [ ] Vérifier les demandes reçues
- [ ] Accepter une demande d'ami
- [ ] Vérifier que l'ami apparaît dans "Mes amis"
- [ ] Vérifier le statut "En ligne"
- [ ] Supprimer un ami

### 3. Conversations
- [ ] Cliquer sur le bouton de conversation d'un ami
- [ ] Envoyer un message
- [ ] Recevoir une réponse
- [ ] Vérifier que la conversation apparaît dans l'onglet Home

### 4. Chat en temps réel
- [ ] Ouvrir la même conversation sur 2 appareils
- [ ] Envoyer un message depuis l'appareil 1
- [ ] Vérifier réception instantanée sur l'appareil 2
- [ ] **NOUVEAU** : Taper du texte sur l'appareil 1
- [ ] **NOUVEAU** : Vérifier que "X est en train d'écrire..." apparaît sur l'appareil 2

### 5. Paramètres de notifications
- [ ] Profil > Notifications
- [ ] Activer/désactiver les notifications push
- [ ] Modifier les paramètres de sons
- [ ] Changer les préférences de vibration
- [ ] Fermer et rouvrir l'app
- [ ] **NOUVEAU** : Vérifier que les préférences sont sauvegardées

### 6. Utilisateurs bloqués
- [ ] Profil > Confidentialité > Utilisateurs bloqués
- [ ] Entrer un pseudo dans la recherche
- [ ] Cliquer sur le bouton bloquer
- [ ] **NOUVEAU** : Vérifier que l'utilisateur apparaît dans la liste
- [ ] **NOUVEAU** : Voir la date de blocage
- [ ] **NOUVEAU** : Débloquer l'utilisateur
- [ ] Fermer et rouvrir l'app
- [ ] Vérifier que la liste persiste

### 7. Export de données
- [ ] Profil > Confidentialité > Télécharger mes données
- [ ] **NOUVEAU** : Cliquer sur "Exporter mes données"
- [ ] Confirmer l'export
- [ ] Vérifier le message de succès

### 8. Suppression de compte
- [ ] Profil > Confidentialité > Supprimer mon compte
- [ ] **NOUVEAU** : Cliquer sur "Supprimer mon compte"
- [ ] Vérifier la première alerte de confirmation
- [ ] Vérifier la deuxième alerte (double confirmation)
- [ ] **NE PAS** confirmer (sauf pour tester vraiment la suppression)

### 9. Aide
- [ ] Profil > Aide
- [ ] Ouvrir/fermer plusieurs questions FAQ
- [ ] Vérifier les animations
- [ ] Tester les boutons de contact

### 10. Thème
- [ ] Profil > Thème
- [ ] Vérifier que le thème sombre est sélectionné
- [ ] Vérifier que les thèmes clair/auto sont désactivés avec "(Bientôt)"

### 11. Navigation
- [ ] Tester la navigation entre tous les écrans
- [ ] Vérifier que le bouton retour fonctionne partout
- [ ] Vérifier que les transitions sont fluides

## 🐛 Tests de bugs courants

### Test 1 : Connexion réseau
```bash
# Scénario : Serveur arrêté
1. Arrêter le serveur
2. Essayer de se connecter
3. Vérifier le message d'erreur
4. Redémarrer le serveur
5. Se reconnecter
```

### Test 2 : Messages en double
```bash
# Scénario : Éviter les doublons
1. Ouvrir une conversation sur 2 appareils
2. Envoyer un message depuis l'appareil 1
3. Vérifier qu'il n'apparaît qu'UNE fois sur chaque appareil
```

### Test 3 : Indicateur de frappe
```bash
# Scénario : Timeout automatique
1. Ouvrir une conversation sur 2 appareils
2. Taper du texte sur l'appareil 1
3. Attendre 3 secondes sans taper
4. Vérifier que l'indicateur disparaît sur l'appareil 2
```

### Test 4 : Persistance des données
```bash
# Scénario : Redémarrage de l'app
1. Bloquer un utilisateur
2. Changer les paramètres de notifications
3. Fermer complètement l'app (swipe)
4. Rouvrir l'app
5. Vérifier que tout est sauvegardé
```

## 📱 Test sur différents appareils

### iOS
- [ ] iPhone SE (petit écran)
- [ ] iPhone 14 (écran standard)
- [ ] iPhone 14 Pro Max (grand écran)

### Android
- [ ] Petit écran (5.5")
- [ ] Écran standard (6.1")
- [ ] Grand écran (6.7"+)

## 🎯 Critères de succès

### Performances
- [ ] Temps de connexion < 2 secondes
- [ ] Messages envoyés en < 1 seconde
- [ ] Pas de lag lors de la frappe
- [ ] Transitions fluides (60 FPS)

### Stabilité
- [ ] Aucun crash pendant 10 minutes d'utilisation
- [ ] Les données persistent après fermeture
- [ ] Les erreurs réseau sont gérées proprement

### UX
- [ ] Tous les boutons répondent au touch
- [ ] Feedbacks visuels clairs (loading, succès, erreur)
- [ ] Navigation intuitive
- [ ] Aucune page vide ou incomplète

## 🔥 Tests de stress

### Test 1 : Nombreux messages
```bash
1. Envoyer 50 messages rapidement
2. Vérifier que tous sont reçus
3. Vérifier que le scroll fonctionne bien
4. Vérifier les performances
```

### Test 2 : Nombreux amis
```bash
1. Ajouter 20+ amis
2. Vérifier que la liste scroll bien
3. Vérifier les performances
```

### Test 3 : Connexion/Déconnexion rapide
```bash
1. Se connecter
2. Se déconnecter immédiatement
3. Se reconnecter
4. Répéter 5 fois
5. Vérifier qu'il n'y a pas d'erreurs
```

## 📊 Rapport de test

### Template de rapport

```markdown
## Test effectué le : [DATE]
**Testeur** : [NOM]
**Appareil** : [MODÈLE]
**OS** : [iOS/Android VERSION]

### Résultats
- ✅ Tests réussis : X/Y
- ❌ Bugs trouvés : Z
- ⚠️ Améliorations suggérées : W

### Bugs détectés
1. [Description du bug]
   - Sévérité : Critique/Majeur/Mineur
   - Étapes de reproduction : ...
   - Comportement attendu : ...
   - Comportement observé : ...

### Commentaires
[Vos observations et suggestions]
```

## 🎉 Félicitations !

Si tous les tests passent, votre application Meo Chat est **production-ready** ! 🚀

Pour signaler un bug ou suggérer une amélioration, créez une issue sur GitHub ou contactez l'équipe de développement.
