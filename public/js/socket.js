// public/js/socket.js
if (!window.socket) {
  // Use current origin by default (works for localhost and deployed origins)
  const origin = window.location.origin || 'http://localhost:3000'
  const forced = null // set to a fixed origin string if you want to force remote
  const connectTo = forced || origin
  window.socket = io(connectTo, {
    transports: ["websocket"],
    secure: connectTo.startsWith('https'),
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
  });

  window.socket.on("connect", () => {
    console.log("✅ Connecté au serveur :", window.socket.id);
    try {
      const current = localStorage.getItem('currentUser')
      if (current) {
        window.socket.emit('register', current)
        console.log('🔎 Socket registered as', current)
      }
    } catch (err) { console.warn('Erreur register socket on connect', err) }
  });
  window.socket.on("disconnect", (r) => {
    console.warn("❌ Déconnecté :", r);
  });
  window.socket.on("connect_error", (e) => {
    console.error("⚠️ Erreur Socket.io :", e.message);
  });
}
// Provide a lightweight global helper used across pages
if (!window.getCurrentUser) {
  window.getCurrentUser = () => {
    return localStorage.getItem('currentUser') || localStorage.getItem('pseudo') || null
  }
}

// Minimal toast fallback so pages can call showToast safely
if (!window.showToast) {
  window.showToast = (text, opts) => {
    try {
      const n = document.createElement('div')
      n.className = 'notif-toast'
      n.textContent = text
      document.body.appendChild(n)
      setTimeout(() => n.remove(), (opts && opts.timeout) || 3000)
    } catch (e) { console.log('Toast:', text) }
  }
}
// === Notification de nouvelle demande ===
socket.on("new conversation request", data => {
  try {
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) return
    if (data.receiver !== currentUser) return
    console.log("📩 Nouvelle demande reçue :", data)

    const notif = document.createElement("div")
    notif.classList.add("notif-toast")
    notif.innerHTML = `
      💬 <b>${data.sender}</b> veut discuter avec toi !
      <blockquote>${data.preview || ''}</blockquote>
    `
    document.body.appendChild(notif)
    setTimeout(() => notif.remove(), 5000)
  } catch (err) { console.warn('Erreur handling new conversation request', err) }
})

// Notification for friend request (from REST endpoint)
socket.on('new friend request', data => {
  try {
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) return
    if (String(data.receiver).toLowerCase() !== String(currentUser).toLowerCase()) return
    console.log('📨 Nouvelle demande d\'ami reçue (socket):', data)
    const notif = document.createElement('div')
    notif.classList.add('notif-toast')
    notif.textContent = `${data.sender} vous a envoyé une demande d'ami.`
    document.body.appendChild(notif)
    setTimeout(() => notif.remove(), 5000)
    // refresh UI
    window.loadRequests && window.loadRequests()
  } catch (err) { console.warn('Erreur handling new friend request', err) }
})

// Server can push a full sync of pending friend requests for this user after register
socket.on('sync friend requests', data => {
  try {
    console.log('🔁 Received sync friend requests', data)
    // refresh UI
    window.loadRequests && window.loadRequests()
    if (data && data.length) {
      window.showToast && window.showToast(`Vous avez ${data.length} demande(s) en attente`, { type: 'info' })
    }
  } catch (err) { console.warn('Erreur handling sync friend requests', err) }
})

