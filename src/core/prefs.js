// Visitor preferences shared by the settings overlay: theme (look), light/dark mode and whether the
// overlay is open. Theme data lives in src/themes; fonts in src/themes/fonts.js.
import { reactive, ref, watch } from 'vue'
import { LOOKS, LOOK_WEIGHTS, findLook } from '../themes'
import { loadLookFonts } from '../themes/fonts'
import { applyCursor } from './cursors'

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

// Randomize odds: LOOK_WEIGHTS in themes/index.js (they add up to 100, so each is that theme's % chance,
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
  loadLookFonts(look)
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
