// Open House: friendly, rounded and a rosy welcome. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'

export default {
  id: 'open-house',
  name: 'Open House',
  km: 'ផ្ទះបើកចំហ',
  note: 'Friendly, rounded and a rosy welcome',
  fonts: 'family=Inter:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#181818', '#ff385c', '#f7f7f7'], light: ['#ffffff', '#e00b41', '#222222'] }, // Settings swatches
  scene: {
    wire: { dark: 0xff385c, light: 0xe00b41 },
    gridOpacity: 0.1,
    speed: 0.15,
    ambient: 'shapes', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Easy Lemon' },
}
