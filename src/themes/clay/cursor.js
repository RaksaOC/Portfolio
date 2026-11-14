// Mouse cursors: Clay: soft, thick and rounded
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<path d="M5 4.5L5 23.6L10.4 18.8L14 26.4L17 25L13.6 17.4L20.6 17.2Z" fill="${c.a}" stroke="${c.l}" stroke-width="2.6" stroke-linejoin="round"/>`,
    x: 5, y: 4,
  }),
}
