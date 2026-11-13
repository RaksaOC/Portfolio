// Looks = full visual themes (palette, type, 3D background), picked in Settings. Light/dark is separate.
// Pattern borrowed from study-hub/themes.js: a `data-look` attribute on <html> + a Google Font per look.
// Colours live in src/looks.css; the 3D side of each look lives in ./scenes.js.

export const LOOKS = [
  {
    id: '',
    name: 'Monochrome',
    km: 'ខ្មៅស',
    note: 'The original: white wireframes on ink',
    sw: { dark: ['#0e0e0e', '#ffffff', '#a0a0a0'], light: ['#afafaf', '#0e0e0e', '#303030'] },
    scene: { wire: { dark: 0xf9f1f1, light: 0x000000 }, gridOpacity: 0.1, speed: 0.2 },
  },
  {
    id: 'nature',
    name: 'Nature',
    km: 'ធម្មជាតិ',
    note: 'Forest dusk, fireflies and mountains on the horizon',
    fonts: 'family=Fraunces:opsz,wght@9..144,400;9..144,600',
    sw: { dark: ['#0b1a12', '#e8f3e6', '#7bd389'], light: ['#e6efdc', '#12301c', '#2f8f4e'] },
    scene: { wire: { dark: 0x7bd389, light: 0x1f6b3a }, gridOpacity: 0.16, speed: 0.12 },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    km: 'សាយប៊ឺផាំង',
    note: 'Neon rain, a wireframe skyline and flying traffic',
    fonts: 'family=Chakra+Petch:wght@400;500;600;700',
    sw: { dark: ['#0a0612', '#ff2bd6', '#00f0ff'], light: ['#f3ecff', '#b3008f', '#007c8a'] },
    scene: { wire: { dark: 0xff2bd6, light: 0xb3008f }, gridOpacity: 0.28, speed: 0.35 },
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    km: 'អនាគត',
    note: 'Cyan HUD rings and a holographic robot',
    fonts: 'family=IBM+Plex+Mono:wght@400;500;600',
    sw: { dark: ['#05090d', '#00e5ff', '#e0fbff'], light: ['#eef5f8', '#007c99', '#06202b'] },
    scene: { wire: { dark: 0x00e5ff, light: 0x007c99 }, gridOpacity: 0.2, speed: 0.25 },
  },
  {
    id: 'retro',
    name: 'Retro',
    km: 'រេត្រូ',
    note: 'Synthwave sunset with traffic racing down the grid',
    fonts: 'family=Space+Mono:wght@400;700',
    sw: { dark: ['#14002e', '#ff4fd8', '#ffd166'], light: ['#ffe9f6', '#c2187a', '#ff8a00'] },
    scene: { wire: { dark: 0xff4fd8, light: 0xc2187a }, gridOpacity: 0.4, speed: 0.6 },
  },
  // ---- Themes ported from study-hub (themes.js / themes.css); 3D side is a shared ambient scene ----
  {
    id: 'reading-room',
    name: 'Reading Room',
    km: 'បន្ទប់អាន',
    note: 'Warm paper, clay and serif headlines',
    from: 'study-hub',
    fonts: 'family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700',
    sw: { dark: ['#181715', '#cc785c', '#faf9f5'], light: ['#faf9f5', '#a9583e', '#141413'] },
    scene: { wire: { dark: 0xcc785c, light: 0xa9583e }, gridOpacity: 0.12, speed: 0.12, ambient: 'bokeh' },
  },
  {
    id: 'gallery',
    name: 'Quiet Gallery',
    km: 'វិចិត្រសាលស្ងាត់',
    note: 'Calm space, soft greys and one blue',
    from: 'study-hub',
    fonts: 'family=Inter:wght@400;500;600;700',
    sw: { dark: ['#000000', '#2997ff', '#ffffff'], light: ['#ffffff', '#0066cc', '#1d1d1f'] },
    scene: { wire: { dark: 0x2997ff, light: 0x0066cc }, gridOpacity: 0.08, speed: 0.1, ambient: 'bokeh' },
  },
  {
    id: 'open-house',
    name: 'Open House',
    km: 'ផ្ទះបើកចំហ',
    note: 'Friendly, rounded and a rosy welcome',
    from: 'study-hub',
    fonts: 'family=Inter:wght@400;500;600;700',
    sw: { dark: ['#181818', '#ff385c', '#f7f7f7'], light: ['#ffffff', '#e00b41', '#222222'] },
    scene: { wire: { dark: 0xff385c, light: 0xe00b41 }, gridOpacity: 0.1, speed: 0.15, ambient: 'shapes' },
  },
  {
    id: 'machined',
    name: 'Machined',
    km: 'ម៉ាស៊ីន',
    note: 'Square edges, heavy heads, thin body',
    from: 'study-hub',
    fonts: 'family=Inter:wght@300;400;700',
    sw: { dark: ['#1a2129', '#5a96ea', '#ffffff'], light: ['#ffffff', '#1c69d4', '#262626'] },
    scene: { wire: { dark: 0x5a96ea, light: 0x1c69d4 }, gridOpacity: 0.18, speed: 0.3, ambient: 'blocks' },
  },
  {
    id: 'deep-lab',
    name: 'Deep Lab',
    km: 'មន្ទីរពិសោធន៍',
    note: 'Austere research, forest dark and coral',
    from: 'study-hub',
    fonts: 'family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600;700',
    sw: { dark: ['#00211c', '#ff7759', '#ffffff'], light: ['#ffffff', '#e0553a', '#000000'] },
    scene: { wire: { dark: 0xff7759, light: 0xe0553a }, gridOpacity: 0.14, speed: 0.15, ambient: 'orbits' },
  },
  {
    id: 'neon-poster',
    name: 'Neon Poster',
    km: 'ផ្ទាំងនីអុង',
    note: 'Huge tight type and glowing colour cards',
    from: 'study-hub',
    fonts: 'family=Geist:wght@500;700&family=Inter:wght@400;500;600;700',
    sw: { dark: ['#090909', '#0099ff', '#ffffff'], light: ['#ffffff', '#0088e6', '#090909'] },
    scene: { wire: { dark: 0x0099ff, light: 0x0088e6 }, gridOpacity: 0.2, speed: 0.3, ambient: 'shapes' },
  },
  {
    id: 'orbit',
    name: 'Orbit',
    km: 'គន្លង',
    note: 'Warm stone, big curves and orange arcs',
    from: 'study-hub',
    fonts: 'family=Sofia+Sans:wght@400;500;700',
    sw: { dark: ['#141413', '#f37338', '#f3f0ee'], light: ['#f3f0ee', '#cf4500', '#141413'] },
    scene: { wire: { dark: 0xf37338, light: 0xcf4500 }, gridOpacity: 0.12, speed: 0.15, ambient: 'orbits' },
  },
  {
    id: 'night-session',
    name: 'Night Session',
    km: 'វគ្គពេលយប់',
    note: 'Dark room, green glow and pill buttons',
    from: 'study-hub',
    fonts: 'family=Figtree:wght@400;600;700',
    sw: { dark: ['#121212', '#1ed760', '#ffffff'], light: ['#ffffff', '#1aa34a', '#121212'] },
    scene: { wire: { dark: 0x1ed760, light: 0x1aa34a }, gridOpacity: 0.12, speed: 0.2, ambient: 'bars' },
  },
  {
    id: 'frosted',
    name: 'Frosted Glass',
    km: 'កញ្ចក់ព្រិល',
    note: 'Soft gradients, frosted cards and glossy buttons',
    from: 'study-hub',
    fonts: 'family=Inter:wght@400;500;600;700;800',
    sw: { dark: ['#000000', '#0a84ff', '#ffffff'], light: ['#f2f2f7', '#0071e3', '#000000'] },
    scene: { wire: { dark: 0x0a84ff, light: 0x0071e3 }, gridOpacity: 0.1, speed: 0.12, ambient: 'bokeh' },
  },
  {
    id: 'clay',
    name: 'Clay Play',
    km: 'ដីឥដ្ឋ',
    note: 'Pastel, puffy and soft like modelling clay',
    from: 'study-hub',
    fonts: 'family=Inter:wght@400;500;600;700',
    sw: { dark: ['#1f1b2a', '#ffb4a9', '#f6f2ff'], light: ['#f1edfb', '#d9796c', '#2e2a3a'] },
    scene: { wire: { dark: 0xffb4a9, light: 0xd9796c }, gridOpacity: 0.12, speed: 0.12, ambient: 'shapes' },
  },
  {
    id: 'pop-block',
    name: 'Pop Block',
    km: 'ប្លុកពណ៌',
    note: 'Thick outlines, candy colours and hard shadows',
    from: 'study-hub',
    fonts: 'family=Inter:wght@400;500;700;800',
    sw: { dark: ['#121214', '#ff6b6b', '#f7f7f7'], light: ['#fffbea', '#ff5252', '#111111'] },
    scene: { wire: { dark: 0xff6b6b, light: 0xff5252 }, gridOpacity: 0.25, speed: 0.35, ambient: 'blocks' },
  },
  {
    id: 'neon-terminal',
    name: 'Terminal',
    km: 'ស្ថានីយ',
    note: 'Monospace, neon green and a scanline glow',
    from: 'study-hub',
    fonts: 'family=JetBrains+Mono:wght@400;500;700',
    sw: { dark: ['#0d0d0d', '#33ff66', '#e6ffe6'], light: ['#f2f4ef', '#118a3a', '#0d1a0d'] },
    scene: { wire: { dark: 0x33ff66, light: 0x118a3a }, gridOpacity: 0.22, speed: 0.3, ambient: 'code' },
  },
  {
    id: 'brass-works',
    name: 'Brass Works',
    km: 'រោងលង្ហិន',
    note: 'Parchment, brass rivets and gaslight glow',
    from: 'study-hub',
    fonts: 'family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC',
    sw: { dark: ['#1a100a', '#d4893f', '#f5deb3'], light: ['#f3e2bd', '#a85f22', '#2b1a0e'] },
    scene: { wire: { dark: 0xd4893f, light: 0xa85f22 }, gridOpacity: 0.16, speed: 0.12, ambient: 'embers' },
  },
  // ---- Place / mood themes with their own 3D scenes (scenes.js) ----
  {
    id: 'greek',
    name: 'Greek',
    km: 'ក្រិក',
    note: 'Marble, Aegean blue and a temple on the hill',
    fonts: 'family=Cinzel:wght@500;700&family=Cormorant+Garamond:wght@400;500;600;700',
    sw: { dark: ['#0b1422', '#5aa0e6', '#f2efe6'], light: ['#f4f1e8', '#1f5fae', '#13233f'] },
    scene: { wire: { dark: 0x5aa0e6, light: 0x1f5fae }, gridOpacity: 0.14, speed: 0.14 },
  },
  {
    id: 'angkor',
    name: 'Angkor',
    km: 'អង្គរ',
    note: 'Temple gold at dawn over a jungle moat',
    fonts: 'family=Marcellus&family=Marcellus+SC',
    sw: { dark: ['#0c1414', '#e9b44c', '#f4e9d4'], light: ['#f3ead8', '#a8731a', '#1f2a26'] },
    scene: { wire: { dark: 0xe9b44c, light: 0xa8731a }, gridOpacity: 0.16, speed: 0.1 },
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    km: 'មហាសមុទ្រជ្រៅ',
    note: 'Abyss blue, light shafts and glowing jellyfish',
    fonts: 'family=Lexend:wght@300;400;500;600;700',
    sw: { dark: ['#020c18', '#2fd3e0', '#d9f3ff'], light: ['#e4f4fa', '#0b7f9a', '#062436'] },
    scene: { wire: { dark: 0x2fd3e0, light: 0x0b7f9a }, gridOpacity: 0.12, speed: 0.07 },
  },
  {
    id: 'volcano',
    name: 'Volcano',
    km: 'ភ្នំភ្លើង',
    note: 'Charcoal, ash and a mountain spitting lava',
    fonts: 'family=Bebas+Neue&family=Rubik:wght@400;500;600;700',
    sw: { dark: ['#120604', '#ff5a1f', '#ffe9dc'], light: ['#f7e7dc', '#c2410c', '#2a0f07'] },
    scene: { wire: { dark: 0xff5a1f, light: 0xc2410c }, gridOpacity: 0.2, speed: 0.22 },
  },
  {
    id: 'atomic',
    name: 'Atomic',
    km: 'អាតូម',
    note: 'Electric violet, orbiting electrons and drifting molecules',
    fonts: 'family=Orbitron:wght@500;700&family=Exo+2:wght@300;400;500;600;700',
    sw: { dark: ['#0a0b1e', '#8b7bff', '#e6e9ff'], light: ['#eef0ff', '#4b3fd6', '#14163a'] },
    scene: { wire: { dark: 0x8b7bff, light: 0x4b3fd6 }, gridOpacity: 0.18, speed: 0.18 },
  },
  {
    id: 'japan',
    name: 'Japan',
    km: 'ជប៉ុន',
    note: 'Dusk over Mount Fuji, a torii gate and falling sakura',
    fonts: 'family=Shippori+Mincho:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700',
    sw: { dark: ['#140f26', '#ff5d73', '#f7eaf3'], light: ['#f8eef3', '#c62f45', '#2a1733'] },
    scene: { wire: { dark: 0xb79cff, light: 0x6a4fb8 }, gridOpacity: 0.13, speed: 0.1 },
  },
  {
    id: 'desert',
    name: 'Desert',
    km: 'វាលខ្សាច់',
    note: 'Canyon rock, saguaro cacti and tumbleweeds on the sand',
    fonts: 'family=Rye&family=Arvo:wght@400;700',
    sw: { dark: ['#1b100b', '#f59a4a', '#fbe8cf'], light: ['#f7e4c3', '#c4571b', '#3b2213'] },
    scene: { wire: { dark: 0xf2b36b, light: 0xb4642a }, gridOpacity: 0.16, speed: 0.14 },
  },
]

