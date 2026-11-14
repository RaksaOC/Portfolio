// Clay Play: pastel, puffy and soft like modelling clay. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'clay',
  name: 'Clay Play',
  km: 'ដីឥដ្ឋ',
  note: 'Pastel, puffy and soft like modelling clay',
  fonts: 'family=Inter:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Siemreap', body: 'Siemreap' },
  sw: { dark: ['#1f1b2a', '#ffb4a9', '#f6f2ff'], light: ['#f1edfb', '#d9796c', '#2e2a3a'] }, // Settings swatches
  scene: {
    wire: { dark: 0xffb4a9, light: 0xd9796c },
    gridOpacity: 0.12,
    speed: 0.12,
    ambient: 'shapes', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Carefree' },
  cursor,
}
