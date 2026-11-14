// Mouse cursors: Night Session: an arrow with a crescent moon; a four-point star to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => arrow(c, `<path d="M25 4.5A4.6 4.6 0 1 0 29.4 10.6A3.6 3.6 0 1 1 25 4.5Z" fill="${c.l}"/>`),
  pointer: (c) => ({
    svg: `<path d="M16 3C17 11 21 15 29 16C21 17 17 21 16 29C15 21 11 17 3 16C11 15 15 11 16 3Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="25.5" cy="6.5" r="1.4" fill="${c.l}"/>`,
    x: 16, y: 16,
  }),
}
