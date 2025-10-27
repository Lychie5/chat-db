// === js/conv_requests.js ===

// Socket initialisé globalement dans public/js/socket.js
const socket = window.socket

// Utiliser chemins relatifs pour compatibilité localhost/déploiement
function apiFetch(path, options) {
  return fetch(path, options)
}


const currentUser = window.getCurrentUser()
if (!currentUser) window.location.href = "login.html"

async function chargerDemandesConversations() {
  const section = document.getElementById("convRequests")
  section.innerHTML = "<p class='empty-msg'>Chargement...</p>"

  const res = await fetch(`/api/conversation-requests/${currentUser}`)
  const data = await res.json()
  section.innerHTML = ""

  document.querySelectorAll(".accept").forEach(btn => {
    btn.onclick = () => accepterConv(btn.dataset.id)
  })


  if (data.length === 0) {
    section.innerHTML = "<p class='empty-msg'>Aucune demande pour le moment</p>"
    return
  }

  data.forEach(req => {
    const div = document.createElement("div")
    div.classList.add("request-item")
    div.innerHTML = `
      <p><b>${req.sender}</b> souhaite discuter avec vous :</p>
      <blockquote class="preview">${req.preview || "(aucun aperçu)"}</blockquote>
      <div class="btn-group">
        <button class="accept" data-id="${req.id}">✅ Accepter</button>
        <button class="decline" data-id="${req.id}">❌ Refuser</button>
      </div>
    `
    section.appendChild(div)
  })

  document.querySelectorAll(".accept").forEach(btn => {
    btn.onclick = () => accepterConv(btn.dataset.id)
  })
  document.querySelectorAll(".decline").forEach(btn => {
    btn.onclick = () => refuserConv(btn.dataset.id)
  })
}

async function accepterConv(id) {
  console.log("🟡 Tentative d’acceptation de la demande :", id)
  
  const btn = document.querySelector(`.accept[data-id='${id}']`)
  if (btn) btn.disabled = true
  try {
    const res = await apiFetch(`/api/conversation-accept/${id}`, { method: "POST" })
    console.log("🔵 Réponse brute :", res.status)

    if (!res.ok) {
      let body = ''
      try { body = await res.text() } catch {}
      window.showToast('❌ Erreur serveur lors de l\'acceptation: ' + (body || res.status), { type: 'error' })
      return
    }

    let data = {}
    try { data = await res.json(); console.log("✅ Réponse JSON :", data) } catch { data = { id, user1: currentUser, user2: "Inconnu" } }

  // Note: le serveur émet déjà "conversation accepted" après la création;
  // on peut néanmoins émettre localement si on veut un comportement immédiat.
  // socket.emit("conversation accepted", data)

  // 🔹 Confirmation visuelle
  window.showToast('✅ Conversation acceptée avec ' + (data.user1 === currentUser ? data.user2 : data.user1), { type: 'success' })

  // 🔹 Recharge la liste
  chargerDemandesConversations()

    // 🔹 Redirection directe vers la conversation
    setTimeout(() => { const ami = data.user1 === currentUser ? data.user2 : data.user1; window.location.href = `chat.html?conv=${data.id}&user=${ami}` }, 800)

  } catch (err) {
    console.error("❌ Erreur JS :", err)
    window.showToast('Erreur lors de l\'acceptation ❌ (voir console)', { type: 'error' })
  }
  finally {
    if (btn) btn.disabled = false
  }
}

async function refuserConv(id) {
  const res = await fetch(`/api/conversation-decline/${id}`, { method: "POST" })
  if (res.ok) {
    alert("❌ Conversation refusée.")
    chargerDemandesConversations()
  } else {
    alert("Erreur lors du refus ❌")
  }
}

socket.on("new conversation request", data => {
  const currentUser = localStorage.getItem("currentUser")

  // ✅ Ignore les notifications qui ne concernent pas cet utilisateur
  if (data.receiver !== currentUser) return

  // 🔹 Vérifie si cette demande a déjà été affichée récemment
  if (window.lastRequestSender === data.sender) return
  window.lastRequestSender = data.sender
  setTimeout(() => (window.lastRequestSender = null), 5000)

  // ✅ Affichage propre d'une seule notif
  const notif = document.createElement("div")
  notif.classList.add("notif-toast")
  notif.innerHTML = `
    💬 Nouvelle demande de <b>${data.sender}</b> :
    <blockquote>${data.preview || "(aucun message)"}</blockquote>
  `
  document.body.appendChild(notif)
  setTimeout(() => notif.remove(), 4000)

  // Recharge la liste de manière contrôlée
  chargerDemandesConversations()
})


window.onload = () => {
  chargerDemandesConversations()
}
