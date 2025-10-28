#!/usr/bin/env node

/**
 * 🚀 Script d'installation automatique - Meo Chat OAuth
 * 
 * Ce script automatise l'installation complète des fonctionnalités OAuth :
 * - Installation des dépendances backend et mobile
 * - Migration de la base de données
 * - Génération de secrets sécurisés
 * - Configuration du fichier .env
 * - Vérification de la configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function exec(command, options = {}) {
  try {
    log(`\n⚙️  Exécution: ${command}`, 'cyan');
    execSync(command, { stdio: 'inherit', ...options });
    log('✅ Succès\n', 'green');
    return true;
  } catch (error) {
    log('❌ Erreur: ' + error.message, 'red');
    return false;
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(colors.yellow + prompt + colors.reset, resolve);
  });
}

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 INSTALLATION MEO CHAT OAUTH', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('Ce script va installer et configurer les fonctionnalités OAuth.', 'blue');
  log('Assurez-vous d\'avoir :', 'blue');
  log('  • Node.js 16+ installé', 'blue');
  log('  • PostgreSQL configuré', 'blue');
  log('  • Git installé (optionnel)', 'blue');
  log('', 'blue');

  const proceed = await question('Voulez-vous continuer ? (o/n) : ');
  if (proceed.toLowerCase() !== 'o') {
    log('\n❌ Installation annulée.', 'red');
    rl.close();
    return;
  }

  // Étape 1 : Installation des dépendances backend
  log('\n📦 Étape 1/6 : Installation des dépendances backend...', 'bright');
  if (!exec('npm install')) {
    log('⚠️  Certaines dépendances n\'ont pas pu être installées.', 'yellow');
  }

  // Étape 2 : Installation des dépendances mobile
  log('\n📱 Étape 2/6 : Installation des dépendances mobile...', 'bright');
  if (fs.existsSync('chat-db-mobile')) {
    if (!exec('npm install', { cwd: 'chat-db-mobile' })) {
      log('⚠️  Certaines dépendances mobile n\'ont pas pu être installées.', 'yellow');
    }
  } else {
    log('⚠️  Dossier chat-db-mobile introuvable. Ignoré.', 'yellow');
  }

  // Étape 3 : Configuration du fichier .env
  log('\n⚙️  Étape 3/6 : Configuration du fichier .env...', 'bright');
  
  const envExists = fs.existsSync('.env');
  if (envExists) {
    const overwrite = await question('.env existe déjà. Voulez-vous le regénérer ? (o/n) : ');
    if (overwrite.toLowerCase() !== 'o') {
      log('⏭️  Configuration .env ignorée.', 'yellow');
    } else {
      await createEnvFile();
    }
  } else {
    await createEnvFile();
  }

  // Étape 4 : Migration de la base de données
  log('\n🗄️  Étape 4/6 : Migration de la base de données...', 'bright');
  const migrate = await question('Voulez-vous exécuter la migration SQL maintenant ? (o/n) : ');
  
  if (migrate.toLowerCase() === 'o') {
    if (fs.existsSync('tools/migrate_oauth_support.js')) {
      exec('node tools/migrate_oauth_support.js');
    } else {
      log('⚠️  Script de migration introuvable.', 'yellow');
    }
  } else {
    log('⏭️  Migration ignorée. Exécutez manuellement :', 'yellow');
    log('   node tools/migrate_oauth_support.js', 'cyan');
  }

  // Étape 5 : Vérification de la configuration
  log('\n🔍 Étape 5/6 : Vérification de la configuration...', 'bright');
  checkConfiguration();

  // Étape 6 : Instructions finales
  log('\n📝 Étape 6/6 : Instructions finales', 'bright');
  log('\n' + '='.repeat(60), 'green');
  log('✨ INSTALLATION TERMINÉE !', 'green');
  log('='.repeat(60) + '\n', 'green');

  log('Prochaines étapes :', 'bright');
  log('1. Configurez les OAuth providers (voir OAUTH_SETUP_GUIDE.md)', 'blue');
  log('2. Remplissez les CLIENT_ID et CLIENT_SECRET dans .env', 'blue');
  log('3. Démarrez le serveur : npm start', 'blue');
  log('4. Démarrez l\'app mobile : cd chat-db-mobile && npx expo start', 'blue');
  log('', 'blue');
  log('📚 Documentation :', 'bright');
  log('  • Guide OAuth : OAUTH_SETUP_GUIDE.md', 'cyan');
  log('  • Fonctionnalités : OAUTH_FEATURES.md', 'cyan');
  log('  • Variables : .env.example', 'cyan');
  log('', 'blue');

  rl.close();
}

async function createEnvFile() {
  log('\n📝 Configuration des variables d\'environnement...', 'blue');
  
  const databaseUrl = await question('DATABASE_URL (PostgreSQL) : ');
  const apiUrl = await question('API_URL (ex: http://localhost:3000) : ') || 'http://localhost:3000';
  
  log('\n🔑 Génération de secrets sécurisés...', 'blue');
  const jwtSecret = generateSecret(32);
  const sessionSecret = generateSecret(32);
  log('✅ Secrets générés', 'green');

  const envContent = `# ========================================
# 🔐 MEO CHAT - Configuration générée automatiquement
# ========================================

# 💾 Database
DATABASE_URL=${databaseUrl}

# 🌐 Server
API_URL=${apiUrl}
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# 🔑 Security (générés automatiquement)
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}

# 🔵 Google OAuth (à remplir)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ⚫ GitHub OAuth (à remplir)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# 🔵 Facebook OAuth (à remplir)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# 🟣 Discord OAuth (à remplir)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# 🍎 Apple OAuth (optionnel)
APPLE_SERVICE_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY_PATH=./auth/AuthKey.p8

# ========================================
# ⚠️  NE COMMITEZ JAMAIS CE FICHIER
# ========================================
`;

  fs.writeFileSync('.env', envContent);
  log('✅ Fichier .env créé avec succès', 'green');
}

function checkConfiguration() {
  const checks = [
    { file: 'package.json', desc: 'package.json backend' },
    { file: 'server.js', desc: 'Serveur Express' },
    { file: 'auth/oauth-routes.js', desc: 'Routes OAuth' },
    { file: 'chat-db-mobile/package.json', desc: 'package.json mobile' },
    { file: 'chat-db-mobile/app/index.tsx', desc: 'Page login mobile' },
    { file: 'chat-db-mobile/app/settings/edit-profile.tsx', desc: 'Page profil mobile' },
    { file: 'tools/migrate_oauth_support.js', desc: 'Script de migration' },
    { file: 'OAUTH_SETUP_GUIDE.md', desc: 'Guide OAuth' },
  ];

  log('\nFichiers vérifiés :', 'blue');
  
  let allGood = true;
  for (const check of checks) {
    const exists = fs.existsSync(check.file);
    if (exists) {
      log(`  ✅ ${check.desc}`, 'green');
    } else {
      log(`  ❌ ${check.desc} - MANQUANT`, 'red');
      allGood = false;
    }
  }

  if (allGood) {
    log('\n✨ Tous les fichiers sont présents !', 'green');
  } else {
    log('\n⚠️  Certains fichiers sont manquants.', 'yellow');
  }

  // Vérifier les dépendances
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['passport', 'jsonwebtoken', 'multer', 'express-session'];
  
  log('\nDépendances backend :', 'blue');
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
      log(`  ✅ ${dep}`, 'green');
    } else {
      log(`  ❌ ${dep} - MANQUANT`, 'red');
    }
  }

  if (fs.existsSync('chat-db-mobile/package.json')) {
    const mobilePackageJson = JSON.parse(fs.readFileSync('chat-db-mobile/package.json', 'utf8'));
    const requiredMobileDeps = ['expo-auth-session', 'expo-image-picker', 'expo-web-browser'];
    
    log('\nDépendances mobile :', 'blue');
    for (const dep of requiredMobileDeps) {
      if (mobilePackageJson.dependencies[dep]) {
        log(`  ✅ ${dep}`, 'green');
      } else {
        log(`  ❌ ${dep} - MANQUANT`, 'red');
      }
    }
  }
}

// Exécution
main().catch((error) => {
  log('\n💥 Erreur fatale:', 'red');
  console.error(error);
  rl.close();
  process.exit(1);
});
