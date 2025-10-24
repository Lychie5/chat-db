// === js/profile.js ===
const socket = window.socket

window.onload = () => {
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Afficher le pseudo dans la page
  document.getElementById("userPseudo").textContent = currentUser

  // Boutons navigation
  document.getElementById("friendsBtn").onclick = () => {
    window.location.href = "friends.html"
  }

  document.getElementById("convBtn").onclick = () => {
    window.location.href = "index.html"
  }

  // Bouton déconnexion
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "login.html"
  }
}
