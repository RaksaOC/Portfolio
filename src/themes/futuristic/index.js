// Futuristic: cyan HUD rings and a holographic robot.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'futuristic',
  name: 'Futuristic',
  km: 'អនាគត',
  note: 'Cyan HUD rings and a holographic robot',
  fonts: 'family=IBM+Plex+Mono:wght@400;500;600', // Google Fonts query (Latin)
  kmFonts: { display: 'Kdam Thmor Pro', body: 'Nokora' },
  sw: { dark: ['#05090d', '#00e5ff', '#e0fbff'], light: ['#eef5f8', '#007c99', '#06202b'] }, // Settings swatches
  scene: {
    wire: { dark: 0x00e5ff, light: 0x007c99 },
    gridOpacity: 0.2,
    speed: 0.25,
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Floating Cities' },
  cursor,
}
