// Reading Room: warm paper, clay and serif headlines. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'

export default {
  id: 'reading-room',
  name: 'Reading Room',
  km: 'បន្ទប់អាន',
  note: 'Warm paper, clay and serif headlines',
  fonts: 'family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Noto Serif Khmer', body: 'Hanuman' },
  sw: { dark: ['#181715', '#cc785c', '#faf9f5'], light: ['#faf9f5', '#a9583e', '#141413'] }, // Settings swatches
  scene: {
    wire: { dark: 0xcc785c, light: 0xa9583e },
    gridOpacity: 0.12,
    speed: 0.12,
    ambient: 'bokeh', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Gymnopedie No 1' },
}
