// Self-hosting server (VPS, home server, Docker ...): `npm run build`, then `npm start`.
// Does what Vercel does for this site, with no extra dependencies:
//   - /api/chat and /api/request-cv run the handlers in src/api/
//   - everything else is served from dist/ (hashed assets cached for a year, Range requests for audio / video)
//   - unknown paths fall back to index.html; the old resume URL redirects to /documents/
// Settings come from the environment, or from .env.local / .env next to this file (same keys as .env.example).
// Listens on HOST:PORT (default 127.0.0.1:3000); put Caddy or nginx in front of it for HTTPS.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
for (const f of ['.env.local', '.env']) {
  // loadEnvFile never overrides variables already set in the environment
  if (fs.existsSync(path.join(ROOT, f))) process.loadEnvFile(path.join(ROOT, f))
}

const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '127.0.0.1'

const API = {
  '/api/chat': () => import('./src/api/chat.js'),
  '/api/request-cv': () => import('./src/api/request-cv.js'),
}
const REDIRECTS = { '/ORY-CHANRAKSA-RESUME.pdf': '/documents/ORY-CHANRAKSA-RESUME.pdf' }

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg',
  '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
}

/** Resolve a URL path to a file inside dist/ (null if missing or outside it). */
function fileFor(urlPath) {
  let p
  try { p = decodeURIComponent(urlPath) } catch { return null }
  const file = path.join(DIST, path.normalize(p))
  if (!file.startsWith(DIST + path.sep) && file !== DIST) return null
  try {
    const st = fs.statSync(file)
    if (st.isFile()) return { file, st }
    if (st.isDirectory()) return fileFor(path.join(p, 'index.html'))
  } catch { /* not found */ }
  return null
}

function sendFile(req, res, { file, st }) {
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream'
  const hashed = file.startsWith(path.join(DIST, 'assets') + path.sep)
  res.setHeader('Content-Type', type)
  res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : file.endsWith('.html') ? 'no-cache' : 'public, max-age=3600')
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Last-Modified', st.mtime.toUTCString())
  if (req.headers['if-modified-since'] && new Date(req.headers['if-modified-since']) >= new Date(st.mtime.toUTCString())) {
    res.statusCode = 304
    return res.end()
  }
  // Range requests: Safari needs them to play audio / video, and they make seeking work
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '')
  let start = 0, end = st.size - 1
  if (range) {
    start = range[1] ? Number(range[1]) : Math.max(0, st.size - Number(range[2]))
    end = range[1] && range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1
    if (start > end || start >= st.size) {
      res.statusCode = 416
      res.setHeader('Content-Range', `bytes */${st.size}`)
      return res.end()
    }
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${st.size}`)
  }
  res.setHeader('Content-Length', end - start + 1)
  if (req.method === 'HEAD') return res.end()
  fs.createReadStream(file, { start, end }).pipe(res)
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  try {
    if (API[pathname]) {
      const { default: handler } = await API[pathname]()
      return await handler(req, res)
    }
    if (REDIRECTS[pathname]) {
      res.writeHead(308, { Location: REDIRECTS[pathname] })
      return res.end()
    }
    if (pathname.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end('{"error":"Not found"}')
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' })
      return res.end()
    }
    // real file, else the app shell (client-side routes / anchors)
    const found = fileFor(pathname) || (path.extname(pathname) ? null : fileFor('/index.html'))
    if (found) return sendFile(req, res, found)
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  } catch (err) {
    console.error(`[server] ${req.method} ${pathname}:`, err)
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end('{"error":"Server error"}')
  }
})

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/ is missing: run `npm run build` first.')
  process.exit(1)
}
server.listen(PORT, HOST, () => console.log(`Portfolio running at http://${HOST}:${PORT}`))
