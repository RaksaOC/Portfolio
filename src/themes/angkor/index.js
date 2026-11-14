// Angkor: temple gold at dawn over a jungle moat.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'angkor',
  name: 'Angkor',
  km: 'អង្គរ',
  note: 'Temple gold at dawn over a jungle moat',
  fonts: 'family=Marcellus&family=Marcellus+SC', // Google Fonts query (Latin)
  kmFonts: { display: 'Angkor', body: 'Battambang' },
  sw: { dark: ['#0c1414', '#e9b44c', '#f4e9d4'], light: ['#f3ead8', '#a8731a', '#1f2a26'] }, // Settings swatches
  scene: {
    wire: { dark: 0xe9b44c, light: 0xa8731a },
    gridOpacity: 0.16,
    speed: 0.1,
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('./scene.js'),
  music: {
    src: music,
    title: 'Khmer Traditional Music',
    // a Khmer traditional piece supplied by the site owner: exact title, performer and licence not recorded yet
    credit: { artist: '', href: '', note: '' },
  },
  cursor,
}
