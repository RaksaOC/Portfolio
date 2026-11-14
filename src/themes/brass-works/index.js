// Brass Works: parchment, brass rivets and gaslight glow. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'brass-works',
  name: 'Brass Works',
  km: 'រោងលង្ហិន',
  note: 'Parchment, brass rivets and gaslight glow',
  fonts: 'family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC', // Google Fonts query (Latin)
  kmFonts: { display: 'Bokor', body: 'Battambang' },
  sw: { dark: ['#1a100a', '#d4893f', '#f5deb3'], light: ['#f3e2bd', '#a85f22', '#2b1a0e'] }, // Settings swatches
  scene: {
    wire: { dark: 0xd4893f, light: 0xa85f22 },
    gridOpacity: 0.16,
    speed: 0.12,
    ambient: 'embers', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Industrial Revolution' },
  cursor,
}
