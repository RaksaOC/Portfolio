// Mouse cursors: Angkor: gold arrow with carved tiers; a lotus to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => arrow(c, `<path d="M6.5 12.5L10 9.8M6.5 17L13.4 11.6M6.5 21.4L16.6 13.5" stroke="${c.d}" stroke-width="1.1" stroke-linecap="round" opacity="0.55"/>`),
  pointer: (c) => ({
    svg: `<g fill="${c.a}" stroke="${c.l}" stroke-width="1.2" stroke-linejoin="round">`
      + '<path d="M16 21C11.2 19.4 7 15.4 5.6 9.8C11 10.6 14.6 14.6 16 21Z"/>'
      + '<path d="M16 21C20.8 19.4 25 15.4 26.4 9.8C21 10.6 17.4 14.6 16 21Z"/>'
      + '<path d="M16 4.5C19.6 9 19.6 15.8 16 21C12.4 15.8 12.4 9 16 4.5Z"/></g>'
      + `<path d="M8.5 24.2Q16 28.6 23.5 24.2" fill="none" stroke="${c.a}" stroke-width="2" stroke-linecap="round"/>`,
    x: 16, y: 14,
  }),
}
