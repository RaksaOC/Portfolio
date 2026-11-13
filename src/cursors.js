// Themed mouse cursors. Each look gets an arrow (--cur) and a "clickable" cursor (--cur-pointer), drawn
// here as small SVGs and coloured from the look's own palette (--accent fill, --light outline), so they
// follow light / dark mode too. Applied by global.css on :root[data-cursor]. Touch screens are skipped.
//
// Each shape returns { svg, x, y }: the inner SVG (32x32 viewBox) and the hotspot.

const SIZE = 32

const ARROW = 'M4 3L4 25L9.8 19.6L13.6 28L17.8 26.2L14 17.9L21.8 17.8Z'
const SHADOW = '<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="0.9" flood-color="#000" flood-opacity="0.45"/></filter>'

const arrow = (c, extra = '') => ({
  svg: `<path d="${ARROW}" fill="${c.a}" stroke="${c.l}" stroke-width="1.6" stroke-linejoin="round"/>${extra}`, x: 4, y: 3,
})
const ring = (c, extra = '') => ({
  svg: `<circle cx="16" cy="16" r="9" fill="${c.a}" fill-opacity="0.22" stroke="${c.a}" stroke-width="2.2"/><circle cx="16" cy="16" r="9" fill="none" stroke="${c.l}" stroke-width="0.8" stroke-opacity="0.7"/><circle cx="16" cy="16" r="2.6" fill="${c.l}"/>${extra}`, x: 16, y: 16,
})

// pixel art: o = outline, f = fill
function pixels(rows, c, px = 1.7, ox = 3, oy = 2) {
  let out = ''
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === 'o' || ch === 'f') {
      out += `<rect x="${(ox + x * px).toFixed(2)}" y="${(oy + y * px).toFixed(2)}" width="${px + 0.05}" height="${px + 0.05}" fill="${ch === 'o' ? c.l : c.a}"/>`
    }
  }))
  return `<g shape-rendering="crispEdges">${out}</g>`
}

