// Deep Ocean: abyss blue, light shafts and glowing jellyfish.
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'deep-ocean',
  name: 'Deep Ocean',
  km: 'មហាសមុទ្រជ្រៅ',
  note: 'Abyss blue, light shafts and glowing jellyfish',
  fonts: 'family=Lexend:wght@300;400;500;600;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kantumruy Pro', body: 'Kantumruy Pro' },
  sw: { dark: ['#020c18', '#2fd3e0', '#d9f3ff'], light: ['#e4f4fa', '#0b7f9a', '#062436'] }, // Settings swatches
  scene: {
    wire: { dark: 0x2fd3e0, light: 0x0b7f9a },
    gridOpacity: 0.12,
    speed: 0.07,
  },
  loadScene: () => import('./scene.js'),
  music: { src: music, title: 'Jellyfish in Space' },
  cursor,
}
