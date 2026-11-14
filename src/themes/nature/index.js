// Nature: forest dusk, fireflies and mountains on the horizon.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'nature',
  name: 'Nature',
  km: 'ធម្មជាតិ',
  note: 'Forest dusk, fireflies and mountains on the horizon',
  fonts: 'family=Fraunces:opsz,wght@9..144,400;9..144,600', // Google Fonts query (Latin)
  kmFonts: { display: 'Freehand', body: 'Hanuman' },
  sw: { dark: ['#0b1a12', '#e8f3e6', '#7bd389'], light: ['#e6efdc', '#12301c', '#2f8f4e'] }, // Settings swatches
  scene: {
    wire: { dark: 0x7bd389, light: 0x1f6b3a },
    gridOpacity: 0.16,
    speed: 0.12,
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Ascending the Vale' },
  cursor,
}
