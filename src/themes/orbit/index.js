// Orbit: warm stone, big curves and orange arcs. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'orbit',
  name: 'Orbit',
  km: 'គន្លង',
  note: 'Warm stone, big curves and orange arcs',
  fonts: 'family=Sofia+Sans:wght@400;500;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#141413', '#f37338', '#f3f0ee'], light: ['#f3f0ee', '#cf4500', '#141413'] }, // Settings swatches
  scene: {
    wire: { dark: 0xf37338, light: 0xcf4500 },
    gridOpacity: 0.12,
    speed: 0.15,
    ambient: 'orbits', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Space Jazz' },
  cursor,
}
