// Saved chat history: IndexedDB first (bigger, async), localStorage as the fallback (private mode, old Safari,
// blocked storage). Stored per browser only; nothing is sent anywhere.
const DB = 'portfolio-chat'
const STORE = 'kv'
const KEY = 'history'
const LS_KEY = 'chat.history'

let dbPromise = null
function db() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'))
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('blocked'))
  })
  dbPromise.catch(() => { dbPromise = null })
  return dbPromise
}

function tx(mode, fn) {
  return db().then((d) => new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode)
    const req = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(req?.result)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  }))
}

// Dates go in as ISO strings (both stores), and come back as Date
const pack = (messages) => messages.map(({ id, role, text, at, stopped }) => ({
  id, role, text, at: at instanceof Date ? at.toISOString() : at, ...(stopped ? { stopped: true } : {}),
}))
const unpack = (list) => (Array.isArray(list) ? list : [])
  .filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string' && Number.isFinite(m.id))
  .map((m) => ({ ...m, at: new Date(m.at || Date.now()) }))

const lsGet = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) } catch { return null } }
const lsSet = (v) => { try { localStorage.setItem(LS_KEY, JSON.stringify(v)) } catch { /* full / blocked */ } }
const lsDel = () => { try { localStorage.removeItem(LS_KEY) } catch { /* blocked */ } }

export async function loadHistory() {
  try {
    const v = await tx('readonly', (s) => s.get(KEY))
    if (v) return unpack(v)
  } catch { /* fall through */ }
  return unpack(lsGet())
}

export async function saveHistory(messages) {
  const data = pack(messages)
  try {
    await tx('readwrite', (s) => s.put(data, KEY))
    lsDel() // IndexedDB worked: don't keep a stale copy around
  } catch {
    lsSet(data)
  }
}

export async function clearHistory() {
  lsDel()
  try { await tx('readwrite', (s) => s.delete(KEY)) } catch { /* nothing stored */ }
}

/* ---------- Past conversations ("New chat" files the current one here) ---------- */
// [{ id, title, at, messages }] newest first; same stores, their own key
const ARCHIVE_KEY = 'archive'
const ARCHIVE_LS = 'chat.archive'

const packArchive = (sessions) => sessions.map((s) => ({
  id: s.id, title: s.title, at: s.at instanceof Date ? s.at.toISOString() : s.at, messages: pack(s.messages),
}))
const unpackArchive = (list) => (Array.isArray(list) ? list : [])
  .filter((s) => s && s.id != null && Array.isArray(s.messages))
  .map((s) => ({ id: s.id, title: String(s.title || ''), at: new Date(s.at || Date.now()), messages: unpack(s.messages) }))
  .filter((s) => s.messages.length)

export async function loadArchive() {
  try {
    const v = await tx('readonly', (s) => s.get(ARCHIVE_KEY))
    if (v) return unpackArchive(v)
  } catch { /* fall through */ }
  try { return unpackArchive(JSON.parse(localStorage.getItem(ARCHIVE_LS))) } catch { return [] }
}

export async function saveArchive(sessions) {
  const data = packArchive(sessions)
  try {
    await tx('readwrite', (s) => s.put(data, ARCHIVE_KEY))
    try { localStorage.removeItem(ARCHIVE_LS) } catch { /* blocked */ }
  } catch {
    try { localStorage.setItem(ARCHIVE_LS, JSON.stringify(data)) } catch { /* full / blocked */ }
  }
}
