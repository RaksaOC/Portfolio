// Volcano: charcoal, ash and a mountain spitting lava.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'volcano',
  name: 'Volcano',
  km: 'ភ្នំភ្លើង',
  note: 'Charcoal, ash and a mountain spitting lava',
  fonts: 'family=Bebas+Neue&family=Rubik:wght@400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Koulen', body: 'Kantumruy Pro' },
  sw: { dark: ['#120604', '#ff5a1f', '#ffe9dc'], light: ['#f7e7dc', '#c2410c', '#2a0f07'] }, // Settings swatches
  scene: {
    wire: { dark: 0xff5a1f, light: 0xc2410c },
    gridOpacity: 0.2,
    speed: 0.22,
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Volatile Reaction' },
  cursor,
}
