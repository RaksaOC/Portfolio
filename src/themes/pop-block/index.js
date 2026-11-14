// Pop Block: thick outlines, candy colours and hard shadows. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'pop-block',
  name: 'Pop Block',
  km: 'ប្លុកពណ៌',
  note: 'Thick outlines, candy colours and hard shadows',
  fonts: 'family=Inter:wght@400;500;700;800', // Google Fonts query (Latin)
  kmFonts: { display: 'Koulen', body: 'Kantumruy Pro' },
  sw: { dark: ['#121214', '#ff6b6b', '#f7f7f7'], light: ['#fffbea', '#ff5252', '#111111'] }, // Settings swatches
  scene: {
    wire: { dark: 0xff6b6b, light: 0xff5252 },
    gridOpacity: 0.25,
    speed: 0.35,
    ambient: 'blocks', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Blip Stream' },
  cursor,
}
