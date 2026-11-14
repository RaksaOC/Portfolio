// Mouse cursors: Greek: a spear; an olive wreath to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<g transform="rotate(-45 16 16)"><path d="M16 1L19.6 8.5L16.9 12.2H15.1L12.4 8.5Z" fill="${c.a}" stroke="${c.l}" stroke-width="1.3" stroke-linejoin="round"/>`
      + `<rect x="15" y="12" width="2" height="17" rx="1" fill="${c.l}"/><rect x="14" y="13" width="4" height="1.6" rx="0.8" fill="${c.a}"/></g>`,
    x: 5, y: 5,
  }),
  pointer: (c) => {
    let leaves = ''
    for (let i = 0; i < 10; i++) {
      const a = -150 + i * 30
      if (a > 120 && a < 150) continue
      leaves += `<ellipse cx="16" cy="6.6" rx="1.7" ry="3.2" transform="rotate(${a} 16 16) rotate(30 16 6.6)" fill="${c.a}" stroke="${c.l}" stroke-width="0.6"/>`
    }
    return { svg: `<circle cx="16" cy="16" r="9.4" fill="none" stroke="${c.l}" stroke-width="0.9" stroke-opacity="0.6"/>${leaves}<circle cx="16" cy="16" r="2.4" fill="${c.l}"/>`, x: 16, y: 16 }
  },
}