// Randomize odds per theme (prefs.js) and the Settings grid: Angkor is the house favourite, then the
// showpiece scenes (in this order) — together the "Featured" group — then the rest. Weights add up to 100
// (= % chance): Angkor 22, the 11 featured 65/11 (~5.9) each, each of the other 13 just 1.
const FAVOURITE = 'angkor'
const FEATURED = ['greek', 'japan', 'desert', 'deep-ocean', 'volcano', 'atomic', 'futuristic', 'retro', 'cyberpunk',
  'nature', 'night-session']
const tier = (id) => (id === FAVOURITE ? 0 : FEATURED.includes(id) ? 1 : 2)
export const LOOK_WEIGHTS = Object.fromEntries(LOOKS.map((l) => [l.id, [22, 65 / FEATURED.length, 1][tier(l.id)]]))

/** LOOKS sorted by that bias (favourite, featured in listed order, then the rest in their usual order). */
export const LOOKS_BY_BIAS = LOOKS.map((l, i) => ({ l, i }))
  .sort((a, b) => tier(a.l.id) - tier(b.l.id)
    || (tier(a.l.id) === 1 ? FEATURED.indexOf(a.l.id) - FEATURED.indexOf(b.l.id) : a.i - b.i))
  .map(({ l }) => l)
/** The two Settings groups: Angkor + the showpieces on top, everything else below */
export const FEATURED_LOOKS = LOOKS_BY_BIAS.filter((l) => tier(l.id) < 2)
export const OTHER_LOOKS = LOOKS_BY_BIAS.filter((l) => tier(l.id) === 2)

