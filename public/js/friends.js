// === friends.js - Modern Version avec Onglets ===// Socket global

const socket = window.socket

const socket = window.socket;

let currentUser = '';function apiFetch(path, options) {

  return fetch(path, options)

// State}

let friends = [];

let receivedRequests = [];async function chargerAmis() {

let sentRequests = [];  const currentUser = window.getCurrentUser()

  const res = await fetch(`/api/friends/${currentUser}`)

// Init  const amis = await res.json()

window.onload = () => {  const section = document.getElementById("friendsList")

  currentUser = window.getCurrentUser();  section.innerHTML = ""

  if (!currentUser) {

    window.location.href = 'login.html';  if (amis.length === 0) {

    return;    section.innerHTML = "<p class='empty-msg'>Aucun ami pour le moment</p>"

  }  } else {

    amis.forEach(a => {

  setupTabs();      const ami =

  setupSearch();        a.sender === currentUser ? a.receiver : a.sender

  loadAllData();      const div = document.createElement("div")

      div.classList.add("conv-item")

  // Socket real-time updates      div.innerHTML = `

  if (socket) {        👤 ${ami}

    socket.on('new friend request', (data) => {        <button class="delete" onclick="supprimerAmi('${currentUser}','${ami}')">🗑️ Supprimer</button>

      console.log('📨 Nouvelle demande reçue:', data);      `

      if (data.receiver.toLowerCase() === currentUser.toLowerCase()) {      section.appendChild(div)

        loadAllData();    })

        showToast(`Nouvelle demande de ${data.sender}`);  }

      }}

    });

  }function loadRequests() {

};  const currentUser = window.getCurrentUser()

  if (!currentUser) return

// Setup Tabs

function setupTabs() {  fetch(`/api/friend-requests/${currentUser}`)

  const tabs = document.querySelectorAll('.tab');    .then(res => res.json())

  tabs.forEach(tab => {    .then(data => {

    tab.addEventListener('click', () => {      const received = document.getElementById("requests")

      const tabName = tab.dataset.tab;      received.innerHTML = ""

      switchTab(tabName);      if (data.length === 0) {

    });        received.innerHTML = "<p class='empty-msg'>Aucune demande reçue</p>"

  });      } else {

}        data.forEach(req => {

          const div = document.createElement("div")

function switchTab(tabName) {          div.classList.add("request-item")

  // Update tab buttons          div.innerHTML = `

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));            <span><b>${req.sender}</b> vous a envoyé une demande</span>

  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');            <button class="accept" data-id="${req.id}">✅ Accepter</button>

            <button class="decline" data-id="${req.id}">❌ Refuser</button>

  // Update content          `

  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));          received.appendChild(div)

  document.getElementById(`${tabName}Content`).classList.add('active');        })

}      }

    })

// Setup Search}

function setupSearch() {

  const searchInput = document.getElementById('searchInput');// Real-time: when server notifies of a new friend request, refresh UI

  searchInput.addEventListener('input', (e) => {if (window.socket) {

    const query = e.target.value.toLowerCase();  window.socket.on('new friend request', data => {

    filterFriends(query);    const currentUser = window.getCurrentUser()

  });    if (!currentUser) return

}    try {

      if (String(data.receiver).toLowerCase() !== String(currentUser).toLowerCase()) return

function filterFriends(query) {    } catch (e) { return }

  const friendItems = document.querySelectorAll('.friend-item');    console.log('📨 Nouvelle demande d\'ami reçue via socket:', data)

  friendItems.forEach(item => {    loadRequests()

    const name = item.querySelector('.friend-name').textContent.toLowerCase();    loadSentRequests && loadSentRequests()

    item.style.display = name.includes(query) ? 'flex' : 'none';    // optionnel: afficher toast

  });    window.showToast && window.showToast(`Nouvelle demande de ${data.sender}`, { type: 'info' })

}  })

}

// Load All Data

