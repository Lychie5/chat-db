# ==========================================
# 🐳 Dockerfile - Backend Node.js + Express
# ==========================================

# Base image Node.js 20 (version LTS)
FROM node:20-alpine

# Informations de maintenance
LABEL maintainer="votre-email@example.com"
LABEL description="Chat App Backend - Node.js + Express + Socket.IO"

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port (celui défini dans .env ou 8080 par défaut)
EXPOSE 8080

# Variables d'environnement par défaut (peuvent être surchargées)
ENV NODE_ENV=production
ENV PORT=8080

# Healthcheck pour vérifier que l'app fonctionne
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "server.js"]
