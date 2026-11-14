// Greek: marble, Aegean blue and a temple on the hill.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'greek',
  name: 'Greek',
  km: 'ក្រិក',
  note: 'Marble, Aegean blue and a temple on the hill',
  fonts: 'family=Cinzel:wght@500;700&family=Cormorant+Garamond:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Noto Serif Khmer', body: 'Hanuman' },
  sw: { dark: ['#0b1422', '#5aa0e6', '#f2efe6'], light: ['#f4f1e8', '#1f5fae', '#13233f'] }, // Settings swatches
  scene: {
    wire: { dark: 0x5aa0e6, light: 0x1f5fae },
    gridOpacity: 0.14,
    speed: 0.14,
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Teller of the Tales' },
  cursor,
}
