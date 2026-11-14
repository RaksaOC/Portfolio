// Mouse cursors: Futuristic: an outlined HUD arrow; a targeting reticle to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { ARROW, arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<path d="${ARROW}" fill="${c.d}" fill-opacity="0.55" stroke="${c.a}" stroke-width="1.8" stroke-linejoin="miter"/><path d="M6.6 9.6L6.6 18.4L13 15.2Z" fill="${c.a}"/>`,
    x: 4, y: 3,
  }),
  pointer: (c) => ({
    svg: `<circle cx="16" cy="16" r="9.5" fill="none" stroke="${c.a}" stroke-width="1.8" stroke-dasharray="11.4 3.5" transform="rotate(-50 16 16)"/>`
      + `<path d="M16 2.5V8M16 24V29.5M2.5 16H8M24 16H29.5" stroke="${c.l}" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="16" r="1.8" fill="${c.a}"/>`,
    x: 16, y: 16,
  }),
}
