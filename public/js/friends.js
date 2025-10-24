// Socket global
const socket = window.socket

function apiFetch(path, options) {
  return fetch(path, options)
}

async function chargerAmis() {
  const currentUser = window.getCurrentUser()
  const res = await fetch(`/api/friends/${currentUser}`)
  const amis = await res.json()
  const section = document.getElementById("friendsList")
  section.innerHTML = ""

  if (amis.length === 0) {
    section.innerHTML = "<p class='empty-msg'>Aucun ami pour le moment</p>"
  } else {
    amis.forEach(a => {
      const ami =
        a.sender === currentUser ? a.receiver : a.sender
      const div = document.createElement("div")
      div.classList.add("conv-item")
      div.innerHTML = `
        👤 ${ami}
        <button class="delete" onclick="supprimerAmi('${currentUser}','${ami}')">🗑️ Supprimer</button>
      `
      section.appendChild(div)
    })
  }
}

function loadRequests() {
  const currentUser = window.getCurrentUser()
  if (!currentUser) return

  fetch(`/api/friend-requests/${currentUser}`)
    .then(res => res.json())
    .then(data => {
      const received = document.getElementById("requests")
      received.innerHTML = ""
      if (data.length === 0) {
        received.innerHTML = "<p class='empty-msg'>Aucune demande reçue</p>"
      } else {
        data.forEach(req => {
          const div = document.createElement("div")
          div.classList.add("request-item")
          div.innerHTML = `
            <span><b>${req.sender}</b> vous a envoyé une demande</span>
            <button class="accept" data-id="${req.id}">✅ Accepter</button>
            <button class="decline" data-id="${req.id}">❌ Refuser</button>
          `
          received.appendChild(div)
        })
      }
    })
}

// Real-time: when server notifies of a new friend request, refresh UI
if (window.socket) {
  window.socket.on('new friend request', data => {
    const currentUser = window.getCurrentUser()
    if (!currentUser) return
    try {
      if (String(data.receiver).toLowerCase() !== String(currentUser).toLowerCase()) return
    } catch (e) { return }
    console.log('📨 Nouvelle demande d\'ami reçue via socket:', data)
    loadRequests()
    loadSentRequests && loadSentRequests()
    // optionnel: afficher toast
    window.showToast && window.showToast(`Nouvelle demande de ${data.sender}`, { type: 'info' })
  })
}

// Nouvelle fonction pour charger les demandes envoyées
async function accepterDemande(id) {
  const btn = document.querySelector(`.accept[data-id='${id}']`)
  if (btn) btn.disabled = true
  try {
    const res = await fetch(`/api/friend-accept/${id}`, { method: "POST" })
    if (res.ok) {
      window.showToast('✅ Demande acceptée !', { type: 'success' })
      await chargerAmis()
      loadRequests()
      loadSentRequests()
    } else {
      let body = ''
      try { body = await res.text() } catch {}
      window.showToast('❌ Erreur lors de l\'acceptation: ' + (body || res.status), { type: 'error' })
    }
  } catch (err) {
    console.error(err)
    window.showToast('❌ Erreur réseau lors de l\'acceptation', { type: 'error' })
  } finally {
    if (btn) btn.disabled = false
  }
}

async function refuserDemande(id) {
  const btn = document.querySelector(`.decline[data-id='${id}']`)
  if (btn) btn.disabled = true
  try {
    const res = await fetch(`/api/friend-decline/${id}`, { method: "POST" })
    if (res.ok) {
      window.showToast('❌ Demande refusée.', { type: 'info' })
      loadRequests()
      loadSentRequests()
    } else {
      window.showToast('Erreur lors du refus ❌', { type: 'error' })
    }
  } catch (err) {
    console.error(err)
    window.showToast('Erreur réseau lors du refus', { type: 'error' })
  } finally {
    if (btn) btn.disabled = false
  }
}

async function supprimerAmi(user1, user2) {
  const res = await fetch("/api/delete-friend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user1, user2 })
  });

  if (res.ok) {
    alert("Ami supprimé 🗑️");

    // 🔹 Supprime aussi les conversations locales liées
    let convs = JSON.parse(localStorage.getItem("conversations")) || [];
    convs = convs.filter(
      c => !(c.users.includes(user1) && c.users.includes(user2))
    );
    localStorage.setItem("conversations", JSON.stringify(convs));

    // 🔹 Rafraîchit la liste d’amis
    chargerAmis();
  } else {
    alert("Erreur lors de la suppression ❌");
  }
}


function loadRequests() {
  const currentUser = window.getCurrentUser()
  if (!currentUser) return

  fetch(`/api/friend-requests/${currentUser}`)
    .then(res => res.json())
    .then(data => {
      const received = document.getElementById("requests")
      received.innerHTML = ""
      if (data.length === 0) {
        received.innerHTML = "<p class='empty-msg'>Aucune demande reçue</p>"
      } else {
        data.forEach(req => {
          const div = document.createElement("div")
          div.classList.add("request-item")
          div.innerHTML = `
            <span><b>${req.sender}</b> vous a envoyé une demande</span>
            <button class="accept" data-id="${req.id}">✅ Accepter</button>
            <button class="decline" data-id="${req.id}">❌ Refuser</button>
          `
          received.appendChild(div)
        })

        // ✅ Ajout essentiel : relier les boutons aux fonctions
        document.querySelectorAll(".accept").forEach(btn => {
          btn.onclick = () => accepterDemande(btn.dataset.id)
        })
        document.querySelectorAll(".decline").forEach(btn => {
          btn.onclick = () => refuserDemande(btn.dataset.id)
        })
      }
    })
}

// Envoi d’une nouvelle demande
document.getElementById("addFriendForm").addEventListener("submit", async e => {
  e.preventDefault()
  const sender = localStorage.getItem("currentUser")
  const receiver = document.getElementById("friendPseudo").value.trim()

  if (!receiver || receiver === sender) return alert("Pseudo invalide ⚠️")

  const res = await fetch("/api/send-friend-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, receiver })
  })

  const msg = document.getElementById("friendMessage")
  msg.style.display = "block"

  if (res.ok) {
    msg.textContent = `✅ Demande envoyée à ${receiver}`
    msg.className = "friend-message success"
  } else {
    msg.textContent = "❌ Erreur lors de l’envoi"
    msg.className = "friend-message error"
  }

  document.getElementById("friendPseudo").value = ""
  chargerDemandes()
})

// Au chargement
window.onload = () => {
  chargerAmis()
  loadRequests()
  loadSentRequests(); // 👈 nouvelle fonction
}
