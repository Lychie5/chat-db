// === js/profile.js ===
const socket = window.socket;

window.onload = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // Afficher le nom d'utilisateur et l'avatar
  document.getElementById("userName").textContent = currentUser;
  const avatarLetter = currentUser[0].toUpperCase();
  document.getElementById("avatarLetter").textContent = avatarLetter;

  // Bouton déconnexion
  document.getElementById("logoutBtn").onclick = () => {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    }
  };
};
