// Mouse cursors: Nature: a leaf; a little flower to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
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
}
