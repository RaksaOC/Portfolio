// Drawing helpers for the themed mouse cursors (each theme's cursor.js). Shapes are SVG snippets in a 32x32
// box, coloured from the theme's palette c = { a: accent, l: light, d: dark }; each returns { svg, x, y } where
// x / y is the hotspot. core/cursors.js turns them into CSS cursor URLs.

// the classic arrow outline
export const ARROW = 'M4 3L4 25L9.8 19.6L13.6 28L17.8 26.2L14 17.9L21.8 17.8Z'

/** Default arrow (plus optional extra SVG on top). */
export const arrow = (c, extra = '') => ({
  svg: `<path d="${ARROW}" fill="${c.a}" stroke="${c.l}" stroke-width="1.6" stroke-linejoin="round"/>${extra}`, x: 4, y: 3,
})

/** Default "clickable" ring. */
export const ring = (c, extra = '') => ({
  svg: `<circle cx="16" cy="16" r="9" fill="${c.a}" fill-opacity="0.22" stroke="${c.a}" stroke-width="2.2"/><circle cx="16" cy="16" r="9" fill="none" stroke="${c.l}" stroke-width="0.8" stroke-opacity="0.7"/><circle cx="16" cy="16" r="2.6" fill="${c.l}"/>${extra}`, x: 16, y: 16,
})

/** Pixel art: rows of characters, o = outline, f = fill. */
export function pixels(rows, c, px = 1.7, ox = 3, oy = 2) {
  let out = ''
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === 'o' || ch === 'f') {
      out += `<rect x="${(ox + x * px).toFixed(2)}" y="${(oy + y * px).toFixed(2)}" width="${px + 0.05}" height="${px + 0.05}" fill="${ch === 'o' ? c.l : c.a}"/>`
    }
  }))
  return `<g shape-rendering="crispEdges">${out}</g>`
}

/** SVG path of a gear with a round hole (fill-rule evenodd). */
export function gearPath(cx, cy, teeth, ro, ri, hole) {
  const pts = []
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2
    const r = i % 4 < 2 ? ro : ri
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`)
  }
  const h = `M${cx + hole} ${cy}a${hole} ${hole} 0 1 0 ${-hole * 2} 0a${hole} ${hole} 0 1 0 ${hole * 2} 0Z`
  return `M${pts.join('L')}Z${h}`
}
