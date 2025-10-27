# 🔴 PROBLÈME : Base de données PostgreSQL n'existe pas sur Render

## ❌ Erreur actuelle
```
❌ Erreur PostgreSQL : database "chat_db_p00y_user" does not exist
```

**Cause :** Votre serveur cherche une base de données qui n'existe pas ou les credentials sont incorrects.

---

## ✅ SOLUTION COMPLÈTE

### 📋 Étape 1 : Créer une base de données PostgreSQL sur Render

1. **Allez sur Render Dashboard** : https://dashboard.render.com

2. **Créer une nouvelle base de données :**
   - Cliquez sur **"New +"** (en haut à droite)
   - Sélectionnez **"PostgreSQL"**

3. **Configuration :**
   ```
   Name: meo-database
   Database: meo_db (ou laissez par défaut)
   User: (généré automatiquement)
   Region: Frankfurt (EU Central) ou la plus proche
   PostgreSQL Version: 16
   Instance Type: Free
   ```

4. **Cliquez sur "Create Database"**

5. **Attendez 2-3 minutes** que la base soit créée ⏳

---

### 📋 Étape 2 : Copier les credentials de la base de données

Une fois la base créée, vous verrez ces informations :

```
Internal Database URL: postgresql://user:pass@dpg-xxxxx/dbname
External Database URL: postgresql://user:pass@dpg-xxxxx.frankfurt-postgres.render.com/dbname

Hostname: dpg-xxxxx-a.frankfurt-postgres.render.com
Port: 5432
Database: meo_db
Username: meo_database_user
Password: xxxxxxxxxxxxxxxxxx
```

**🔴 IMPORTANT : Copiez "Internal Database URL"** (elle commence par `postgresql://`)

---

### 📋 Étape 3 : Configurer les variables d'environnement

1. **Retournez sur votre service web "meo"** (pas la base de données)

2. **Allez dans "Environment"** (menu de gauche)

3. **Ajoutez cette variable :**

   ```
   Nom: DATABASE_URL
   Valeur: postgresql://user:pass@dpg-xxxxx/dbname
   ```
   ⚠️ Collez l'URL complète que vous avez copiée à l'étape 2

4. **OU ajoutez ces variables séparées :**
   ```
   DB_HOST = dpg-xxxxx-a.frankfurt-postgres.render.com
   DB_PORT = 5432
   DB_USER = meo_database_user
   DB_PASSWORD = votre_mot_de_passe
   DB_NAME = meo_db
   DB_CONN_LIMIT = 10
   CORS_ORIGIN = *
   ```

5. **Cliquez sur "Save Changes"**

Votre service va **redémarrer automatiquement** (1-2 minutes)

---

### 📋 Étape 4 : Créer les tables dans votre base de données

Votre base de données est **vide** ! Il faut créer les tables.

#### Option A : Via Render Dashboard (Recommandé)

1. **Retournez sur votre base de données PostgreSQL** (pas le service web)

2. **Cliquez sur "Connect"** (en haut à droite)

3. **Choisissez "PSQL Command"** et copiez la commande :
   ```bash
   PGPASSWORD=xxxx psql -h dpg-xxxx.render.com -U user dbname
   ```

4. **Ouvrez PowerShell** sur votre PC et collez cette commande

5. **Une fois connecté, copiez-collez tout le contenu de `schema-postgresql.sql` :**

   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     pseudo VARCHAR(100) UNIQUE NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE IF NOT EXISTS friends (
     id SERIAL PRIMARY KEY,
     sender VARCHAR(100) NOT NULL,
     receiver VARCHAR(100) NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- etc... (tout le fichier)
   ```

6. **Appuyez sur Entrée**

7. **Vérifiez que les tables sont créées :**
   ```sql
   \dt
   ```
   Vous devriez voir : users, friends, conversations, messages, conversation_requests

8. **Quittez :**
   ```
   \q
   ```

#### Option B : Via script automatique (Alternative)

Créez un fichier `init-db.js` et exécutez-le une fois :

```javascript
import pkg from 'pg';
import fs from 'fs';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://user:pass@dpg-xxxx/dbname' // Votre URL
});

async function initDatabase() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');
    
    const schema = fs.readFileSync('./schema-postgresql.sql', 'utf8');
    await client.query(schema);
    
    console.log('✅ Tables créées avec succès !');
  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    await client.end();
  }
}

initDatabase();
```

Exécutez : `node init-db.js`

---

### 📋 Étape 5 : Vérifier que tout fonctionne

1. **Retournez sur les logs de votre service web**

2. **Vous devriez voir :**
   ```
   ✅ Connexion PostgreSQL Render OK
   🚀 Serveur lancé sur le port 10000
   ```

3. **Testez depuis votre navigateur :**
   ```
   https://meo-mv5n.onrender.com/api/conversations
   ```
   Devrait retourner `[]` (tableau vide, c'est normal)

4. **Essayez d'envoyer une demande d'ami**
   - Ça devrait fonctionner ! ✅

---

## 🐛 Si ça ne marche toujours pas

### Erreur : "password authentication failed"
- Vérifiez que vous avez copié le bon mot de passe
- Assurez-vous qu'il n'y a pas d'espaces avant/après dans les variables

### Erreur : "connection timeout"
- Utilisez "Internal Database URL" au lieu de "External"
- Vérifiez que la base de données est bien dans la même région

### Tables non créées
- Reconnectez-vous avec `psql` et vérifiez avec `\dt`
- Si vide, réexécutez le `schema-postgresql.sql`

---

## 📝 Checklist finale

- [ ] Base de données PostgreSQL créée sur Render
- [ ] Variables d'environnement configurées (DATABASE_URL ou DB_HOST, etc.)
- [ ] Tables créées (users, friends, conversations, messages, conversation_requests)
- [ ] Service web redémarré
- [ ] Logs montrent "✅ Connexion PostgreSQL Render OK"
- [ ] Test de l'API fonctionne

---

## 🎉 Une fois terminé

Votre architecture sera :

```
Application Web/Mobile
    ↓
https://meo-mv5n.onrender.com (Service Web)
    ↓
postgresql://dpg-xxxxx (Base de données PostgreSQL)
```

Tout fonctionnera ! 🚀
