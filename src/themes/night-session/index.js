// Night Session: dark room, green glow and pill buttons. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'night-session',
  name: 'Night Session',
  km: 'វគ្គពេលយប់',
  note: 'Dark room, green glow and pill buttons',
  fonts: 'family=Figtree:wght@400;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#121212', '#1ed760', '#ffffff'], light: ['#ffffff', '#1aa34a', '#121212'] }, // Settings swatches
  scene: {
    wire: { dark: 0x1ed760, light: 0x1aa34a },
    gridOpacity: 0.12,
    speed: 0.2,
    ambient: 'bars', // flavour of the shared ambient scene
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Dream Catcher', visual: true }, // visual: the equaliser dances to it
  cursor,
}
