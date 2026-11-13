// Graphics quality: a 3-step preset (Performance / Optimal / Quality) or, with "Advanced" on, every
// knob set by hand. Drives the glass (GlassFilter.vue + CSS variables used in looks.css) and the 3D
// background (Background.vue). Saved per visitor in localStorage.
import { computed, reactive, watch, watchEffect } from 'vue'
import { engine } from './vendor/liquidglass/liquid-glass.js'

// The liquid-glass refraction is an SVG filter inside backdrop-filter. Only Chromium supports that, and
// on phones / tablets it's too heavy anyway. Everywhere else (every iOS browser is WebKit, Firefox,
// Android) glass is frosted only. This matters for correctness too: an unsupported url() inside the
// var()-based backdrop-filter makes the whole declaration invalid, i.e. no blur at all.
const isMobile = (() => {
  try {
    if (navigator.userAgentData?.mobile) return true
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPadOS reports as a Mac
  } catch { return false }
})()
export const canRefract = engine === 'blink' && !isMobile

export const LEVELS = ['performance', 'optimal', 'quality']

// refraction: liquid-glass SVG distortion on/off      strength: displacement amount (0-100)
// aberration: RGB split of the distortion (0-1)       blur: frost blur behind glass (px)
// edge: brightness of glass rims (0-0.3)              resolution: max 3D pixel ratio (0.5-2)
// fps: 3D frame cap (30 / 60 / 0 = display rate)      models: 3D models (cars, robot, ...)
// lite: fewer particles / scene objects
// (the real liquid-glass skill circles come only with the Quality preset, see Skill.vue)
export const PRESETS = {
  performance: { refraction: false, strength: 45, aberration: 0, blur: 4, edge: 0.1, resolution: 1, fps: 30, models: false, lite: true },
  optimal: { refraction: true, strength: 60, aberration: 0.5, blur: 2, edge: 0.12, resolution: 1.5, fps: 60, models: true, lite: false },
  quality: { refraction: true, strength: 70, aberration: 0.8, blur: 2, edge: 0.15, resolution: 2, fps: 0, models: true, lite: false },
}

const KEY = 'gfx'

function defaultLevel() {
  try {
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return 'performance'
  } catch { /* ignore */ }
  return 'optimal'
}

function load() {
  const base = { level: defaultLevel(), advanced: false, custom: { ...PRESETS.optimal } }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!saved) return base
    return {
      level: LEVELS.includes(saved.level) ? saved.level : base.level,
      advanced: !!saved.advanced,
      custom: { ...PRESETS.optimal, ...(saved.custom || {}) },
    }
  } catch {
    return base
  }
}

export const gfx = reactive(load())

/** The settings in effect right now (preset or hand-tuned). */
export const gfxActive = computed(() => (gfx.advanced ? gfx.custom : PRESETS[gfx.level]))

/** Turning Advanced on starts from whatever preset is selected, so nothing jumps. */
export function setAdvanced(on) {
  if (on && !gfx.advanced) gfx.custom = { ...PRESETS[gfx.level] }
  gfx.advanced = on
}

watch(gfx, (s) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage blocked */ }
}, { deep: true })

// Glass knobs -> CSS variables. --lg-url swaps the SVG distortion for a no-op filter when it's off,
// which also skips the (expensive) SVG filter pass entirely.
watchEffect(() => {
  const g = gfxActive.value
  const s = document.documentElement.style
  s.setProperty('--lg-url', g.refraction && canRefract ? 'url(#liquid-glass)' : 'saturate(1)')
  s.setProperty('--glass-blur', `${g.blur}px`)
  s.setProperty('--glass-edge', String(g.edge))
})
