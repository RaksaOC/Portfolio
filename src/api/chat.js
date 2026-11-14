// Vercel serverless function: POST /api/chat   { message, history?, locale? }
// Streams a Gemini answer back as Server-Sent Events, in the shape the chat UI (src/chat/chat.js) reads:
//   event: start   data: {}
//   event: delta   data: { "text": "..." }      (repeated)
//   event: error   data: { "message": "..." }
//   event: end     data: {}
//
// Environment variables (Vercel → Project → Settings → Environment Variables, and .env.local for `npm run dev`):
//   GEMINI_API_KEY    required. Google AI Studio key (https://aistudio.google.com/apikey)
//   GEMINI_MODEL      optional. One model, or several comma-separated to try in order. Default: MODELS below.
//   CHAT_ALLOWED_ORIGINS  optional, comma-separated origins allowed to call this (e.g. https://chanraksa.com).
//                     Empty = no origin check.
//
// The browser never sees the key: it only talks to this function.

import { systemPrompt, retrieve, GUARD } from './context.js'

// Tried in order: when one is retired (404), overloaded (429 / 5xx) or doesn't start answering in time, the
// next one takes the question. Lite first: answers come from the docs, so it's quick and plenty smart.
const MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash']
const models = () => (process.env.GEMINI_MODEL || '').split(',').map((s) => s.trim()).filter(Boolean).concat(MODELS)
  .filter((m, i, all) => all.indexOf(m) === i)
const START_TIMEOUT_MS = 15000 // per model, until Gemini starts the response
const RETRY = new Set([404, 408, 429, 500, 502, 503, 504])
const MAX_MESSAGE = 2000
// Only the last few turns go to the model (the docs carry the facts, so long history isn't needed)
const MAX_HISTORY = 8
const MAX_USER_TEXT = 1200
const MAX_BOT_TEXT = 900

// Best-effort throttle per IP (serverless instances are short-lived, so this only stops bursts).
const hits = new Map()
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 25
function limited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_HITS
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

const sse = (res, event, data = {}) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  const allowed = (process.env.CHAT_ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.length && !allowed.includes(req.headers.origin)) return json(res, 403, { error: 'Forbidden' })

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
  if (limited(ip)) return json(res, 429, { error: 'Too many messages, please wait a few minutes.' })

  let body
  try { body = await readBody(req) } catch { return json(res, 400, { error: 'Bad request' }) }
  const message = String(body.message || '').trim().slice(0, MAX_MESSAGE)
  if (!message) return json(res, 400, { error: 'Empty message' })
  const locale = body.locale === 'km' ? 'km' : 'en'
  const turns = (Array.isArray(body.history) ? body.history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_HISTORY)
  // Gemini wants the conversation to start with a user turn
  while (turns.length && turns[0].role !== 'user') turns.shift()
  const history = turns.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text.slice(0, m.role === 'user' ? MAX_USER_TEXT : MAX_BOT_TEXT) }],
  }))
  // pick the docs for this question (recent turns help follow-ups like "tell me more about that one")
  const recent = turns.slice(-4).map((m) => m.text.slice(0, 300)).join(' ')
  const docs = retrieve(message, recent)

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  sse(res, 'start')

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    sse(res, 'error', { message: 'The assistant is not configured yet.' })
    sse(res, 'end')
    return res.end()
  }

  // stop calling Gemini if the visitor closes the chat / presses Stop
  const upstream = new AbortController()
  req.on('close', () => upstream.abort())

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt({ locale, docs }) }] },
    contents: [...history, { role: 'user', parts: [{ text: `${message}\n\n${GUARD}` }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
  })

  // first model that starts a response wins
  const open = async () => {
    for (const model of models()) {
      if (upstream.signal.aborted) return null
      const slow = new AbortController()
      const timer = setTimeout(() => slow.abort(), START_TIMEOUT_MS)
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
          {
            method: 'POST',
            signal: AbortSignal.any([upstream.signal, slow.signal]),
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: payload,
          },
        )
        if (r.ok && r.body) return r
        console.error('gemini error', model, r.status, (await r.text().catch(() => '')).slice(0, 500))
        if (!RETRY.has(r.status)) return null // bad key / request: another model won't help
      } catch (e) {
        if (upstream.signal.aborted) throw e
        console.error('gemini error', model, slow.signal.aborted ? 'timed out' : e.message)
      } finally {
        clearTimeout(timer)
      }
    }
    return null
  }

  try {
    const r = await open()
    if (!r) {
      if (!upstream.signal.aborted) sse(res, 'error', { message: 'The assistant is unavailable right now. Please try again later.' })
    } else {
      const reader = r.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        let i
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).trim()
          buf = buf.slice(i + 1)
          if (!line.startsWith('data:')) continue
          try {
            const chunk = JSON.parse(line.slice(5))
            const text = (chunk.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
            if (text) sse(res, 'delta', { text })
          } catch { /* partial / keep-alive line */ }
        }
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('chat failed', e)
      sse(res, 'error', { message: 'Something went wrong. Please try again.' })
    }
  }
  sse(res, 'end')
  res.end()
}
