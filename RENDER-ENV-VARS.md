# Variables d'environnement à configurer sur Render

Basé sur votre screenshot, voici les variables à ajouter/modifier sur Render :

## Variables PostgreSQL (depuis votre screenshot)

```
DATABASE_URL = postgresql://chat_db_p00y_user:LPctgmDjyuWRopBel0PLlffzhmdvBHb@dpg-dSstifgi27c8dam3i0-a/chat_db_p00y_user

DB_HOST = dpg-dSstifgi27c8dam3i0-a
DB_PORT = 5432
DB_USER = chat_db_p00y_user
DB_PASSWORD = LPctgmDjyuWRopBel0PLlffzhmdvBHb
DB_NAME = chat_db_p00y_user
DB_CONN_LIMIT = 10

CORS_ORIGIN = *
PORT = 10000
```

## IMPORTANT : Créer les tables

Votre base de données existe mais est VIDE. Il faut créer les tables :

1. Sur Render, allez dans votre base de données PostgreSQL
2. Cliquez sur "Connect" → "PSQL Command"
3. Copiez la commande (quelque chose comme) :
   ```
   PGPASSWORD=LPctgmDjyuWRopBel0PLlffzhmdvBHb psql -h dpg-dSstifgi27c8dam3i0-a.frankfurt-postgres.render.com -U chat_db_p00y_user chat_db_p00y_user
   ```
4. Exécutez-la dans PowerShell
5. Une fois connecté, copiez-collez le contenu de schema-postgresql.sql

## Alternative : Script automatique

Créez ce fichier et exécutez-le :
