// Mouse cursors: Orbit: an arrow with a small ring around the tip
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => arrow(c, `<circle cx="4.5" cy="3.5" r="3.2" fill="none" stroke="${c.l}" stroke-width="1"/>`),
}
