const io = require('socket.io-client');

const server = 'http://localhost:3000'
const socket = io(server, { reconnectionDelayMax: 10000 })

const conversationId = process.argv[2] || '1760245960860' // pass as arg
const sender = process.argv[3] || 'Lychie'
const text = process.argv[4] || 'Hello from sim at ' + new Date().toISOString()

socket.on('connect', () => {
  console.log('connected', socket.id)
  socket.emit('register', sender)
  // emit chat message after a short delay
  setTimeout(() => {
    socket.emit('chat message', { conversation_id: conversationId, pseudo: sender, text })
    console.log('sent chat message', conversationId, sender, text)
    setTimeout(() => process.exit(0), 500)
  }, 400)
})

socket.on('connect_error', e => { console.error('conn err', e); process.exit(1) })
