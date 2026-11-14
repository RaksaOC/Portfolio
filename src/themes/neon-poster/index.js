// Neon Poster: huge tight type and glowing colour cards. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'

export default {
  id: 'neon-poster',
  name: 'Neon Poster',
  km: 'ផ្ទាំងនីអុង',
  note: 'Huge tight type and glowing colour cards',
  fonts: 'family=Geist:wght@500;700&family=Inter:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Koulen', body: 'Kantumruy Pro' },
  sw: { dark: ['#090909', '#0099ff', '#ffffff'], light: ['#ffffff', '#0088e6', '#090909'] }, // Settings swatches
  scene: {
    wire: { dark: 0x0099ff, light: 0x0088e6 },
    gridOpacity: 0.2,
    speed: 0.3,
    ambient: 'shapes', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Laser Groove' },
}