async function loadAllData() {// Nouvelle fonction pour charger les demandes envoyées

  await Promise.all([async function accepterDemande(id) {

    loadFriends(),  const btn = document.querySelector(`.accept[data-id='${id}']`)

    loadReceivedRequests(),  if (btn) btn.disabled = true

    loadSentRequests()  try {

  ]);    const res = await fetch(`/api/friend-accept/${id}`, { method: "POST" })

  updateBadges();    if (res.ok) {

}      window.showToast('✅ Demande acceptée !', { type: 'success' })

      await chargerAmis()

// Load Friends      loadRequests()

async function loadFriends() {      loadSentRequests()

  try {    } else {

    const res = await fetch(`/api/friends/${currentUser}`);      let body = ''

    const data = await res.json();      try { body = await res.text() } catch {}

    friends = data;      window.showToast('❌ Erreur lors de l\'acceptation: ' + (body || res.status), { type: 'error' })

    }

    const section = document.getElementById('friendsList');  } catch (err) {

        console.error(err)

    if (data.length === 0) {    window.showToast('❌ Erreur réseau lors de l\'acceptation', { type: 'error' })

      section.innerHTML = `  } finally {

        <div class="empty-state">    if (btn) btn.disabled = false

          <span class="empty-icon">👥</span>  }

          <p class="empty-title">Aucun ami</p>}

          <p class="empty-subtitle">Ajoutez des amis pour commencer à discuter !</p>

        </div>async function refuserDemande(id) {

      `;  const btn = document.querySelector(`.decline[data-id='${id}']`)

      return;  if (btn) btn.disabled = true

    }  try {

    const res = await fetch(`/api/friend-decline/${id}`, { method: "POST" })

    section.innerHTML = data.map(f => {    if (res.ok) {

      const friendName = f.sender === currentUser ? f.receiver : f.sender;      window.showToast('❌ Demande refusée.', { type: 'info' })

      const initial = friendName[0].toUpperCase();      loadRequests()

            loadSentRequests()

      return `    } else {

        <div class="friend-item">      window.showToast('Erreur lors du refus ❌', { type: 'error' })

          <div class="friend-avatar">${initial}</div>    }

          <div class="friend-info">  } catch (err) {

            <div class="friend-name">${friendName}</div>    console.error(err)

            <div class="friend-status">    window.showToast('Erreur réseau lors du refus', { type: 'error' })

              <span class="status-dot"></span>  } finally {

              Hors ligne    if (btn) btn.disabled = false

            </div>  }

          </div>}

          <button class="message-button" onclick="startConversation('${friendName}')">

            💬async function supprimerAmi(user1, user2) {

          </button>  const res = await fetch("/api/delete-friend", {

        </div>    method: "POST",

      `;    headers: { "Content-Type": "application/json" },

    }).join('');    body: JSON.stringify({ user1, user2 })

  });

  } catch (error) {

    console.error('Error loading friends:', error);  if (res.ok) {

  }    alert("Ami supprimé 🗑️");

}

    // 🔹 Supprime aussi les conversations locales liées

// Load Received Requests    let convs = JSON.parse(localStorage.getItem("conversations")) || [];

async function loadReceivedRequests() {    convs = convs.filter(

  try {      c => !(c.users.includes(user1) && c.users.includes(user2))

    const res = await fetch(`/api/friend-requests/${currentUser}`);    );

    const data = await res.json();    localStorage.setItem("conversations", JSON.stringify(convs));

    

    // Filter only received (where currentUser is receiver)    // 🔹 Rafraîchit la liste d’amis

    receivedRequests = data.filter(r =>     chargerAmis();

      r.receiver.toLowerCase() === currentUser.toLowerCase() &&   } else {

      r.status === 'pending'    alert("Erreur lors de la suppression ❌");

    );  }

}

    const section = document.getElementById('requests');

    

    if (receivedRequests.length === 0) {function loadRequests() {

      section.innerHTML = `  const currentUser = window.getCurrentUser()

        <div class="empty-state">  if (!currentUser) return

          <span class="empty-icon">📬</span>

          <p class="empty-title">Aucune demande</p>  fetch(`/api/friend-requests/${currentUser}`)

          <p class="empty-subtitle">Vous n'avez pas de demandes d'ami en attente</p>    .then(res => res.json())

        </div>    .then(data => {

      `;      const received = document.getElementById("requests")

      return;      received.innerHTML = ""

    }      if (data.length === 0) {

        received.innerHTML = "<p class='empty-msg'>Aucune demande reçue</p>"

    section.innerHTML = receivedRequests.map(req => {      } else {

      const initial = req.sender[0].toUpperCase();        data.forEach(req => {

                const div = document.createElement("div")

      return `          div.classList.add("request-item")

        <div class="request-item">          div.innerHTML = `

          <div class="friend-avatar">${initial}</div>            <span><b>${req.sender}</b> vous a envoyé une demande</span>

          <div class="request-info">            <button class="accept" data-id="${req.id}">✅ Accepter</button>

            <div class="request-name">${req.sender}</div>            <button class="decline" data-id="${req.id}">❌ Refuser</button>

            <div class="request-label">vous a envoyé une demande</div>          `

          </div>          received.appendChild(div)

          <div class="request-actions">        })

            <button class="accept" onclick="acceptRequest(${req.id}, '${req.sender}')">

              ✅        // ✅ Ajout essentiel : relier les boutons aux fonctions

            </button>        document.querySelectorAll(".accept").forEach(btn => {

            <button class="decline" onclick="declineRequest(${req.id})">          btn.onclick = () => accepterDemande(btn.dataset.id)

              ❌        })

            </button>        document.querySelectorAll(".decline").forEach(btn => {

          </div>          btn.onclick = () => refuserDemande(btn.dataset.id)

        </div>        })

      `;      }

    }).join('');    })

}

  } catch (error) {

    console.error('Error loading received requests:', error);// Envoi d’une nouvelle demande

  }document.getElementById("addFriendForm").addEventListener("submit", async e => {

}  e.preventDefault()

  const sender = localStorage.getItem("currentUser")

// Load Sent Requests  const receiver = document.getElementById("friendPseudo").value.trim()

async function loadSentRequests() {

  try {  if (!receiver || receiver === sender) return alert("Pseudo invalide ⚠️")

    const res = await fetch(`/api/friend-requests/${currentUser}`);

    const data = await res.json();  const res = await fetch("/api/send-friend-request", {

        method: "POST",

    // Filter only sent (where currentUser is sender)    headers: { "Content-Type": "application/json" },

    sentRequests = data.filter(r =>     body: JSON.stringify({ sender, receiver })

      r.sender.toLowerCase() === currentUser.toLowerCase() &&   })

      r.status === 'pending'

    );  const msg = document.getElementById("friendMessage")

  msg.style.display = "block"

    const section = document.getElementById('sentRequests');

      if (res.ok) {

    if (sentRequests.length === 0) {    msg.textContent = `✅ Demande envoyée à ${receiver}`

      section.innerHTML = `    msg.className = "friend-message success"

        <div class="empty-state">  } else {

          <span class="empty-icon">📤</span>    msg.textContent = "❌ Erreur lors de l’envoi"

          <p class="empty-title">Aucune demande envoyée</p>    msg.className = "friend-message error"

          <p class="empty-subtitle">Vos demandes d'ami en attente apparaîtront ici</p>  }

        </div>

      `;  document.getElementById("friendPseudo").value = ""

      return;  chargerDemandes()

    }})



    section.innerHTML = sentRequests.map(req => {// Au chargement

      const initial = req.receiver[0].toUpperCase();window.onload = () => {

        chargerAmis()

      return `  loadRequests()

        <div class="request-item">  loadSentRequests(); // 👈 nouvelle fonction

          <div class="friend-avatar">${initial}</div>}

          <div class="request-info">
            <div class="request-name">${req.receiver}</div>
            <div class="request-label">En attente de réponse...</div>
          </div>
          <button class="cancel-button" onclick="cancelRequest(${req.id})">
            ❌
          </button>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading sent requests:', error);
  }
}

// Update Badges
function updateBadges() {
  document.getElementById('friendsBadge').textContent = friends.length;
  document.getElementById('receivedBadge').textContent = receivedRequests.length;
  document.getElementById('sentBadge').textContent = sentRequests.length;

  // Hide badges if 0
  ['friendsBadge', 'receivedBadge', 'sentBadge'].forEach(id => {
    const badge = document.getElementById(id);
    badge.style.display = badge.textContent === '0' ? 'none' : 'inline-block';
  });
}

// Accept Request
async function acceptRequest(id, senderName) {
  try {
    const res = await fetch(`/api/friend-accept/${id}`, { method: 'POST' });
    
    if (res.ok) {
      showToast(`✅ Vous êtes maintenant ami avec ${senderName}`);
      await loadAllData();
    } else {
      showToast('❌ Erreur lors de l\'acceptation', 'error');
    }
  } catch (error) {
    console.error('Error accepting request:', error);
    showToast('❌ Erreur réseau', 'error');
  }
}

// Decline Request
async function declineRequest(id) {
  try {
    const res = await fetch(`/api/friend-decline/${id}`, { method: 'POST' });
    
    if (res.ok) {
      showToast('Demande refusée');
      await loadAllData();
    } else {
      showToast('❌ Erreur lors du refus', 'error');
    }
  } catch (error) {
    console.error('Error declining request:', error);
    showToast('❌ Erreur réseau', 'error');
  }
}

// Cancel Request
async function cancelRequest(id) {
  if (!confirm('Annuler cette demande d\'ami ?')) return;
  
  try {
    const res = await fetch(`/api/friend-decline/${id}`, { method: 'POST' });
    
    if (res.ok) {
      showToast('Demande annulée');
      await loadAllData();
    } else {
      showToast('❌ Erreur lors de l\'annulation', 'error');
    }
  } catch (error) {
    console.error('Error canceling request:', error);
    showToast('❌ Erreur réseau', 'error');
  }
}

// Start Conversation
async function startConversation(friendName) {
  try {
    const res = await fetch(`/api/conversation-between/${currentUser}/${friendName}`, {
      method: 'POST'
    });
    
    if (res.ok) {
      const data = await res.json();
      window.location.href = `chat.html?conv=${data.id}&user=${friendName}`;
    } else {
      showToast('❌ Erreur lors de la création de la conversation', 'error');
    }
  } catch (error) {
    console.error('Error starting conversation:', error);
    showToast('❌ Erreur réseau', 'error');
  }
}

// Modal Functions
function showAddFriendModal() {
  document.getElementById('addFriendModal').classList.add('show');
}

function closeAddFriendModal() {
  document.getElementById('addFriendModal').classList.remove('show');
  document.getElementById('friendPseudo').value = '';
  document.getElementById('friendMessage').textContent = '';
  document.getElementById('friendMessage').className = 'friend-message';
}

// Add Friend Form
document.getElementById('addFriendForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const receiver = document.getElementById('friendPseudo').value.trim();
  const messageEl = document.getElementById('friendMessage');
  
  if (!receiver) {
    messageEl.textContent = '⚠️ Entrez un pseudo';
    messageEl.className = 'friend-message error';
    return;
  }
  
  if (receiver.toLowerCase() === currentUser.toLowerCase()) {
    messageEl.textContent = '⚠️ Vous ne pouvez pas vous ajouter vous-même';
    messageEl.className = 'friend-message error';
    return;
  }
  
  try {
    const res = await fetch('/api/send-friend-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: currentUser, receiver })
    });
    
    if (res.ok) {
      messageEl.textContent = `✅ Demande envoyée à ${receiver}`;
      messageEl.className = 'friend-message success';
      
      setTimeout(() => {
        closeAddFriendModal();
        loadAllData();
      }, 1500);
    } else {
      const error = await res.text();
      messageEl.textContent = `❌ ${error}`;
      messageEl.className = 'friend-message error';
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    messageEl.textContent = '❌ Erreur réseau';
    messageEl.className = 'friend-message error';
  }
});

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'notif-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4500);
}

// Close modal on outside click
document.getElementById('addFriendModal').addEventListener('click', (e) => {
  if (e.target.id === 'addFriendModal') {
    closeAddFriendModal();
  }
});
