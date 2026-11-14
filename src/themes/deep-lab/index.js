// Deep Lab: austere research, forest dark and coral. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'

export default {
  id: 'deep-lab',
  name: 'Deep Lab',
  km: 'មន្ទីរពិសោធន៍',
  note: 'Austere research, forest dark and coral',
  fonts: 'family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kdam Thmor Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#00211c', '#ff7759', '#ffffff'], light: ['#ffffff', '#e0553a', '#000000'] }, // Settings swatches
  scene: {
    wire: { dark: 0xff7759, light: 0xe0553a },
    gridOpacity: 0.14,
    speed: 0.15,
    ambient: 'orbits', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Unwritten Return' },
}
