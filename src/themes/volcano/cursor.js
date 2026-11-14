// Mouse cursors: Volcano: an obsidian shard glowing like lava; a fireball to click
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: `<defs><linearGradient id="lv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd166"/><stop offset="1" stop-color="${c.a}"/></linearGradient></defs>`
      + `<path d="M4 3L5 24.6L9.8 20.4L12.2 27.6L16.4 22.6L15 17.6L22.2 17.2Z" fill="url(#lv)" stroke="${c.d}" stroke-width="1.6" stroke-linejoin="round"/>`,
    x: 4, y: 3,
  }),
  pointer: (c) => ({
    svg: `<defs><radialGradient id="fb" cx="0.5" cy="0.68" r="0.6"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.45" stop-color="#ffb347"/><stop offset="1" stop-color="${c.a}"/></radialGradient></defs>`
      + `<path d="M16 3.5C20.4 9.4 25 12.6 23.4 20.6C22.4 25.6 18.8 28 16 28C12 28 8.2 25 9 19.2C9.6 15.2 12.6 14.6 12.8 10.6C14.8 12.6 15 14.6 15.6 16C17 12.2 17.2 7.8 16 3.5Z" fill="url(#fb)" stroke="${c.d}" stroke-width="1.3" stroke-linejoin="round"/>`,
    x: 16, y: 17,
  }),
}
