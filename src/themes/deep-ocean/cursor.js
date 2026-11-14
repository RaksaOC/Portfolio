// Mouse cursors: Deep Ocean: a fin; bubbles to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<path d="M4 3C9.8 9.6 17 15.4 24 18.6L14.2 19.4L8.6 27.4Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.5" stroke-linejoin="round"/>`
      + `<path d="M6.4 8.6C10.6 13 15 16.4 19.4 18.6" fill="none" stroke="${c.l}" stroke-width="0.9" stroke-opacity="0.6" stroke-linecap="round"/>`,
    x: 4, y: 3,
  }),
  pointer: (c) => ({
    svg: `<circle cx="14" cy="17" r="8" fill="${c.a}" fill-opacity="0.2" stroke="${c.a}" stroke-width="2"/>`
      + `<path d="M9.6 14.6A5 5 0 0 1 12.6 11.6" fill="none" stroke="${c.l}" stroke-width="1.5" stroke-linecap="round"/>`
      + `<circle cx="24.4" cy="7.4" r="3.4" fill="none" stroke="${c.a}" stroke-width="1.6"/><circle cx="26" cy="15" r="1.8" fill="none" stroke="${c.l}" stroke-width="1.2"/>`,
    x: 14, y: 17,
  }),
}
