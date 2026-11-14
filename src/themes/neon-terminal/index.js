// Terminal: monospace, neon green and a scanline glow. (ported from study-hub)
import './theme.css'
import music from './music.m4a?url'
import cursor from './cursor.js'

export default {
  id: 'neon-terminal',
  name: 'Terminal',
  km: 'ស្ថានីយ',
  note: 'Monospace, neon green and a scanline glow',
  fonts: 'family=JetBrains+Mono:wght@400;500;700', // Google Fonts query (Latin)
  kmFonts: { display: 'Kdam Thmor Pro', body: 'Nokora' },
  sw: { dark: ['#0d0d0d', '#33ff66', '#e6ffe6'], light: ['#f2f4ef', '#118a3a', '#0d1a0d'] }, // Settings swatches
  scene: {
    wire: { dark: 0x33ff66, light: 0x118a3a },
    gridOpacity: 0.22,
    speed: 0.3,
    ambient: 'code', // flavour of the shared ambient scene
  },
  loadScene: () => import('../shared/scene/ambient.js'),
  music: { src: music, title: 'Brain Dance' },
  cursor,
}
