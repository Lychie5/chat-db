// === js/chat.js ===

const socket = window.socket

const urlParams = new URLSearchParams(window.location.search)
const convId = urlParams.get("conv") || localStorage.getItem("activeConv")
const chatWith = urlParams.get("user") || localStorage.getItem("chatWith")
const currentUser = localStorage.getItem("currentUser")

// ✅ Attendre que Socket soit bien connecté avant de rejoindre la room
socket.on("connect", () => {
  console.log("✅ Connecté au serveur Socket.io :", socket.id)
  if (convId) {
    socket.emit("join conversation", convId)
    console.log("📡 Rejoint la salle conv-" + convId)
  }
})

// Receive persisted conversation history from server when joining
socket.on('conversation history', payload => {
  try {
    if (!payload || String(payload.conversation_id) !== String(convId)) return
    const msgs = payload.messages || []
    main.innerHTML = ''
    msgs.forEach(m => {
      const p = m.pseudo || m.sender || m.user || null
      const c = m.content || m.body || m.text || null
      const t = m.created_at || m.timestamp || null
      addMessage(p, c, t)
      try { persistMessage(convId, { pseudo: p, content: c, created_at: t || new Date().toISOString() }) } catch (e) {}
    })
    try { main.scrollTop = main.scrollHeight } catch (e) {}
  } catch (err) { console.warn('Erreur traitement conversation history', err) }
})

// When server sends persisted conversation history after join
socket.on('conversation history', payload => {
  try {
    if (!payload || String(payload.conversation_id) !== String(convId)) return
    const msgs = payload.messages || []
    main.innerHTML = ''
    msgs.forEach(m => {
      const p = m.pseudo || m.sender || null
      const c = m.content || m.body || null
      const t = m.created_at || m.timestamp || null
      addMessage(p, c, t)
      try { persistMessage(convId, { pseudo: p, content: c, created_at: t || new Date().toISOString() }) } catch (e) {}
    })
    try { setTimeout(() => { main.scrollTop = main.scrollHeight }, 80) } catch (e) {}
  } catch (err) { console.warn('Error handling conversation history', err) }
})

// Sélecteurs
const main = document.querySelector("main")
const form = document.querySelector("form")
const input = document.querySelector("input")

// Titre dynamique
document.querySelector("header").textContent = `💬 Discussion avec ${chatWith}`

// Load conversation history with canonical fallback and local backup
async function chargerMessages() {
  try {
    let res = await fetch(`/api/messages/${convId}`)
    if (!res.ok) throw new Error('empty')
    let data = await res.json()
    if (!data || !data.length) {
      // try canonical conv id
      try {
        const canResp = await fetch(`/api/conversation-between/${encodeURIComponent(currentUser)}/${encodeURIComponent(chatWith)}`, { method: 'POST' })
        if (canResp.ok) {
          const can = await canResp.json()
          if (can && can.id && String(can.id) !== String(convId)) {
            // update convId and reload
            localStorage.setItem('activeConv', String(can.id))
            window.history.replaceState({}, '', `${location.pathname}?conv=${can.id}&user=${chatWith}`)
            res = await fetch(`/api/messages/${can.id}`)
            data = await res.json()
          }
        }
      } catch (e) {
        console.warn('canonical fallback failed', e)
      }
    }

    main.innerHTML = ""
    if (data && data.length) {
      data.forEach(msg => {
        const p = msg.pseudo || msg.sender || msg.user || null
        const c = msg.content || msg.body || msg.text || msg.message || null
        const t = msg.created_at || msg.timestamp || null
        addMessage(p, c, t)
        persistMessage(convId, { pseudo: p, content: c, created_at: t || new Date().toISOString() })
      })
    } else {
      // fallback to local history
      try {
        const key = `chat_history_${convId}`
        const arr = JSON.parse(localStorage.getItem(key)) || []
        arr.forEach(m => addMessage(m.pseudo, m.content, m.created_at))
      } catch (e) { console.warn('local history read error', e) }
    }
  } catch (err) {
    console.warn('fetch messages failed, falling back to local history', err)
    try {
      const key = `chat_history_${convId}`
      const arr = JSON.parse(localStorage.getItem(key)) || []
      main.innerHTML = ""
      arr.forEach(m => addMessage(m.pseudo, m.content, m.created_at))
    } catch (e) { console.warn('fallback history read error', e) }
  }
}

function addMessage(from, text, timestamp) {
  const div = document.createElement("div")
  div.classList.add("message")
  if (from === currentUser) div.classList.add("me")
  div.innerHTML = `
    <div class="msg-text">${text}</div>
    <div class="timestamp">${formatTime(timestamp)}</div>
  `
  main.appendChild(div)
  
  // Force le scroll vers le bas après l'ajout du message
  requestAnimationFrame(() => {
    main.scrollTop = main.scrollHeight
  })
}

function persistMessage(convIdParam, msg) {
  try {
    const key = `chat_history_${convIdParam}`
    const arr = JSON.parse(localStorage.getItem(key)) || []
    arr.push(msg)
    if (arr.length > 1000) arr.splice(0, arr.length - 1000)
    localStorage.setItem(key, JSON.stringify(arr))
  } catch (e) { console.warn('persistMessage error', e) }
}

function formatTime(timestamp) {
  // Si pas de timestamp, utiliser l'heure actuelle
  const date = timestamp ? new Date(timestamp) : new Date()
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

// ✅ Envoi d’un message en temps réel
form.addEventListener("submit", e => {
  e.preventDefault()
  const text = input.value.trim()
  if (!text) return

  const message = {
    conversation_id: convId,
    pseudo: currentUser,
    text
  }

  input.value = ""
  socket.emit("chat message", message)
  // Persist locally as optimistic backup
  persistMessage(convId, { pseudo: currentUser, content: text, created_at: new Date().toISOString() })
})

// ✅ Réception en direct
socket.on("chat message", data => {
  const convIdFromSocket = data.conversation_id || data.conversationId || data.conv_id
  if (String(convIdFromSocket) == String(convId)) {
    const p = data.pseudo || data.sender || data.user || null
    const c = data.text || data.content || data.body || data.message || null
    const t = data.created_at || data.timestamp || new Date().toISOString()
    addMessage(p, c, t)
    persistMessage(convId, { pseudo: p, content: c, created_at: t })
    
    // Scroll automatique après réception d'un message
    requestAnimationFrame(() => {
      main.scrollTop = main.scrollHeight
    })
  } else {
    // increment unread for other conversation
    try {
      const key = `unread_${convIdFromSocket}`
      const prev = Number(localStorage.getItem(key) || 0)
      localStorage.setItem(key, String(prev + 1))
      try { if (window.showConversations) window.showConversations() } catch (e) {}
    } catch (e) { console.warn('error incrementing unread for other conv', e) }
  }
})

// Clear unread badge since user opened this conversation
try { localStorage.setItem(`unread_${convId}`, '0'); try { if (window.showConversations) window.showConversations() } catch (e) {} } catch (e) {}

// 🔁 Charger l’historique au démarrage
chargerMessages()
// after initial load, ensure we are scrolled to the bottom
setTimeout(() => { try { main.scrollTop = main.scrollHeight } catch (e) {} }, 300)
