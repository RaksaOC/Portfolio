// Themed mouse cursors. Each theme can ship a cursor.js ({ arrow, pointer }, see themes/shared/cursor-kit.js);
// they are coloured from the theme's own palette (--accent fill, --light outline), so they follow light / dark
// mode too. Applied by styles/global.css on :root[data-cursor]. Touch screens are skipped.
import { arrow, ring } from '../themes/shared/cursor-kit.js'
import { findLook } from '../themes'

const SIZE = 32
const SHADOW = '<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="0.9" flood-color="#000" flood-opacity="0.45"/></filter>'

const fine = (() => { try { return matchMedia('(pointer: fine)').matches } catch { return true } })()

function toUrl({ svg, x, y, defs = '' }) {
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"><defs>${SHADOW}${defs}</defs><g filter="url(#s)">${svg}</g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(doc)}") ${x} ${y}`
}

/** Build the current look's cursors from its palette and expose them as CSS variables. */
export function applyCursor() {
  const root = document.documentElement
  if (!fine) { root.removeAttribute('data-cursor'); return }
  // (--cur-auto is only set here, so without themed cursors `var(--cur-auto, default)` stays plain default)
  const cs = getComputedStyle(root)
  const v = (name, fb) => cs.getPropertyValue(name).trim() || fb
  const c = { a: v('--accent', v('--light', '#ffffff')), l: v('--light', '#ffffff'), d: v('--dark', '#0e0e0e') }
  // Monochrome has no accent: white arrow with a dark outline reads better
  if (!root.getAttribute('data-look')) Object.assign(c, { a: c.l, l: c.d })
  const shape = findLook(root.getAttribute('data-look') || '').cursor || {}
  const a = (shape.arrow || arrow)(c)
  const p = (shape.pointer || ring)(c)
  root.style.setProperty('--cur', toUrl(a))
  root.style.setProperty('--cur-pointer', toUrl(p))
  // complete value for places that would otherwise force `cursor: default`
  root.style.setProperty('--cur-auto', `${toUrl(a)}, default`)
  root.setAttribute('data-cursor', '')
}
