// Mouse cursors: Retro: 8-bit pixel arrow and hand
// Each shape gets the theme's colours c = { a: accent, l: light, d: dark } and returns { svg, x, y } (32x32, hotspot x/y).
import { arrow, pixels } from '../shared/cursor-kit.js'

export default {
  arrow: (c) => ({
    svg: pixels([
      'o', 'oo', 'ofo', 'offo', 'offfo', 'offffo', 'offfffo', 'offffffo', 'offfffffo', 'offffffffo',
      'offfffoooo', 'offoffo', 'ofo offo', 'oo  offo', 'o    offo', '     offo', '      oo',
    ], c),
    x: 4, y: 3,
  }),
  pointer: (c) => ({
    svg: pixels([
      '    oo', '   offo', '   offo', '   offo', '   offooo', '   offoffooo', ' ooffoffoffoo', 'offfoffoffoffo',
      'offffffffffffo', ' offfffffffffo', '  offffffffffo', '  offfffffffo', '   offfffffo', '   offfffffo', '   ooooooooo',
    ], c, 1.75, 2, 2),
    x: 10, y: 3,
  }),
}
