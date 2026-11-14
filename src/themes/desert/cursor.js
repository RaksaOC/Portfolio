// Mouse cursors: Desert: a fletched arrow; a saguaro cactus to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<g transform="rotate(-45 16 16)"><path d="M16 1L19.6 8.8H12.4Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.3" stroke-linejoin="round"/>`
      + `<rect x="15.1" y="8.4" width="1.8" height="17.6" rx="0.9" fill="${c.l}"/>`
      + `<path d="M16 21.6L19.6 25.2V29.6L16 26.2L12.4 29.6V25.2Z" fill="${c.a}" stroke="${c.l}" stroke-width="1" stroke-linejoin="round"/></g>`,
    x: 5, y: 5,
  }),
  pointer: (c) => ({
    svg: `<g fill="none" stroke-linecap="round" stroke-linejoin="round">`
      + `<path d="M16 5V27M16 19H10.4V11.6M16 15.6H21.6V8.6" stroke="${c.l}" stroke-width="6.6"/>`
      + `<path d="M16 5V27M16 19H10.4V11.6M16 15.6H21.6V8.6" stroke="#6fae4e" stroke-width="4.4"/>`
      + `<path d="M16 7V25" stroke="#3f7a2e" stroke-width="0.8"/></g>`
      + `<path d="M9 28.4H23" stroke="${c.a}" stroke-width="2" stroke-linecap="round"/>`
      + `<circle cx="16" cy="4.4" r="1.6" fill="#ff5d73"/>`,
    x: 16, y: 5,
  }),
}
