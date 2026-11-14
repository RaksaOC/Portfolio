// Mouse cursors: Pop Block: a chunky arrow with a hard offset shadow
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { ARROW, arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<path d="${ARROW}" transform="translate(2.4 2.4)" fill="${c.l}"/><path d="${ARROW}" fill="${c.a}" stroke="${c.l}" stroke-width="2" stroke-linejoin="round"/>`,
    x: 4, y: 3,
  }),
}
