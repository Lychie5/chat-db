// === js/login.js ===

// Connexion au serveur via Socket.IO
const socket = window.socket

const form = document.getElementById("loginForm")
const input = document.getElementById("pseudo")

form.addEventListener("submit", async e => {
  e.preventDefault()
  const pseudo = input.value.trim()
  if (!pseudo) return alert("Veuillez entrer un pseudo")

  // 🔹 Création / enregistrement de l'utilisateur côté serveur
  await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pseudo })
  })

  // 🔹 Enregistrer le pseudo sous une clé unique reconnue par tout le site
  localStorage.setItem("currentUser", pseudo)
  localStorage.setItem("pseudo", pseudo) // pour compatibilité avec anciens scripts

  // 🔹 Enregistrer le socket côté serveur pour recevoir les notifications
  try {
    if (window.socket && typeof window.socket.emit === 'function') {
      window.socket.emit('register', pseudo)
      console.log('🔎 Enregistrement socket envoyé pour', pseudo)
    }
  } catch (err) { console.warn('Erreur en émettant register socket:', err) }

  // 🔹 Redirection vers le profil
  window.location.href = "profile.html"
})
