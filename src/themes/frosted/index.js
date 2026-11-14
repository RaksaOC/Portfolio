// Frosted Glass: soft gradients, frosted cards and glossy buttons. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'

export default {
  id: 'frosted',
  name: 'Frosted Glass',
  km: 'កញ្ចក់ព្រិល',
  note: 'Soft gradients, frosted cards and glossy buttons',
  fonts: 'family=Inter:wght@400;500;600;700;800', // Google Fonts query (Latin)
  kmFonts: { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#000000', '#0a84ff', '#ffffff'], light: ['#f2f2f7', '#0071e3', '#000000'] }, // Settings swatches
  scene: {
    wire: { dark: 0x0a84ff, light: 0x0071e3 },
    gridOpacity: 0.1,
    speed: 0.12,
    ambient: 'bokeh', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Wallpaper' },
}
