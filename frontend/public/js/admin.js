document.addEventListener('DOMContentLoaded', () => {
  const btnMigrate = document.getElementById('btn-migrate')
  const btnClear = document.getElementById('btn-clear')
  const btnCheck = document.getElementById('btn-check')
  const tokenInput = document.getElementById('token')
  const logEl = document.getElementById('log')

  function log(msg) {
    const line = document.createElement('div')
    line.textContent = `${new Date().toISOString()} - ${msg}`
    logEl.prepend(line)
  }

  async function postJson(path) {
    const token = tokenInput.value || ''
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(`HTTP ${res.status} ${JSON.stringify(data)}`)
      log(`OK ${path} -> ${JSON.stringify(data)}`)
      return data
    } catch (err) {
      log(`ERR ${path} -> ${err.message}`)
      throw err
    }
  }

  btnMigrate.addEventListener('click', () => postJson('/api/debug/migrate/storage-engine'))
  btnClear.addEventListener('click', () => {
    if (!confirm('Confirmer: vider la table friends ?')) return
    postJson('/api/debug/clear-friends')
  })

  btnCheck.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      log(`Conversations: ${Array.isArray(data) ? data.length : JSON.stringify(data)}`)
    } catch (err) {
      log(`ERR check -> ${err.message}`)
    }
  })
})