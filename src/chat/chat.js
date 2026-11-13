// AI chat state + client. The UI (src/components/ChatBot.vue) renders this; answers stream in from
// /api/chat (Gemini, see api/chat.js) or, with VITE_CHAT_MOCK=true, from canned demo answers.
// The conversation is kept in IndexedDB (localStorage if that's unavailable), so it survives reloads.
import { reactive, watch } from 'vue'
import { mockStream } from './mock'
import { loadHistory, saveHistory, clearHistory, loadArchive, saveArchive } from './history'

export const MODES = ['floating', 'overlay', 'dock']
export const USE_MOCK = import.meta.env.VITE_CHAT_MOCK === 'true'
// older messages beyond this are dropped from storage (the API only ever sees the last few anyway)
export const MAX_STORED = 200
// past conversations kept in the history list
export const MAX_SESSIONS = 30

const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb } catch { return fb } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage blocked */ } }

export const DOCK_MIN = 360
export const DOCK_MAX = 900
export const FLOAT_MIN = { w: 320, h: 360 }

export const chat = reactive({
  open: false,
  mode: MODES.includes(read('chat.viewMode')) ? read('chat.viewMode') : 'floating',
  view: 'floating', // the layout in use right now (phones / narrow windows fall back to the overlay)
  dockWidth: Math.min(DOCK_MAX, Math.max(DOCK_MIN, Number(read('chat.dockWidth', 480)) || 480)),
  float: read('chat.float', null), // { left, top, width, height }
  messages: [], // { id, role: 'user' | 'bot', text, at, streaming?, stopped? }
  archive: [], // past conversations, newest first: { id, title, at, messages }
  showHistory: false, // the chat area shows the history list instead of the conversation
  typing: false,
  status: '',
})

watch(() => chat.mode, (m) => save('chat.viewMode', m))
watch(() => chat.dockWidth, (w) => save('chat.dockWidth', w))
watch(() => chat.float, (f) => save('chat.float', f), { deep: true })

let controller = null
let seq = 0

/* ---------- history ---------- */
export const ready = Promise.all([
  loadHistory().then((saved) => {
    if (!saved?.length || chat.messages.length) return
    chat.messages.push(...saved)
    seq = Math.max(seq, ...saved.map((m) => m.id))
  }),
  loadArchive().then((list) => { if (list?.length && !chat.archive.length) chat.archive.push(...list) }),
]).catch(() => {})

const persistArchive = () => saveArchive(chat.archive).catch(() => {})

/** File the current conversation into the history list (if it has anything in it). */
function archiveCurrent() {
  const done = chat.messages.filter((m) => !m.streaming && m.text).map((m) => ({ ...m }))
  if (!done.length) return
  const first = done.find((m) => m.role === 'user')?.text || done[0].text
  chat.archive.unshift({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    title: first.replace(/\s+/g, ' ').trim().slice(0, 80),
    at: done[done.length - 1].at,
    messages: done,
  })
  if (chat.archive.length > MAX_SESSIONS) chat.archive.splice(MAX_SESSIONS)
}

let saveTimer = 0
function persist() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    // never store a half-streamed answer
    const done = chat.messages.filter((m) => !m.streaming && m.text)
    saveHistory(done.slice(-MAX_STORED)).catch(() => {})
  }, 150)
}

/** Parse the SSE stream from /api/chat into { type, ...data } events. */
async function* apiStream(message, history, locale, signal) {
  const r = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, locale }),
    signal,
  })
  if (!r.ok || !r.body) {
    let msg = ''
    try { msg = (await r.json()).error } catch { /* not json */ }
    yield { type: 'error', message: msg || `Request failed (${r.status})` }
    return
  }
  const reader = r.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let i
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const block = buf.slice(0, i)
      buf = buf.slice(i + 2)
      const event = /^event: (.*)$/m.exec(block)?.[1]
      const data = /^data: (.*)$/m.exec(block)?.[1]
      if (!event) continue
      let payload = {}
      try { payload = data ? JSON.parse(data) : {} } catch { /* ignore */ }
      yield { type: event, ...payload }
    }
  }
}

/** Send a visitor message and stream the answer into a new bot bubble. */
export async function send(text, { locale = 'en', errorText = 'Something went wrong.' } = {}) {
  const message = String(text || '').trim()
  if (!message || chat.typing) return
  const history = chat.messages.filter((m) => m.text && !m.streaming).map(({ role, text: t }) => ({ role, text: t }))
  chat.messages.push({ id: ++seq, role: 'user', text: message, at: new Date() })
  chat.messages.push({ id: ++seq, role: 'bot', text: '', at: new Date(), streaming: true })
  const bot = chat.messages[chat.messages.length - 1]
  chat.typing = true
  chat.status = ''
  controller = new AbortController()
  try {
    const stream = USE_MOCK
      ? mockStream(message, locale, controller.signal)
      : apiStream(message, history, locale, controller.signal)
    for await (const ev of stream) {
      if (ev.type === 'status') chat.status = ev.text || ''
      else if (ev.type === 'delta') { bot.text += ev.text || ''; chat.status = '' }
      else if (ev.type === 'error') bot.text = ev.message || errorText
    }
  } catch (e) {
    if (e?.name !== 'AbortError' && !bot.text) bot.text = errorText
  } finally {
    bot.streaming = false
    chat.typing = false
    chat.status = ''
    controller = null
    if (chat.messages.length > MAX_STORED) chat.messages.splice(0, chat.messages.length - MAX_STORED)
    persist()
  }
}

/** Stop the answer that's streaming. */
export function stop() {
  if (!controller) return
  const bot = [...chat.messages].reverse().find((m) => m.role === 'bot' && m.streaming)
  if (bot) bot.stopped = true
  controller.abort()
}

/** New chat: the current conversation goes into the history list, and the chat starts empty. */
export function clearChat() {
  stop()
  archiveCurrent()
  chat.messages.splice(0)
  chat.showHistory = false
  clearTimeout(saveTimer)
  clearHistory().catch(() => {})
  persistArchive()
}

/** Reopen a past conversation (the one that was open goes into the history in its place). */
export function openSession(id) {
  const s = chat.archive.find((x) => x.id === id)
  if (!s) return
  stop()
  archiveCurrent()
  chat.archive.splice(chat.archive.indexOf(s), 1)
  chat.messages.splice(0, chat.messages.length, ...s.messages.map((m) => ({ ...m })))
  seq = Math.max(seq, ...s.messages.map((m) => m.id))
  chat.showHistory = false
  persist()
  persistArchive()
}

export function deleteSession(id) {
  const i = chat.archive.findIndex((x) => x.id === id)
  if (i < 0) return
  chat.archive.splice(i, 1)
  if (!chat.archive.length) chat.showHistory = false
  persistArchive()
}
