$file = "c:\Users\mehau\Documents\Mehau\Code\chat-app\public\js\index.js"
$content = Get-Content $file -Raw

# Trouver et remplacer la section problématique
$oldCode = @'
      const preview = "👋 " + currentUser + " veut discuter avec toi !"

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
          showToast(`✅ Demande envoyée à ${receiver}`, { type: 'success' })
          input.value = ''
        } else if (ack && ack.exists) {
          showToast(`⚠️ Demande déjà existante (id=${ack.id})`, { type: 'info' })
          input.value = ''
        } else {
          if (apiRes && apiRes.ok) {
            showToast(`✅ Demande envoyée à ${receiver}`, { type: 'success' })
            input.value = ''
          } else {
            showToast('❌ Erreur lors de l'envoi de la demande', { type: 'error' })
          }
        }
      })
'@

$newCode = @'
      const preview = "👋 " + currentUser + " veut discuter avec toi !"

      try {
        const apiRes = await apiFetch('/api/send-conversation-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: currentUser, receiver, preview })
        })

        const data = await apiRes.json()
        
        if (data.ok) {
          window.showToast(`✅ Demande envoyée à ${receiver}`, { type: 'success' })
          input.value = ''
        } else if (data.exists) {
          window.showToast(`⚠️ Demande déjà existante`, { type: 'info' })
          input.value = ''
        } else {
          window.showToast(data.error || '❌ Erreur lors de l\'envoi de la demande', { type: 'error' })
        }
      } catch (err) {
        console.error('Erreur:', err)
        window.showToast('❌ Erreur réseau', { type: 'error' })
      }
'@

$content = $content.Replace($oldCode, $newCode)
Set-Content $file -Value $content -NoNewline

Write-Host "✅ Fichier index.js mis à jour avec succès !" -ForegroundColor Green
