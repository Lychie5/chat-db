// === js/index.js ===


// Socket est initialisé dans public/js/socket.js et pointe vers la même origine
const socket = window.socket

socket.on("connect", () => console.log("✅ Connecté :", socket.id))
socket.on("disconnect", r => console.warn("❌ Déconnecté :", r))
socket.on("connect_error", e => console.error("⚠️ Erreur Socket.io :", e && e.message ? e.message : e))

// Utiliser des chemins relatifs pour les appels API afin d'être compatible avec localhost ou un déploiement (Render, etc.)
function apiFetch(path, options) {
  return fetch(path, options)
}

const currentUser = window.getCurrentUser()
if (!currentUser) window.location.href = 'login.html'

let convSection
let form
let input

let conversations = JSON.parse(localStorage.getItem("conversations")) || []
let friends = []

// Charge la liste d'amis depuis le serveur et met à jour la variable `friends`
async function chargerAmisServeur() {
  try {
    const user = window.getCurrentUser()
    if (!user) {
      friends = []
      return
    }
    const res = await fetch(`/api/friends/${encodeURIComponent(user)}`)
    if (!res.ok) {
      console.warn('chargerAmisServeur: réponse non OK', res.status)
      friends = []
      return
    }
    const data = await res.json()
    // `data` est une liste de rows { sender, receiver }
    friends = data.map(a => (a.sender === user ? a.receiver : a.sender))
    console.log('✅ Amis chargés :', friends)
  } catch (err) {
    console.error('Erreur chargerAmisServeur:', err)
    friends = []
  }
}

// 🔹 Charger la liste des amis depuis MySQL
// 🔹 Nettoyer les conversations locales qui n'existent plus côté serveur
async function syncConversations() {
  const currentUserLocal = window.getCurrentUser()
  if (!currentUserLocal) return
  let res
  try {
    res = await fetch(`/api/conversations/${encodeURIComponent(currentUserLocal)}`)
  } catch (err) {
    console.warn('syncConversations: fetch failed', err)
    return // don't clear local cache on network errors
  }

  if (!res.ok) {
    console.warn('syncConversations: server returned', res.status)
    return // avoid wiping local conversations when server returns error or empty for access reasons
  }

  const serverConvs = await res.json()
  let localConvs = JSON.parse(localStorage.getItem("conversations")) || []
  // Merge serverConvs and localConvs keeping server canonical ids when available.
  const map = new Map()

  function keyForConv(c) {
    const users = (c.users && c.users.slice()) || [c.user1, c.user2]
    users.sort()
    return users.join('|')
  }

  // Add server conversations first (canonical)
  for (const s of serverConvs) {
    const users = [s.user1, s.user2]
    users.sort()
    map.set(users.join('|'), { id: s.id, users })
  }

  // Merge local ones if server doesn't have them (preserve local history)
  for (const l of localConvs) {
    const k = keyForConv(l)
    if (!map.has(k)) {
      // keep local id and users array
      const users = l.users && l.users.slice() ? l.users.slice() : [l.user1, l.user2]
      users.sort()
      map.set(k, { id: l.id, users })
    }
  }

  const merged = Array.from(map.values())
  // Persist merged conversations and update in-memory variable
  localStorage.setItem('conversations', JSON.stringify(merged))
  conversations = merged
}


// Vérifie si deux utilisateurs sont amis
function isFriend(user1, user2) {
  return friends.includes(user2) || friends.includes(user1)
}

// Supprime les doublons de conversations
function cleanDuplicates() {
  const unique = []
  for (const conv of conversations) {
    const exists = unique.some(c =>
      c.users.sort().join("-") === conv.users.sort().join("-")
    )
    if (!exists) unique.push(conv)
  }
  conversations = unique
  localStorage.setItem("conversations", JSON.stringify(conversations))
}

// Affiche les conversations locales
// Affiche les conversations locales
function showConversations() {
  convSection.innerHTML = ""
  // Always read latest persisted conversations so UI reflects storage
  conversations = JSON.parse(localStorage.getItem('conversations')) || []
  const userConvs = conversations.filter(c => c.users.includes(currentUser))

  if (userConvs.length === 0) {
    convSection.innerHTML = "<p class='empty-msg'>Aucune conversation pour le moment</p>"
    return
  }

  userConvs.forEach(conv => {
  const other = conv.users.find(u => u !== currentUser)
    const div = document.createElement("div")
    div.classList.add("conv-item")
    // unread badge placeholder
    const unreadKey = `unread_${conv.id}`
    const unreadCount = Number(localStorage.getItem(unreadKey) || 0)
    const badge = unreadCount > 0 ? `<span class='badge'>+${unreadCount}</span>` : ''
    div.innerHTML = `<span>${other}</span> ${badge} <span class='go'>💬</span>`

    div.addEventListener("click", () => {
      // Nettoyer toute ancienne donnée obsolète
      localStorage.removeItem("activeConv")
      localStorage.removeItem("chatWith")

      // Stocker les infos utiles
      // Ask server for canonical conv id for this pair (in case schema generated id differs)
    fetch(`/api/conversation-between/${encodeURIComponent(currentUser)}/${encodeURIComponent(other)}`, { method: 'POST' })
          .then(async (r) => {
            if (r.status === 403) {
              window.showToast('Vous devez être amis pour démarrer une conversation.', { type: 'error' })
              return null
            }
            return r.ok ? r.json() : null
          })
        .then(data => {
            const canonicalId = data && data.id ? data.id : conv.id
          localStorage.setItem("activeConv", canonicalId)
          localStorage.setItem("chatWith", other)
          window.location.href = `chat.html?conv=${canonicalId}&user=${other}`
        })
        .catch(err => {
          console.warn('Erreur récupération conversation canonical, using local id', err)
          localStorage.setItem("activeConv", conv.id)
          localStorage.setItem("chatWith", other)
          window.location.href = `chat.html?conv=${conv.id}&user=${other}`
        })
    })

    convSection.appendChild(div)
  })
}

