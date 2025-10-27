const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'js', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Rechercher "socket.emit('conversation request'" et tout remplacer jusqu'au "}))" de fermeture
const startMarker = "let apiRes";
const endMarker = "socket.emit('conversation request'";

// Trouver le début
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.log('❌ Impossible de trouver le début du code');
  process.exit(1);
}

// Trouver la fin du socket.emit (chercher la fermeture de parenthèses)
const socketStart = content.indexOf(endMarker, startIndex);
if (socketStart === -1) {
  console.log('❌ Impossible de trouver socket.emit');
  process.exit(1);
}

// Trouver la fermeture de socket.emit (chercher "})" après)
let depth = 0;
let found = false;
let endIndex = socketStart;

for (let i = socketStart; i < content.length; i++) {
  if (content[i] === '(' || content[i] === '{') depth++;
  if (content[i] === ')' || content[i] === '}') depth--;
  
  // Quand on retourne à la profondeur initiale après avoir créé des niveaux
  if (depth === 0 && i > socketStart + 20) {
    endIndex = i + 1;
    found = true;
    break;
  }
}

if (!found) {
  console.log('❌ Impossible de trouver la fin du socket.emit');
  process.exit(1);
}

// Extraire avant et après
const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

// Nouveau code simplifié
const newCode = `try {
        const apiRes = await apiFetch('/api/send-conversation-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: currentUser, receiver, preview })
        })

        const data = await apiRes.json()
        
        if (data.ok) {
          window.showToast(\`✅ Demande envoyée à \${receiver}\`, { type: 'success' })
          input.value = ''
        } else if (data.exists) {
          window.showToast(\`⚠️ Demande déjà existante\`, { type: 'info' })
          input.value = ''
        } else {
          window.showToast(data.error || '❌ Erreur lors de l\\'envoi de la demande', { type: 'error' })
        }
      } catch (err) {
        console.error('Erreur:', err)
        window.showToast('❌ Erreur réseau', { type: 'error' })
      }`;

// Reconstituer le fichier
const newContent = before + newCode + after;

// Sauvegarder
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Fichier index.js corrigé avec succès !');
console.log(`  - Supprimé: ${endIndex - startIndex} caractères`);
console.log(`  - Ajouté: ${newCode.length} caractères`);
