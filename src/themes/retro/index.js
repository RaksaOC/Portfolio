// Retro: synthwave sunset with traffic racing down the grid.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'retro',
  name: 'Retro',
  km: 'រេត្រូ',
  note: 'Synthwave sunset with traffic racing down the grid',
  fonts: 'family=Space+Mono:wght@400;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Bokor', body: 'Battambang' },
  sw: { dark: ['#14002e', '#ff4fd8', '#ffd166'], light: ['#ffe9f6', '#c2187a', '#ff8a00'] }, // Settings swatches
  scene: {
    wire: { dark: 0xff4fd8, light: 0xc2187a },
    gridOpacity: 0.4,
    speed: 0.6,
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Newer Wave' },
  cursor,
}
