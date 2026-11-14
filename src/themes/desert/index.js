// Desert: canyon rock, saguaro cacti and tumbleweeds on the sand.
import './theme.css'
import music from '../greek/music.m4a?url' // no track of its own yet
import cursor from './cursor.js'

export default {
  id: 'desert',
  name: 'Desert',
  km: 'វាលខ្សាច់',
  note: 'Canyon rock, saguaro cacti and tumbleweeds on the sand',
  fonts: 'family=Rye&family=Arvo:wght@400;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Bokor', body: 'Battambang' },
  sw: { dark: ['#1b100b', '#f59a4a', '#fbe8cf'], light: ['#f7e4c3', '#c4571b', '#3b2213'] }, // Settings swatches
  scene: {
    wire: { dark: 0xf2b36b, light: 0xb4642a },
    gridOpacity: 0.16,
    speed: 0.14,
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Teller of the Tales' },
  cursor,
}
