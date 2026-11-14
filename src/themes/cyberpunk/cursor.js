// Mouse cursors: Cyberpunk: a sharp glitched arrow (cyan ghost behind); corner brackets to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
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
}