// (Moved form handler into DOMContentLoaded to avoid binding before DOM ready)

socket.on("connect", () => {
  console.log("✅ Connecté au serveur Socket.io :", socket.id)
})

socket.on("disconnect", reason => {
  console.warn("❌ Déconnecté :", reason)
})

socket.on("conversation accepted", data => {
  const currentUser = window.getCurrentUser()

  // 🔹 Si l’utilisateur concerné fait partie de la conversation
  if (data.user1 === currentUser || data.user2 === currentUser) {
    console.log("💬 Nouvelle conversation créée :", data)

    // Ajouter dans les conversations locales
    const newConv = {
      id: data.id,
      users: [data.user1, data.user2]
    }

    let convs = JSON.parse(localStorage.getItem("conversations")) || []
    convs.push(newConv)
    localStorage.setItem("conversations", JSON.stringify(convs))

    // Rafraîchir la liste visible
    showConversations()
  }
})

// Unread badge notification: increment unread count for a conversation
socket.on('conversation unread', data => {
  try {
    const convId = data && (data.conversation_id || data.conversationId)
    if (!convId) return
    const key = `unread_${convId}`
    const prev = Number(localStorage.getItem(key) || 0)
    localStorage.setItem(key, String(prev + (data.increment || 1)))
    // refresh the list UI if present
    try { showConversations() } catch (e) { /* ignore if UI not mounted */ }
  } catch (e) { console.warn('Error handling conversation unread', e) }
})

// ✅ Réception d'une conversation acceptée
socket.on("conversation accepted", data => {
  const currentUser = window.getCurrentUser()

  if (data.user1 !== currentUser && data.user2 !== currentUser) return

  console.log("💬 Nouvelle conversation acceptée :", data)

  // Ajoute la conversation localement
  const newConv = {
    id: data.id,
    users: [data.user1, data.user2],
  }

  let convs = JSON.parse(localStorage.getItem("conversations")) || []
  const exists = convs.some(c => c.id === data.id)
  if (!exists) {
    convs.push(newConv)
    localStorage.setItem("conversations", JSON.stringify(convs))
    showConversations()
  }

  // ✅ Notification visuelle
  const ami = data.user1 === currentUser ? data.user2 : data.user1
  const notif = document.createElement("div")
  notif.classList.add("notif-toast")
  notif.innerHTML = `
    💬 <b>${ami}</b> a accepté ta demande de conversation !
  `
  document.body.appendChild(notif)
  setTimeout(() => notif.remove(), 5000)
})

socket.on("conversation accepted", data => {
  const currentUser = localStorage.getItem("currentUser")

  if (data.user1 === currentUser || data.user2 === currentUser) {
    const other = data.user1 === currentUser ? data.user2 : data.user1

    // Ajouter la nouvelle conversation locale
    let convs = JSON.parse(localStorage.getItem("conversations")) || []
    const exists = convs.some(c => c.id === data.id)
    if (!exists) {
      convs.push({ id: data.id, users: [data.user1, data.user2] })
      localStorage.setItem("conversations", JSON.stringify(convs))
    }

    // Rafraîchir l’affichage
    showConversations()

    // Notif visuelle pour l’expéditeur
    if (data.user1 === currentUser) {
      const notif = document.createElement("div")
      notif.classList.add("notif-toast")
      notif.innerHTML = `💬 <b>${data.user2}</b> a accepté votre demande !`
      document.body.appendChild(notif)
      setTimeout(() => notif.remove(), 4000)
    }
  }
})

// Démarrage après que le DOM soit prêt
document.addEventListener('DOMContentLoaded', async () => {
  convSection = document.getElementById("convSection")
  form = document.getElementById("newConvForm")
  input = document.getElementById("newConvName")

  // attach form handler now that the element exists (handler defined above)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const receiver = input.value.trim()
      if (!receiver || receiver === currentUser) return

      if (!isFriend(currentUser, receiver)) {
        alert("❌ Vous devez être amis avec " + receiver + " pour discuter.")
        return
      }

      const existing = conversations.find(c =>
        c.users.includes(currentUser) && c.users.includes(receiver)
      )
      if (existing) {
        alert("💬 Conversation déjà existante.")
        input.value = ""
        return
      }

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
        showToast('Erreur réseau lors de l’envoi de la demande', { type: 'error' })
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
            showToast('❌ Erreur lors de l’envoi de la demande', { type: 'error' })
          }
        }
      })
    })
  }

  await chargerAmisServeur()
  await syncConversations()
  cleanDuplicates()
  showConversations()
})


