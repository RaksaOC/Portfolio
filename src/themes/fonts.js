// Theme fonts. Each theme names its Latin fonts as a Google Fonts query (`fonts`) and its Khmer pairing
// (`kmFonts`: `display` for headings, `body` for paragraphs). Latin text keeps the theme's own Latin font.
import { LOOKS } from '.'

// Google Fonts query part for each Khmer family a theme may pair with
const KHMER_GOOGLE = {
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

/** Point the <link id=…> stylesheet at `href` (created on first use, removed when href is null). */
function setStylesheet(id, href) {
  let link = document.getElementById(id)
  if (!href) { link?.remove(); return link }
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.getAttribute('href') !== href) link.setAttribute('href', href)
  return link
}

/** Load the theme's Latin fonts (one shared <link>). */
export function loadLookFonts(look) {
  setStylesheet('look-fonts', look.fonts ? `https://fonts.googleapis.com/css2?${look.fonts}&display=swap` : null)
}

/** Load a set of Khmer Google font families (one <link> per id so it can be swapped). */
export function loadFonts(families, id = 'km-fonts') {
  const list = [...new Set(families)].filter((f) => KHMER_GOOGLE[f])
  setStylesheet(id, list.length
    ? `https://fonts.googleapis.com/css2?${list.map((f) => `family=${KHMER_GOOGLE[f]}`).join('&')}&display=swap`
    : null)
}

/** Every theme's Khmer heading face (for the Settings grid and the intro reel). */
export const loadKhmerDisplayFonts = (id) => loadFonts(LOOKS.map((l) => l.kmFonts.display), id)

/** A theme's heading (display) font from its Google Fonts query: the small-caps cut if it has one,
 *  else the first family. `spec` is the query part for that family (valid weights included). */
export function displayFont(look) {
  const fams = [...(look?.fonts || '').matchAll(/family=([^&]+)/g)].map((m) => ({
    spec: m[1],
    name: m[1].split(':')[0].replace(/\+/g, ' '),
  }))
  return fams.find((f) => / SC$/.test(f.name)) || fams[0] || null
}

/** CSS font-family for showing text in a theme's heading font (null = the site default). */
export function displayFontCss(look) {
  const f = displayFont(look)
  return f ? `"${f.name}", var(--poppins)` : null
}

/** Load every theme's heading font in one Google Fonts request, trimmed (`text=`) to the given
 *  characters so it stays tiny. Reuses the <link> with the same id. */
export function loadDisplayFonts(text, id) {
  const specs = new Map()
  LOOKS.forEach((l) => { const f = displayFont(l); if (f) specs.set(f.name, f.spec) })
  const chars = [...new Set(text)].join('')
  return setStylesheet(id, `https://fonts.googleapis.com/css2?${[...specs.values()].map((sp) => `family=${sp}`).join('&')}&text=${encodeURIComponent(chars)}&display=swap`)
}

/** Font for a theme's name in the current language: its Latin heading face, or in Khmer its Khmer display face. */
export function nameFontCss(look, locale) {
  if (locale === 'km') return `"${(look?.kmFonts || LOOKS[0].kmFonts).display}", var(--km-body), sans-serif`
  return displayFontCss(look)
}

/** Apply the theme's Khmer pairing as CSS variables (used by --poppins and the heading rule). */
export function applyKmFont(look) {
  const f = look.kmFonts
  const root = document.documentElement.style
  root.setProperty('--km-body', `"${f.body}"`)
  root.setProperty('--km-display', `"${f.display}"`)
  loadFonts([f.body, f.display])
}