function gearPath(cx, cy, teeth, ro, ri, hole) {
  const pts = []
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2
    const r = i % 4 < 2 ? ro : ri
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`)
  }
  const h = `M${cx + hole} ${cy}a${hole} ${hole} 0 1 0 ${-hole * 2} 0a${hole} ${hole} 0 1 0 ${hole * 2} 0Z`
  return `M${pts.join('L')}Z${h}`
}

// one sakura petal pointing up from the centre (16,16), with the notch at its tip
const SAKURA_PETAL = 'M16 16C12.4 13.2 11.6 8.8 13.4 5.2L16 7.2L18.6 5.2C20.4 8.8 19.6 13.2 16 16Z'

const SHAPES = {
  default: { arrow, pointer: ring },

  // Angkor: gold arrow with carved tiers; a lotus to click
  angkor: {
    arrow: (c) => arrow(c, `<path d="M6.5 12.5L10 9.8M6.5 17L13.4 11.6M6.5 21.4L16.6 13.5" stroke="${c.d}" stroke-width="1.1" stroke-linecap="round" opacity="0.55"/>`),
    pointer: (c) => ({
      svg: `<g fill="${c.a}" stroke="${c.l}" stroke-width="1.2" stroke-linejoin="round">`
        + '<path d="M16 21C11.2 19.4 7 15.4 5.6 9.8C11 10.6 14.6 14.6 16 21Z"/>'
        + '<path d="M16 21C20.8 19.4 25 15.4 26.4 9.8C21 10.6 17.4 14.6 16 21Z"/>'
        + '<path d="M16 4.5C19.6 9 19.6 15.8 16 21C12.4 15.8 12.4 9 16 4.5Z"/></g>'
        + `<path d="M8.5 24.2Q16 28.6 23.5 24.2" fill="none" stroke="${c.a}" stroke-width="2" stroke-linecap="round"/>`,
      x: 16, y: 14,
    }),
  },

  // Greek: a spear; an olive wreath to click
  greek: {
    arrow: (c) => ({
      svg: `<g transform="rotate(-45 16 16)"><path d="M16 1L19.6 8.5L16.9 12.2H15.1L12.4 8.5Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.3" stroke-linejoin="round"/>`
        + `<rect x="15" y="12" width="2" height="17" rx="1" fill="${c.l}"/><rect x="14" y="13" width="4" height="1.6" rx="0.8" fill="${c.a}"/></g>`,
      x: 5, y: 5,
    }),
    pointer: (c) => {
      let leaves = ''
      for (let i = 0; i < 10; i++) {
        const a = -150 + i * 30
        if (a > 120 && a < 150) continue
        leaves += `<ellipse cx="16" cy="6.6" rx="1.7" ry="3.2" transform="rotate(${a} 16 16) rotate(30 16 6.6)" fill="${c.a}" stroke="${c.l}" stroke-width="0.6"/>`
      }
      return { svg: `<circle cx="16" cy="16" r="9.4" fill="none" stroke="${c.l}" stroke-width="0.9" stroke-opacity="0.6"/>${leaves}<circle cx="16" cy="16" r="2.4" fill="${c.l}"/>`, x: 16, y: 16 }
    },
  },

  // Deep Ocean: a fin; bubbles to click
  'deep-ocean': {
    arrow: (c) => ({
      svg: `<path d="M4 3C9.8 9.6 17 15.4 24 18.6L14.2 19.4L8.6 27.4Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.5" stroke-linejoin="round"/>`
        + `<path d="M6.4 8.6C10.6 13 15 16.4 19.4 18.6" fill="none" stroke="${c.l}" stroke-width="0.9" stroke-opacity="0.6" stroke-linecap="round"/>`,
      x: 4, y: 3,
    }),
    pointer: (c) => ({
      svg: `<circle cx="14" cy="17" r="8" fill="${c.a}" fill-opacity="0.2" stroke="${c.a}" stroke-width="2"/>`
        + `<path d="M9.6 14.6A5 5 0 0 1 12.6 11.6" fill="none" stroke="${c.l}" stroke-width="1.5" stroke-linecap="round"/>`
        + `<circle cx="24.4" cy="7.4" r="3.4" fill="none" stroke="${c.a}" stroke-width="1.6"/><circle cx="26" cy="15" r="1.8" fill="none" stroke="${c.l}" stroke-width="1.2"/>`,
      x: 14, y: 17,
    }),
  },

  // Volcano: an obsidian shard glowing like lava; a fireball to click
  volcano: {
    arrow: (c) => ({
      svg: `<defs><linearGradient id="lv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd166"/><stop offset="1" stop-color="${c.a}"/></linearGradient></defs>`
        + `<path d="M4 3L5 24.6L9.8 20.4L12.2 27.6L16.4 22.6L15 17.6L22.2 17.2Z" fill="url(#lv)" stroke="${c.d}" stroke-width="1.6" stroke-linejoin="round"/>`,
      x: 4, y: 3,
    }),
    pointer: (c) => ({
      svg: `<defs><radialGradient id="fb" cx="0.5" cy="0.68" r="0.6"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.45" stop-color="#ffb347"/><stop offset="1" stop-color="${c.a}"/></radialGradient></defs>`
        + `<path d="M16 3.5C20.4 9.4 25 12.6 23.4 20.6C22.4 25.6 18.8 28 16 28C12 28 8.2 25 9 19.2C9.6 15.2 12.6 14.6 12.8 10.6C14.8 12.6 15 14.6 15.6 16C17 12.2 17.2 7.8 16 3.5Z" fill="url(#fb)" stroke="${c.d}" stroke-width="1.3" stroke-linejoin="round"/>`,
      x: 16, y: 17,
    }),
  },

  // Atomic: an arrow with an electron orbiting its tip; an atom to click
  atomic: {
    arrow: (c) => arrow(c, `<ellipse cx="7" cy="6" rx="6.2" ry="2.4" transform="rotate(-35 7 6)" fill="none" stroke="${c.l}" stroke-width="1"/><circle cx="12" cy="3.6" r="1.6" fill="${c.l}"/>`),
    pointer: (c) => ({
      svg: [0, 60, 120].map((r) => `<ellipse cx="16" cy="16" rx="12.4" ry="4.6" transform="rotate(${r} 16 16)" fill="none" stroke="${c.a}" stroke-width="1.6"/>`).join('')
        + `<circle cx="16" cy="16" r="3.4" fill="${c.l}"/><circle cx="28.2" cy="16" r="1.7" fill="${c.l}"/>`,
      x: 16, y: 16,
    }),
  },

  // Japan: an arrow with a sakura petal caught on it; a sakura blossom to click
  japan: {
    arrow: (c) => arrow(c, `<path d="${SAKURA_PETAL}" transform="translate(13.4 -1.2) scale(0.62) rotate(30 16 16)" fill="#ffc2d6" stroke="${c.l}" stroke-width="1.4"/>`),
    pointer: (c) => ({
      svg: [0, 72, 144, 216, 288].map((r) => `<path d="${SAKURA_PETAL}" transform="rotate(${r} 16 16)" fill="#ffc2d6" stroke="${c.a}" stroke-width="1.2" stroke-linejoin="round"/>`).join('')
        + `<circle cx="16" cy="16" r="3" fill="${c.a}"/>`
        + [0, 72, 144, 216, 288].map((r) => `<circle cx="16" cy="11.4" r="0.9" transform="rotate(${r + 36} 16 16)" fill="${c.a}"/>`).join(''),
      x: 16, y: 16,
    }),
  },

  // Desert: a fletched arrow; a saguaro cactus to click
  desert: {
    arrow: (c) => ({
      svg: `<g transform="rotate(-45 16 16)"><path d="M16 1L19.6 8.8H12.4Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.3" stroke-linejoin="round"/>`
        + `<rect x="15.1" y="8.4" width="1.8" height="17.6" rx="0.9" fill="${c.l}"/>`
        + `<path d="M16 21.6L19.6 25.2V29.6L16 26.2L12.4 29.6V25.2Z" fill="${c.a}" stroke="${c.l}" stroke-width="1" stroke-linejoin="round"/></g>`,
      x: 5, y: 5,
    }),
    pointer: (c) => ({
      svg: `<g fill="none" stroke-linecap="round" stroke-linejoin="round">`
        + `<path d="M16 5V27M16 19H10.4V11.6M16 15.6H21.6V8.6" stroke="${c.l}" stroke-width="6.6"/>`
        + `<path d="M16 5V27M16 19H10.4V11.6M16 15.6H21.6V8.6" stroke="#6fae4e" stroke-width="4.4"/>`
        + `<path d="M16 7V25" stroke="#3f7a2e" stroke-width="0.8"/></g>`
        + `<path d="M9 28.4H23" stroke="${c.a}" stroke-width="2" stroke-linecap="round"/>`
        + `<circle cx="16" cy="4.4" r="1.6" fill="#ff5d73"/>`,
      x: 16, y: 5,
    }),
  },

  // Futuristic: an outlined HUD arrow; a targeting reticle to click
  futuristic: {
    arrow: (c) => ({
      svg: `<path d="${ARROW}" fill="${c.d}" fill-opacity="0.55" stroke="${c.a}" stroke-width="1.8" stroke-linejoin="miter"/><path d="M6.6 9.6L6.6 18.4L13 15.2Z" fill="${c.a}"/>`,
      x: 4, y: 3,
    }),
    pointer: (c) => ({
      svg: `<circle cx="16" cy="16" r="9.5" fill="none" stroke="${c.a}" stroke-width="1.8" stroke-dasharray="11.4 3.5" transform="rotate(-50 16 16)"/>`
        + `<path d="M16 2.5V8M16 24V29.5M2.5 16H8M24 16H29.5" stroke="${c.l}" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="16" r="1.8" fill="${c.a}"/>`,
      x: 16, y: 16,
    }),
  },

  // Retro: 8-bit pixel arrow and hand
  retro: {
    arrow: (c) => ({
      svg: pixels([
        'o', 'oo', 'ofo', 'offo', 'offfo', 'offffo', 'offfffo', 'offffffo', 'offfffffo', 'offffffffo',
        'offfffoooo', 'offoffo', 'ofo offo', 'oo  offo', 'o    offo', '     offo', '      oo',
      ], c),
      x: 4, y: 3,
    }),
    pointer: (c) => ({
      svg: pixels([
        '    oo', '   offo', '   offo', '   offo', '   offooo', '   offoffooo', ' ooffoffoffoo', 'offfoffoffoffo',
        'offffffffffffo', ' offfffffffffo', '  offffffffffo', '  offfffffffo', '   offfffffo', '   offfffffo', '   ooooooooo',
      ], c, 1.75, 2, 2),
      x: 10, y: 3,
    }),
  },

  // Cyberpunk: a sharp glitched arrow (cyan ghost behind); corner brackets to click
  cyberpunk: {
    arrow: (c) => ({
      svg: `<path d="M5.6 4.4L5.6 25.4L10.6 20.4L14.6 28.4L18.6 26.4L14.6 18.9L22.6 18.9Z" fill="#2de2e6" opacity="0.85"/>`
        + `<path d="M4 3L4 24L9 19L13 27L17 25L13 17.5L21 17.5Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.4" stroke-linejoin="miter"/>`,
      x: 4, y: 3,
    }),
    pointer: (c) => ({
      svg: `<path d="M4 11V4H11M21 4H28V11M28 21V28H21M11 28H4V21" fill="none" stroke="${c.a}" stroke-width="2.4"/>`
        + `<path d="M5.4 12.4V5.4H12.4M22.4 5.4" fill="none" stroke="#2de2e6" stroke-width="1" opacity="0.8"/>`
        + `<path d="M16 11.5L20.5 16L16 20.5L11.5 16Z" fill="${c.l}"/>`,
      x: 16, y: 16,
    }),
  },

  // Nature: a leaf; a little flower to click
  nature: {
    arrow: (c) => ({
      svg: `<path d="M4 4C16 4 26.4 10 26 21.6C25.8 26 22 28.4 17.6 27.2C8.6 24.8 4 16 4 4Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.4" stroke-linejoin="round"/>`
        + `<path d="M4.6 4.6Q14 13.6 23.6 25" fill="none" stroke="${c.l}" stroke-width="1.1" stroke-linecap="round" stroke-opacity="0.8"/>`
        + `<path d="M10.4 11.6L9.4 17M15 16.4L17.4 13" stroke="${c.l}" stroke-width="0.8" stroke-linecap="round" stroke-opacity="0.6"/>`,
      x: 4, y: 4,
    }),
    pointer: (c) => ({
      svg: [0, 72, 144, 216, 288].map((r) => `<ellipse cx="16" cy="9" rx="4.2" ry="6" transform="rotate(${r} 16 16)" fill="${c.a}" stroke="${c.l}" stroke-width="1"/>`).join('')
        + `<circle cx="16" cy="16" r="3.4" fill="#ffd166" stroke="${c.d}" stroke-width="0.8"/>`,
      x: 16, y: 16,
    }),
  },

  // Terminal: a glowing outlined arrow; a block caret in brackets to click
  'neon-terminal': {
    arrow: (c) => ({
      svg: `<path d="${ARROW}" fill="${c.d}" stroke="${c.a}" stroke-width="1.7" stroke-linejoin="round" filter="url(#g)"/>`,
      x: 4, y: 3,
      defs: `<filter id="g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    }),
    pointer: (c) => ({
      svg: `<path d="M10 6H6V26H10M22 6H26V26H22" fill="none" stroke="${c.a}" stroke-width="2"/><rect x="12.5" y="10" width="7" height="12" fill="${c.a}"/>`,
      x: 16, y: 16,
    }),
  },

  // Night Session: an arrow with a crescent moon; a four-point star to click
  'night-session': {
    arrow: (c) => arrow(c, `<path d="M25 4.5A4.6 4.6 0 1 0 29.4 10.6A3.6 3.6 0 1 1 25 4.5Z" fill="${c.l}"/>`),
    pointer: (c) => ({
      svg: `<path d="M16 3C17 11 21 15 29 16C21 17 17 21 16 29C15 21 11 17 3 16C11 15 15 11 16 3Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="25.5" cy="6.5" r="1.4" fill="${c.l}"/>`,
      x: 16, y: 16,
    }),
  },

  // Brass Works: a clock hand; a gear to click
  'brass-works': {
    arrow: (c) => ({
      svg: `<g transform="rotate(-45 16 16)"><path d="M16 1.5L18.4 9.5L17 9.5L17 21.5L15 21.5L15 9.5L13.6 9.5Z" fill="${c.a}" stroke="${c.d}" stroke-width="1" stroke-linejoin="round"/>`
        + `<circle cx="16" cy="24" r="3.6" fill="none" stroke="${c.a}" stroke-width="2"/><circle cx="16" cy="13.5" r="1.6" fill="${c.d}"/></g>`,
      x: 6, y: 6,
    }),
    pointer: (c) => ({
      svg: `<path d="${gearPath(16, 16, 8, 12.6, 9.6, 3.6)}" fill="${c.a}" fill-rule="evenodd" stroke="${c.d}" stroke-width="1"/>`,
      x: 16, y: 16,
    }),
  },

  // Pop Block: a chunky arrow with a hard offset shadow
  'pop-block': {
    arrow: (c) => ({
      svg: `<path d="${ARROW}" transform="translate(2.4 2.4)" fill="${c.l}"/><path d="${ARROW}" fill="${c.a}" stroke="${c.l}" stroke-width="2" stroke-linejoin="round"/>`,
      x: 4, y: 3,
    }),
  },

  // Clay: soft, thick and rounded
  clay: {
    arrow: (c) => ({
      svg: `<path d="M5 4.5L5 23.6L10.4 18.8L14 26.4L17 25L13.6 17.4L20.6 17.2Z" fill="${c.a}" stroke="${c.l}" stroke-width="2.6" stroke-linejoin="round"/>`,
      x: 5, y: 4,
    }),
  },

  // Orbit: an arrow with a small ring around the tip
  orbit: {
    arrow: (c) => arrow(c, `<circle cx="4.5" cy="3.5" r="3.2" fill="none" stroke="${c.l}" stroke-width="1"/>`),
  },
}

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
  const shape = SHAPES[root.getAttribute('data-look')] || {}
  const a = (shape.arrow || SHAPES.default.arrow)(c)
  const p = (shape.pointer || SHAPES.default.pointer)(c)
  root.style.setProperty('--cur', toUrl(a))
  root.style.setProperty('--cur-pointer', toUrl(p))
  // complete value for places that would otherwise force `cursor: default`
  root.style.setProperty('--cur-auto', `${toUrl(a)}, default`)
  root.setAttribute('data-cursor', '')
}
