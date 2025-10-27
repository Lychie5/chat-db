# 🔧 Configuration de la Base de Données

## ⚠️ Problème Détecté

Votre serveur utilise **PostgreSQL** mais votre `.env` était configuré pour **MySQL Railway**.

## ✅ Solutions

### Option A : Utiliser PostgreSQL en local (RECOMMANDÉ)

1. **Installer PostgreSQL** si ce n'est pas déjà fait :
   - Télécharger : https://www.postgresql.org/download/windows/
   - Ou via Chocolatey : `choco install postgresql`

2. **Créer la base de données** :
   ```bash
   # Se connecter à PostgreSQL
   psql -U postgres
   
   # Créer la base
   CREATE DATABASE chat_db;
   
   # Quitter
   \q
   ```

3. **Mettre à jour le `.env`** (déjà fait) :
   ```properties
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=votre_mot_de_passe_postgres
   DB_NAME=chat_db
   ```

4. **Créer les tables** :
   ```bash
   node tools/db_schema.js
   ```

### Option B : Utiliser SQLite (Plus simple pour développement local)

Si vous ne voulez pas installer PostgreSQL, vous pouvez modifier le serveur pour utiliser SQLite :

1. **Installer SQLite** :
   ```bash
   npm install sqlite3
   ```

2. **Modifier server.js** pour utiliser SQLite au lieu de PostgreSQL

### Option C : Utiliser Railway directement (Nécessite connexion internet)

Si vous voulez utiliser Railway, vous devez :
1. Vous connecter via Railway CLI
2. Utiliser l'URL publique fournie par Railway (pas .internal)
3. Activer le VPN Railway si nécessaire

## 🚀 Commandes Rapides

### Démarrer le serveur (après configuration DB) :
```bash
node server.js
```

### Vérifier la connexion PostgreSQL :
```bash
node tools/test_db_connection.js
```

### Créer les tables :
```bash
node tools/db_schema.js
```

## 📝 Fichier .env actuel

Le fichier `.env` a été mis à jour pour PostgreSQL local.
**N'oubliez pas de changer le mot de passe** !

```properties
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe  # ← CHANGEZ CECI
DB_NAME=chat_db
```
