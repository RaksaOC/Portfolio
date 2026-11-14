// Mouse cursors: Atomic: an arrow with an electron orbiting its tip; an atom to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => arrow(c, `<ellipse cx="7" cy="6" rx="6.2" ry="2.4" transform="rotate(-35 7 6)" fill="none" stroke="${c.l}" stroke-width="1"/><circle cx="12" cy="3.6" r="1.6" fill="${c.l}"/>`),
  pointer: (c) => ({
    svg: [0, 60, 120].map((r) => `<ellipse cx="16" cy="16" rx="12.4" ry="4.6" transform="rotate(${r} 16 16)" fill="none" stroke="${c.a}" stroke-width="1.6"/>`).join('')
      + `<circle cx="16" cy="16" r="3.4" fill="${c.l}"/><circle cx="28.2" cy="16" r="1.7" fill="${c.l}"/>`,
    x: 16, y: 16,
  }),
}