export function findLook(id) {
  return LOOKS.find((l) => l.id === id) || LOOKS[0]
}

/** A look's heading (display) font from its Google Fonts query: the small-caps cut if it has one,
 *  else the first family. `spec` is the query part for that family (valid weights included). */
export function displayFont(look) {
  const fams = [...(look?.fonts || '').matchAll(/family=([^&]+)/g)].map((m) => ({
    spec: m[1],
    name: m[1].split(':')[0].replace(/\+/g, ' '),
  }))
  return fams.find((f) => / SC$/.test(f.name)) || fams[0] || null
}

/** CSS font-family for showing text in a look's heading font (null = the site default). */
export function displayFontCss(look) {
  const f = displayFont(look)
  return f ? `"${f.name}", var(--poppins)` : null
}

/** Load every look's heading font in one Google Fonts request, trimmed (`text=`) to the given
 *  characters so it stays tiny. Reuses the <link> with the same id. */
export function loadDisplayFonts(text, id) {
  const specs = new Map()
  LOOKS.forEach((l) => { const f = displayFont(l); if (f) specs.set(f.name, f.spec) })
  const chars = [...new Set(text)].join('')
  const href = `https://fonts.googleapis.com/css2?${[...specs.values()].map((sp) => `family=${sp}`).join('&')}&text=${encodeURIComponent(chars)}&display=swap`
  let link = document.getElementById(id)
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.getAttribute('href') !== href) link.setAttribute('href', href)
  return link
}

/** The look's name in the current language (Khmer names live in `km`). */
export function lookName(look, locale) {
  return locale === 'km' && look?.km ? look.km : look?.name
}

/** Font for a look's name in the current language: its Latin heading face, or in Khmer the look's
 *  Khmer display face (`kmFonts` = KM_FONTS from prefs.js). */
export function nameFontCss(look, locale, kmFonts) {
  if (locale === 'km') {
    const f = (kmFonts[look?.id || ''] || kmFonts['']).display
    return `"${f}", var(--km-body), sans-serif`
  }
  return displayFontCss(look)
}
