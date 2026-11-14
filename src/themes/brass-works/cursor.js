// Mouse cursors: Brass Works: a clock hand; a gear to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow, gearPath } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<g transform="rotate(-45 16 16)"><path d="M16 1.5L18.4 9.5L17 9.5L17 21.5L15 21.5L15 9.5L13.6 9.5Z" fill="${c.a}" stroke="${c.d}" stroke-width="1" stroke-linejoin="round"/>`
      + `<circle cx="16" cy="24" r="3.6" fill="none" stroke="${c.a}" stroke-width="2"/><circle cx="16" cy="13.5" r="1.6" fill="${c.d}"/></g>`,
    x: 6, y: 6,
  }),
  pointer: (c) => ({
    svg: `<path d="${gearPath(16, 16, 8, 12.6, 9.6, 3.6)}" fill="${c.a}" fill-rule="evenodd" stroke="${c.d}" stroke-width="1"/>`,
    x: 16, y: 16,
  }),
}
