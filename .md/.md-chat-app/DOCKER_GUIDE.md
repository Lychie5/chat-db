# 🐳 Guide Docker - Application de Chat

## 📋 Table des Matières
1. [Installation Docker](#installation-docker)
2. [Démarrage Rapide](#démarrage-rapide)
3. [Commandes Utiles](#commandes-utiles)
4. [Configuration](#configuration)
5. [Déploiement](#déploiement)
6. [Dépannage](#dépannage)

---

## 📦 Installation Docker

### Windows
1. Téléchargez [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Installez et redémarrez votre PC
3. Ouvrez Docker Desktop (il doit tourner en arrière-plan)
4. Vérifiez l'installation :
   ```bash
   docker --version
   docker-compose --version
   ```

### macOS
```bash
brew install --cask docker
```

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

---

## 🚀 Démarrage Rapide

### Première fois (Build + Démarrage)
```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

### Démarrages suivants
```bash
# Démarrer tous les services
docker-compose up

# Ou en arrière-plan
docker-compose up -d
```

### Accès aux services
- **Application Web** : http://localhost:8080
- **PostgreSQL** : localhost:5432
- **pgAdmin** (Interface DB) : http://localhost:5050
  - Email : `admin@chatapp.com`
  - Password : `admin`

---

## 🛠 Commandes Utiles

### Gestion des conteneurs
```bash
# Voir les conteneurs actifs
docker-compose ps

# Arrêter tous les services
docker-compose down

# Arrêter ET supprimer les volumes (⚠️ efface la DB)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f  # Tous les logs
```

### Accéder à un conteneur
```bash
# Shell dans le backend
docker-compose exec backend sh

# Shell dans PostgreSQL
docker-compose exec postgres psql -U chatuser -d chat_db

# Exécuter une commande
docker-compose exec backend npm run test
```

### Gestion de la base de données
```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U chatuser -d chat_db

# Sauvegarder la DB
docker-compose exec postgres pg_dump -U chatuser chat_db > backup.sql

# Restaurer la DB
cat backup.sql | docker-compose exec -T postgres psql -U chatuser -d chat_db

# Voir les tables
docker-compose exec postgres psql -U chatuser -d chat_db -c "\dt"
```

### Nettoyage
```bash
# Supprimer les conteneurs arrêtés
docker-compose rm

# Nettoyer les images inutilisées
docker image prune -a

# Nettoyer TOUT (conteneurs, images, volumes, réseaux)
docker system prune -a --volumes
```

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.docker` pour surcharger la configuration :

```bash
# .env.docker
DATABASE_URL=postgresql://chatuser:chatpassword@postgres:5432/chat_db
PORT=8080
CORS_ORIGIN=*
NODE_ENV=development
```

Puis lancez avec :
```bash
docker-compose --env-file .env.docker up
```

### Modifier docker-compose.yml

**Changer le port** :
```yaml
services:
  backend:
    ports:
      - "3000:8080"  # Accessible sur localhost:3000
```

**Changer les credentials PostgreSQL** :
```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
```

**Ajouter Redis** (pour les sessions) :
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - chat-network
```

---

## 🌍 Déploiement

### Docker Hub
```bash
# Build l'image
docker build -t votre-username/chat-app:latest .

# Pousser sur Docker Hub
docker login
docker push votre-username/chat-app:latest

# Sur le serveur de production
docker pull votre-username/chat-app:latest
docker run -d -p 8080:8080 --env-file .env votre-username/chat-app:latest
```

### Render avec Docker
1. Ajoutez un `render.yaml` :
```yaml
services:
  - type: web
    name: chat-app
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: chat-db
          property: connectionString
```

2. Commit et push :
```bash
git add Dockerfile docker-compose.yml
git commit -m "Add Docker support"
git push
```

### Railway avec Docker
Railway détecte automatiquement le `Dockerfile` et l'utilise.

---

## 🐛 Dépannage

### Problème : Port déjà utilisé
```bash
# Trouver le processus utilisant le port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # macOS/Linux

# Changer le port dans docker-compose.yml
ports:
  - "3000:8080"  # Utiliser 3000 au lieu de 8080
```

### Problème : Conteneur ne démarre pas
```bash
# Voir les logs détaillés
docker-compose logs backend

# Reconstruire sans cache
docker-compose build --no-cache backend
docker-compose up backend
```

### Problème : Base de données vide
```bash
# Vérifier que le schema.sql est exécuté
docker-compose exec postgres psql -U chatuser -d chat_db -c "\dt"

# Si vide, exécuter manuellement
docker-compose exec postgres psql -U chatuser -d chat_db < schema.sql
```

### Problème : Modifications de code non prises en compte
```bash
# Rebuild l'image
docker-compose up --build

# Ou supprimer et recréer
docker-compose down
docker-compose up --build
```

### Problème : Espace disque plein
```bash
# Nettoyer les ressources Docker
docker system prune -a --volumes

# Voir l'espace utilisé
docker system df
```

---

## 📊 Comparaison : Avec vs Sans Docker

| Critère | Sans Docker | Avec Docker |
|---------|------------|-------------|
| **Setup initial** | 30-60 min | 5 min |
| **Installations requises** | Node.js, PostgreSQL, pgAdmin | Docker seulement |
| **Portabilité** | Config manuelle sur chaque machine | Identique partout |
| **Isolation** | Tout dans le système hôte | Services isolés |
| **Base de données** | Installation PostgreSQL | Incluse dans conteneur |
| **Déploiement** | Complexe | Simple (1 commande) |
| **Rollback** | Manuel | Instantané |

---

## 🎯 Workflow Recommandé

### Développement Local
```bash
# 1. Démarrer l'environnement
docker-compose up -d

# 2. Voir les logs en temps réel
docker-compose logs -f backend

# 3. Travailler sur le code (hot reload avec volumes)

# 4. Tester
curl http://localhost:8080/health

# 5. Arrêter
docker-compose down
```

### Production
```bash
# 1. Build l'image
docker build -t chat-app:v1.0.0 .

# 2. Tester localement
docker run -p 8080:8080 --env-file .env.prod chat-app:v1.0.0

# 3. Push sur registry
docker push votre-registry/chat-app:v1.0.0

# 4. Déployer sur serveur
# (via Render, Railway, ou docker-compose sur VPS)
```

---

## ✅ Checklist de Migration vers Docker

- [ ] Docker Desktop installé et lancé
- [ ] `Dockerfile` créé
- [ ] `docker-compose.yml` créé
- [ ] `.dockerignore` créé
- [ ] Endpoint `/health` ajouté au serveur
- [ ] Schema SQL prêt pour init automatique
- [ ] Variables d'environnement configurées
- [ ] Test local : `docker-compose up --build`
- [ ] Vérification : http://localhost:8080
- [ ] Commit et push vers Git
- [ ] Configuration Render/Railway pour utiliser Docker

---

## 🆘 Ressources

- **Documentation Docker** : https://docs.docker.com
- **Docker Compose** : https://docs.docker.com/compose
- **Best Practices** : https://docs.docker.com/develop/dev-best-practices
- **Tutoriels** : https://www.docker.com/101-tutorial

---

**Note** : Pour revenir en arrière, il suffit de supprimer `Dockerfile` et `docker-compose.yml` et de relancer `node server.js` normalement.
