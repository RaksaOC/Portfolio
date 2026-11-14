// Mouse cursors: Terminal: a glowing outlined arrow; a block caret in brackets to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { ARROW, arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<path d="${ARROW}" fill="${c.d}" stroke="${c.a}" stroke-width="1.7" stroke-linejoin="round" filter="url(#g)"/>`,
    x: 4, y: 3,
    defs: `<filter id="g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
  }),
  pointer: (c) => ({
    svg: `<path d="M10 6H6V26H10M22 6H26V26H22" fill="none" stroke="${c.a}" stroke-width="2"/><rect x="12.5" y="10" width="7" height="12" fill="${c.a}"/>`,
    x: 16, y: 16,
  }),
}
