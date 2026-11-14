// Monochrome: the original look, white wireframes on ink. Its palette is the site default (styles/global.css),
// so it has no theme.css and no data-look attribute; its 3D side is just the base grid and globe.
import music from './music.m4a?url'

export default {
  id: '',
  name: 'Monochrome',
  km: 'ខ្មៅស',
  note: 'The original: white wireframes on ink',
  kmFonts: { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#0e0e0e', '#ffffff', '#a0a0a0'], light: ['#afafaf', '#0e0e0e', '#303030'] }, // Settings swatches
  scene: {
    wire: { dark: 0xf9f1f1, light: 0x000000 },
    gridOpacity: 0.1,
    speed: 0.2,
  },
  music: { src: music, title: 'Clean Soul' },
}
