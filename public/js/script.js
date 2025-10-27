// Connexion au serveur via Socket.IO (origine actuelle)
const socket = window.socket

const urlParams = new URLSearchParams(window.location.search)
const convId = urlParams.get("conv")
const contact = urlParams.get("user")

const header = document.getElementById("chatHeader")
header.textContent = `💬 ${contact}`

const messages = document.getElementById("messages")
const form = document.getElementById("form")
const input = document.getElementById("input")

let pseudo = localStorage.getItem("pseudo") || prompt("Votre pseudo :")
localStorage.setItem("pseudo", pseudo)

// Charger l’historique de la conversation
fetch(`/api/messages/${convId}`)
  .then(res => res.json())
  .then(data => {
    // server returns normalized messages: { pseudo, content, created_at }
    if (!data || !data.length) {
      // Try to recover canonical conversation id from server and retry
      fetch(`/api/conversation-between/${encodeURIComponent(pseudo)}/${encodeURIComponent(contact)}`, { method: 'POST' })
        .then(r => r.ok ? r.json() : null)
        .then(can => {
          if (can && can.id && String(can.id) !== String(convId)) {
            // update activeConv and reload messages
            localStorage.setItem('activeConv', can.id)
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.set('conv', can.id)
            window.history.replaceState({}, '', newUrl.toString())
            // re-fetch messages using canonical id
            return fetch(`/api/messages/${can.id}`).then(r => r.json())
          }
          return data
        })
        .then(retryData => {
          (retryData || []).forEach(m => {
            const p = m.pseudo || m.sender || m.user || null
            const c = m.content || m.body || m.text || m.message || null
            addMessage(p, c)
            persistMessage(convId, { pseudo: p, content: c, created_at: m.created_at || new Date().toISOString() })
          })
        })
        .catch(err => console.warn('Erreur tentative récupération canonical conv:', err))
      return
    }
    data.forEach(m => {
      const p = m.pseudo || m.sender || m.user || null
      const c = m.content || m.body || m.text || m.message || null
      addMessage(p, c)
      // persist to local backup store
      persistMessage(convId, { pseudo: p, content: c, created_at: m.created_at || new Date().toISOString() })
    })
  })
  .catch(err => {
    console.warn('fetch messages failed, falling back to local history', err)
    try {
      const key = `chat_history_${convId}`
      const arr = JSON.parse(localStorage.getItem(key)) || []
      arr.forEach(m => addMessage(m.pseudo, m.content))
    } catch (e) { console.warn('fallback history read error', e) }
  })

form.addEventListener("submit", e => {
  e.preventDefault()
  if (input.value) {
    const msg = { conversation_id: convId, pseudo, text: input.value }
    // persist immediately locally
    persistMessage(convId, { pseudo, content: input.value, created_at: new Date().toISOString() })
    socket.emit("chat message", msg)
    input.value = ""
  }
})

// Clear unread badge for this conversation since user opened it
try {
  const key = `unread_${convId}`
  localStorage.setItem(key, '0')
  // attempt to refresh conversations UI if available
  try { if (window.showConversations) window.showConversations() } catch (e) {}
} catch (e) { console.warn('clear unread error', e) }

socket.on("chat message", data => {
  // Accept either normalized payload or original shape
  const convIdFromSocket = data.conversation_id || data.conversationId || data.conv_id
  if (String(convIdFromSocket) == String(convId)) {
    const p = data.pseudo || data.sender || data.user || null
    const c = data.text || data.content || data.body || data.message || null
    addMessage(p, c)
    persistMessage(convId, { pseudo: p, content: c, created_at: new Date().toISOString() })
  }
  else {
    // Message for a different conversation: increment unread badge for that conv
    try {
      const targetConv = convIdFromSocket
      if (!targetConv) return
      const key = `unread_${targetConv}`
      const prev = Number(localStorage.getItem(key) || 0)
      localStorage.setItem(key, String(prev + 1))
      try { if (window.showConversations) window.showConversations() } catch (e) {}
    } catch (e) { console.warn('error incrementing unread for other conv', e) }
  }
})

function addMessage(pseudoMsg, text) {
  const div = document.createElement("div")
  div.classList.add("message")
  if (pseudoMsg === pseudo) div.classList.add("me")
  div.textContent = `${text}`
  messages.appendChild(div)
  messages.scrollTop = messages.scrollHeight
}

function persistMessage(convId, msg) {
  try {
    const key = `chat_history_${convId}`
    const arr = JSON.parse(localStorage.getItem(key)) || []
    arr.push(msg)
    // limit to last 1000 messages to avoid unbounded storage
    if (arr.length > 1000) arr.splice(0, arr.length - 1000)
    localStorage.setItem(key, JSON.stringify(arr))
  } catch (e) { console.warn('persistMessage error', e) }
}
