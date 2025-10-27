// === js/home.js ===

// Récupération de l'utilisateur connecté
const currentUser = window.getCurrentUser()
if (!currentUser) window.location.href = "login.html"

// Sélecteurs
const convList = document.getElementById("convList")
const socket = window.socket

// 🔹 Charger les conversations depuis la base
function loadConversations() {
  fetch("/api/conversations")
    .then(res => res.json())
    .then(data => {
      convList.innerHTML = ""
      const convs = data.filter(c => c.user1 === currentUser || c.user2 === currentUser)

      if (convs.length === 0) {
        convList.innerHTML = "<p class='empty-msg'>Aucune discussion pour le moment</p>"
      } else {
        convs.forEach(c => {
          const ami = c.user1 === currentUser ? c.user2 : c.user1
          const div = document.createElement("div")
          div.classList.add("conv-item")
          div.innerHTML = `<span>${ami}</span><span class="go">›</span>`
          div.onclick = () => {
            window.location.href = `chat.html?conv=${c.id}&user=${ami}`
          }
          convList.appendChild(div)
        })
      }
    })
}

// 🔹 Envoi d'une nouvelle demande de conversation (bind after DOM ready)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newConvForm')
  const input = document.getElementById('newUser')
  if (!form || !input) return

  form.onsubmit = async e => {
    e.preventDefault()
    const target = input.value.trim()
    if (!target) return
    if (target === currentUser) return alert('Impossible de discuter avec soi-même ⚠️')

    let res
    try {
      res = await fetch('/api/conversation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentUser, receiver: target, preview: `Nouvelle discussion de ${currentUser}` })
      })
    } catch (err) {
      console.error(err)
      showToast('Erreur réseau lors de l’envoi de la demande', { type: 'error' })
      return
    }

    socket.emit('conversation request', { sender: currentUser, receiver: target, preview: `Nouvelle discussion de ${currentUser}` }, (ack) => {
      if (ack && ack.ok) {
        showToast(`✅ Demande envoyée à ${target}`, { type: 'success' })
        input.value = ''
        loadConversations()
      } else if (ack && ack.exists) {
        showToast(`⚠️ Demande déjà existante (id=${ack.id})`, { type: 'info' })
      } else if (res && res.ok) {
        showToast(`✅ Demande envoyée à ${target}`, { type: 'success' })
        input.value = ''
        loadConversations()
      } else {
        showToast('❌ Erreur lors de l’envoi de la demande', { type: 'error' })
      }
    })
  }
})

// 🔁 Charger les conversations existantes au démarrage
loadConversations()


// === Notification interactive de nouvelle demande de conversation ===
socket.on("new conversation request", data => {
  const currentUser = window.getCurrentUser()
  if (data.receiver !== currentUser) return

  console.log("📩 Nouvelle demande reçue :", data)
  if (data.receiver !== currentUser) return

  const notif = document.createElement("div")
  notif.classList.add("notif-toast")
  notif.innerHTML = `
    💬 <b>${data.sender}</b> veut discuter avec toi !
    <blockquote>${data.preview || "(aucun message)"}</blockquote>
  `
  document.body.appendChild(notif)
  setTimeout(() => notif.remove(), 5000)

  notif.classList.add("notif-toast")
  notif.innerHTML = `
    💬 <b>${data.sender}</b> veut discuter avec toi !
    <blockquote>${data.preview || "(aucun message)"}</blockquote>
    <div class="btn-group" style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end;">
      <button class="accept">✅ Accepter</button>
      <button class="decline">❌ Refuser</button>
    </div>
  `
  document.body.appendChild(notif)

  // ✅ Bouton "Accepter"
  notif.querySelector(".accept").onclick = async () => {
    const res = await fetch(`/api/conversation-accept/${data.id}`, { method: "POST" })
    if (res.ok) {
      notif.remove()
      alert("✅ Conversation acceptée !")
      window.location.href = `chat.html?conv=${data.id}&user=${data.sender}`
    } else {
      alert("❌ Erreur lors de l’acceptation.")
    }
  }

  // ❌ Bouton "Refuser"
  notif.querySelector(".decline").onclick = async () => {
    const res = await fetch(`/api/conversation-decline/${data.id}`, { method: "POST" })
    if (res.ok) {
      notif.remove()
      alert("❌ Conversation refusée.")
    } else {
      alert("⚠️ Erreur lors du refus.")
    }
  }

  // Auto-fermeture après 10 secondes si pas d’action
  setTimeout(() => notif.remove(), 10000)
})
