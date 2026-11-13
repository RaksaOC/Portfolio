// Visitor preferences shared by the settings overlay: theme (look), light/dark mode, the Khmer font
// for the active theme, and whether the overlay is open.
import { reactive, ref, watch } from 'vue'
import { LOOKS, LOOK_WEIGHTS, findLook } from './themes/looks'
import { applyCursor } from './cursors'

// Khmer font pairing per theme (look): `display` for headings, `body` for paragraphs.
// Latin text keeps each look's own Latin font.
export const KM_FONTS = {
  '': { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  nature: { display: 'Freehand', body: 'Hanuman' }, // Freehand: slanted, italic-like Khmer
  cyberpunk: { display: 'Koulen', body: 'Kantumruy Pro' },
  futuristic: { display: 'Kdam Thmor Pro', body: 'Nokora' },
  retro: { display: 'Bokor', body: 'Battambang' },
  // ported study-hub themes
  'reading-room': { display: 'Noto Serif Khmer', body: 'Hanuman' },
  'gallery': { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  'open-house': { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  'machined': { display: 'Kantumruy Pro', body: 'Nokora' },
  'deep-lab': { display: 'Kdam Thmor Pro', body: 'Kantumruy Pro' },
  'neon-poster': { display: 'Koulen', body: 'Kantumruy Pro' },
  'orbit': { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  'night-session': { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  'frosted': { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  'clay': { display: 'Siemreap', body: 'Siemreap' },
  'pop-block': { display: 'Koulen', body: 'Kantumruy Pro' },
  'neon-terminal': { display: 'Kdam Thmor Pro', body: 'Nokora' },
  'brass-works': { display: 'Bokor', body: 'Battambang' },
  'greek': { display: 'Noto Serif Khmer', body: 'Hanuman' },
  'angkor': { display: 'Angkor', body: 'Battambang' },
  'deep-ocean': { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  'volcano': { display: 'Koulen', body: 'Kantumruy Pro' },
  'atomic': { display: 'Kdam Thmor Pro', body: 'Kantumruy Pro' },
  'japan': { display: 'Noto Serif Khmer', body: 'Hanuman' }, // brush-like serif, close to a mincho
  'desert': { display: 'Bokor', body: 'Battambang' },
}

const GOOGLE = {
  'Kantumruy Pro': 'Kantumruy+Pro:wght@300;400;500;600;700',
  Freehand: 'Freehand',
  Hanuman: 'Hanuman:wght@300;400;700',
  Koulen: 'Koulen',
  'Kdam Thmor Pro': 'Kdam+Thmor+Pro',
  Nokora: 'Nokora:wght@300;400;700',
  Bokor: 'Bokor',
  Battambang: 'Battambang:wght@300;400;700',
  'Noto Serif Khmer': 'Noto+Serif+Khmer:wght@400;600;700',
  Siemreap: 'Siemreap',
  Angkor: 'Angkor',
}

// navCompact: desktop navbar is shrunk to the logo pill (other sticky bits can use the freed space)
// navShown: the navbar has slid in (past the welcome screen); the music button waits for it
export const ui = reactive({ settingsOpen: false, navCompact: false, navShown: false, navDrip: false })

/* ---------- Theme (look) ---------- */

// "Randomize on reload" (settings): on = a random theme on every load (weighted, see LOOK_WEIGHTS; never
// the same one twice in a row) with the reel intro; off = keep the theme the visitor last chose, no intro.
// A first-time visitor always lands on Angkor.
const readRandom = () => { try { return localStorage.getItem('randomLook') !== 'off' } catch { return true } }
export const randomLook = ref(readRandom())
export function setRandomLook(on) {
  randomLook.value = !!on
  try { localStorage.setItem('randomLook', on ? 'on' : 'off') } catch { /* storage blocked */ }
}

// `?look=retro` (or nature / cyberpunk / futuristic / mono) forces one, e.g. for sharing a link.
let forcedLook = false
function initialLook() {
  try {
    const forced = new URLSearchParams(location.search).get('look')
    if (forced !== null) { forcedLook = true; return findLook(forced === 'mono' ? '' : forced).id }
  } catch { /* no URL access */ }
  let last = null
  try { last = localStorage.getItem('look') } catch { /* storage blocked */ }
  if (last === null) return FIRST_LOOK // first visit ever
  if (!randomLook.value) return findLook(last).id
  return pickWeighted(last)
}

// Randomize odds: LOOK_WEIGHTS in themes/looks.js (they add up to 100, so each is that theme's % chance,
// before the "never the same twice in a row" rule removes the previous theme and the rest scale up).
export const FIRST_LOOK = 'angkor'

function pickWeighted(exclude) {
  const pool = LOOKS.map((l) => l.id).filter((id) => id !== exclude)
  const total = pool.reduce((t, id) => t + LOOK_WEIGHTS[id], 0)
  let r = Math.random() * total
  for (const id of pool) {
    r -= LOOK_WEIGHTS[id]
    if (r < 0) return id
  }
  return pool[pool.length - 1] ?? ''
}

// The intro on the welcome screen (ThemeIntro.vue) starts the page in Monochrome, spins a reel and
// lands on `intro.target`, then sweeps that theme in. Reduced-motion visitors get the theme straight away.
const reduceMotion = (() => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
})()
const target = initialLook()
const playIntro = !reduceMotion && (randomLook.value || forcedLook)
// preview: id of the theme currently under the reel's payline (the 3D background tints to it)
export const intro = reactive({ target, running: playIntro, preview: null })
export const prefs = reactive({ look: playIntro ? '' : target })

/** Set data-look on <html> and load that look's Latin font. */
export function applyLook(id) {
  const look = findLook(id)
  const root = document.documentElement
  if (look.id) root.setAttribute('data-look', look.id)
  else root.removeAttribute('data-look')
  applyCursor()

  let link = document.getElementById('look-fonts')
  if (!look.fonts) { link?.remove(); return }
  const href = `https://fonts.googleapis.com/css2?${look.fonts}&display=swap`
  if (!link) {
    link = document.createElement('link')
    link.id = 'look-fonts'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.getAttribute('href') !== href) link.setAttribute('href', href)
}

// Remember the last theme only so the next load can pick a different one
const remember = (id) => { try { localStorage.setItem('look', id) } catch { /* storage blocked */ } }
applyLook(prefs.look)
remember(target)
watch(() => prefs.look, (id) => {
  applyLook(id)
  if (!intro.running) remember(id)
})

/* ---------- Light / dark mode ---------- */

function initialTheme() {
  try { return localStorage.getItem('theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
}

export const theme = ref(initialTheme())
// the reload intro runs in dark mode (night sky); ThemeIntro.vue restores the visitor's mode with the reveal
document.documentElement.setAttribute('data-theme', playIntro ? 'dark' : theme.value)
applyCursor()

export function setTheme(mode) {
  theme.value = mode === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  applyCursor()
  try { localStorage.setItem('theme', theme.value) } catch { /* storage blocked */ }
}

/* ---------- Khmer fonts ---------- */

/** Load a set of Google font families (one <link> per id so it can be swapped). */
export function loadFonts(families, id = 'km-fonts') {
  const list = [...new Set(families)].filter((f) => GOOGLE[f])
  let link = document.getElementById(id)
  if (!list.length) { link?.remove(); return }
  const href = `https://fonts.googleapis.com/css2?${list.map((f) => `family=${GOOGLE[f]}`).join('&')}&display=swap`
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.getAttribute('href') !== href) link.setAttribute('href', href)
}

/** Apply the active theme's Khmer pairing as CSS variables (used by --poppins and the heading rule). */
export function applyKmFont(lookId) {
  const f = KM_FONTS[lookId || ''] || KM_FONTS['']
  const root = document.documentElement.style
  root.setProperty('--km-body', `"${f.body}"`)
  root.setProperty('--km-display', `"${f.display}"`)
  loadFonts([f.body, f.display])
}
