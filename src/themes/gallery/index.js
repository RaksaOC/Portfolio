// Quiet Gallery: calm space, soft greys and one blue. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'

export default {
  id: 'gallery',
  name: 'Quiet Gallery',
  km: 'វិចិត្រសាលស្ងាត់',
  note: 'Calm space, soft greys and one blue',
  fonts: 'family=Inter:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#000000', '#2997ff', '#ffffff'], light: ['#ffffff', '#0066cc', '#1d1d1f'] }, // Settings swatches
  scene: {
    wire: { dark: 0x2997ff, light: 0x0066cc },
    gridOpacity: 0.08,
    speed: 0.1,
    ambient: 'bokeh', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Dreamer' },
}
