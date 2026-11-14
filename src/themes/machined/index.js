// Machined: square edges, heavy heads, thin body. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'

export default {
  id: 'machined',
  name: 'Machined',
  km: 'ម៉ាស៊ីន',
  note: 'Square edges, heavy heads, thin body',
  fonts: 'family=Inter:wght@300;400;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kantumruy Pro', body: 'Nokora' },
  sw: { dark: ['#1a2129', '#5a96ea', '#ffffff'], light: ['#ffffff', '#1c69d4', '#262626'] }, // Settings swatches
  scene: {
    wire: { dark: 0x5a96ea, light: 0x1c69d4 },
    gridOpacity: 0.18,
    speed: 0.3,
    ambient: 'blocks', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Industrial Cinematic' },
}
