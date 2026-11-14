// Theme registry. A theme ("look") is a full visual identity picked in Settings: palette, fonts, card shapes,
// 3D background, cursor and music. Light / dark mode is separate (each theme has a day variant).
//
// Every theme lives in its own folder, self-contained:
//   themes/<id>/index.js   metadata (names, fonts, swatches, scene settings, music) - the only required file
//   themes/<id>/theme.css  palette + signature card / button shapes, scoped to :root[data-look="<id>"]
//   themes/<id>/scene.js   its own 3D scene (or it reuses shared/scene/ambient.js via `scene.ambient`)
//   themes/<id>/cursor.js  its mouse cursors (falls back to the default arrow / ring)
//   themes/<id>/music.m4a  its background track;  themes/<id>/models/  its 3D models
// Shared building blocks are in themes/shared/. To add a theme: make the folder and list it below.
//
// CSS order matters: shared base rules, then each theme, then the shared overrides (chat panel, headings).
import './shared/base.css'
import monochrome from './monochrome'
import nature from './nature'
import cyberpunk from './cyberpunk'
import futuristic from './futuristic'
import retro from './retro'
import readingRoom from './reading-room'
import gallery from './gallery'
import openHouse from './open-house'
import machined from './machined'
import deepLab from './deep-lab'
import neonPoster from './neon-poster'
import orbit from './orbit'
import nightSession from './night-session'
import frosted from './frosted'
import clay from './clay'
import popBlock from './pop-block'
import neonTerminal from './neon-terminal'
import brassWorks from './brass-works'
import greek from './greek'
import angkor from './angkor'
import deepOcean from './deep-ocean'
import volcano from './volcano'
import atomic from './atomic'
import japan from './japan'
import desert from './desert'
import './shared/overrides.css'

/** All themes, in their usual order (Monochrome, the original, first). */
export const LOOKS = [
  monochrome, nature, cyberpunk, futuristic, retro, readingRoom, gallery, openHouse, machined, deepLab,
  neonPoster, orbit, nightSession, frosted, clay, popBlock, neonTerminal, brassWorks, greek, angkor,
  deepOcean, volcano, atomic, japan, desert,
]

export function findLook(id) {
  return LOOKS.find((l) => l.id === id) || LOOKS[0]
}

/** The theme's name in the current language (Khmer names live in `km`). */
export function lookName(look, locale) {
  return locale === 'km' && look?.km ? look.km : look?.name
}

// Randomize odds per theme (core/prefs.js) and the Settings grid: Angkor is the house favourite, then the
// showpiece scenes (in this order) - together the "Featured" group - then the rest. Weights add up to 100
// (= % chance): Angkor 22, the 11 featured 65/11 (~5.9) each, each of the other 13 just 1.
const FAVOURITE = 'angkor'
const FEATURED = ['greek', 'japan', 'desert', 'deep-ocean', 'volcano', 'atomic', 'futuristic', 'retro', 'cyberpunk',
  'nature', 'night-session']
const tier = (id) => (id === FAVOURITE ? 0 : FEATURED.includes(id) ? 1 : 2)
export const LOOK_WEIGHTS = Object.fromEntries(LOOKS.map((l) => [l.id, [22, 65 / FEATURED.length, 1][tier(l.id)]]))

/** LOOKS sorted by that bias (favourite, featured in listed order, then the rest in their usual order). */
const LOOKS_BY_BIAS = LOOKS.map((l, i) => ({ l, i }))
  .sort((a, b) => tier(a.l.id) - tier(b.l.id)
    || (tier(a.l.id) === 1 ? FEATURED.indexOf(a.l.id) - FEATURED.indexOf(b.l.id) : a.i - b.i))
  .map(({ l }) => l)
/** The two Settings groups: Angkor + the showpieces on top, everything else below */
export const FEATURED_LOOKS = LOOKS_BY_BIAS.filter((l) => tier(l.id) < 2)
export const OTHER_LOOKS = LOOKS_BY_BIAS.filter((l) => tier(l.id) === 2)
