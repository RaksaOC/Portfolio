// Mouse cursors: Japan: an arrow with a sakura petal caught on it; a sakura blossom to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

// one sakura petal pointing up from the centre (16,16), with the notch at its tip
const SAKURA_PETAL = 'M16 16C12.4 13.2 11.6 8.8 13.4 5.2L16 7.2L18.6 5.2C20.4 8.8 19.6 13.2 16 16Z'

export default {
  arrow: (c) => arrow(c, `<path d="${SAKURA_PETAL}" transform="translate(13.4 -1.2) scale(0.62) rotate(30 16 16)" fill="#ffc2d6" stroke="${c.l}" stroke-width="1.4"/>`),
  pointer: (c) => ({
    svg: [0, 72, 144, 216, 288].map((r) => `<path d="${SAKURA_PETAL}" transform="rotate(${r} 16 16)" fill="#ffc2d6" stroke="${c.a}" stroke-width="1.2" stroke-linejoin="round"/>`).join('')
      + `<circle cx="16" cy="16" r="3" fill="${c.a}"/>`
      + [0, 72, 144, 216, 288].map((r) => `<circle cx="16" cy="11.4" r="0.9" transform="rotate(${r + 36} 16 16)" fill="${c.a}"/>`).join(''),
    x: 16, y: 16,
  }),
}
