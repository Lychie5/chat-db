const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'js', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Le code à rechercher
const oldCode = `      const preview = "👋 " + currentUser + " veut discuter avec toi !"

      let apiRes
      try {
        apiRes = await apiFetch('/api/send-conversation-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: currentUser, receiver, preview })
        })
      } catch (err) {
        console.error('Erreur réseau:', err)
        showToast('Erreur réseau lors de l'envoi de la demande', { type: 'error' })
        return
      }

      socket.emit('conversation request', { sender: currentUser, receiver, preview }, (ack) => {
        if (ack && ack.ok) {
          showToast(\`✅ Demande envoyée à \${receiver}\`, { type: 'success' })
          input.value = ''
        } else if (ack && ack.exists) {
          showToast(\`⚠️ Demande déjà existante (id=\${ack.id})\`, { type: 'info' })
          input.value = ''
        } else {
          if (apiRes && apiRes.ok) {
            showToast(\`✅ Demande envoyée à \${receiver}\`, { type: 'success' })
            input.value = ''
          } else {
            showToast('❌ Erreur lors de l\\'envoi de la demande', { type: 'error' })
          }
        }
      })`;

// Le nouveau code
const newCode = `      const preview = "👋 " + currentUser + " veut discuter avec toi !"

      try {
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

// Faire le remplacement
content = content.replace(oldCode, newCode);

// Sauvegarder
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fichier index.js corrigé avec succès !');
