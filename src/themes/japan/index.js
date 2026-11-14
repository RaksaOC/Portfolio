// Japan: dusk over Mount Fuji, a torii gate and falling sakura.
import './theme.css'
import music from '../gallery/music.m4a?url' // no track of its own yet
import cursor from './cursor.js'

export default {
  id: 'japan',
  name: 'Japan',
  km: 'ជប៉ុន',
  note: 'Dusk over Mount Fuji, a torii gate and falling sakura',
  fonts: 'family=Shippori+Mincho:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Noto Serif Khmer', body: 'Hanuman' },
  sw: { dark: ['#140f26', '#ff5d73', '#f7eaf3'], light: ['#f8eef3', '#c62f45', '#2a1733'] }, // Settings swatches
  scene: {
    wire: { dark: 0xb79cff, light: 0x6a4fb8 },
    gridOpacity: 0.13,
    speed: 0.1,
    globe: false, // hide the welcome-screen wire globe
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Dreamer' },
  cursor,
}
