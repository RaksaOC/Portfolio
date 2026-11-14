// Cyberpunk: neon rain, a wireframe skyline and flying traffic.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  km: 'សាយប៊ឺផាំង',
  note: 'Neon rain, a wireframe skyline and flying traffic',
  fonts: 'family=Chakra+Petch:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Koulen', body: 'Kantumruy Pro' },
  sw: { dark: ['#0a0612', '#ff2bd6', '#00f0ff'], light: ['#f3ecff', '#b3008f', '#007c8a'] }, // Settings swatches
  scene: {
    wire: { dark: 0xff2bd6, light: 0xb3008f },
    gridOpacity: 0.28,
    speed: 0.35,
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Severe Tire Damage' },
  cursor,
}
