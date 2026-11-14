// Atomic: electric violet, orbiting electrons and drifting molecules.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'atomic',
  name: 'Atomic',
  km: 'អាតូម',
  note: 'Electric violet, orbiting electrons and drifting molecules',
  fonts: 'family=Orbitron:wght@500;700&family=Exo+2:wght@300;400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kdam Thmor Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#0a0b1e', '#8b7bff', '#e6e9ff'], light: ['#eef0ff', '#4b3fd6', '#14163a'] }, // Settings swatches
  scene: {
    wire: { dark: 0x8b7bff, light: 0x4b3fd6 },
    gridOpacity: 0.18,
    speed: 0.18,
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Mesmerizing Galaxy' },
  cursor,
}
