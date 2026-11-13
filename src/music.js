// Background music: one looping track per theme (look), crossfaded when the theme changes.
// Tracks live in public/music/<look id>.m4a (Monochrome = monochrome.m4a). Most are by Kevin MacLeod
// (incompetech.com), licensed CC BY 4.0; the exceptions are listed in CREDITS. Credited under the volume
// slider (MusicToggle.vue; TRACKS + CREDITS below are the source of truth).
//
// Browsers block sound until the visitor interacts with the page, so playback starts on the first
// click / tap / key press. Nothing plays during the reload intro; the theme's song fades in once it lands.
// Mute, volume and the on/off switch are remembered per visitor.
//
// Themes whose 3D background dances to the music (VISUAL below) route their track through a Web Audio
// analyser; sampleAudio() reads it once per frame. The element's volume is applied before the analyser, so
// the visuals shrink with the volume slider and go still when muted.
import { reactive, watch } from 'vue'
import { prefs, intro } from './prefs'

export const TRACKS = {
  '': 'Clean Soul',
  nature: 'Ascending the Vale',
  cyberpunk: 'Severe Tire Damage',
  futuristic: 'Floating Cities',
  retro: 'Newer Wave',
  'reading-room': 'Gymnopedie No 1',
  gallery: 'Dreamer',
  'open-house': 'Easy Lemon',
  machined: 'Industrial Cinematic',
  'deep-lab': 'Unwritten Return',
  'neon-poster': 'Laser Groove',
  orbit: 'Space Jazz',
  'night-session': 'Dream Catcher',
  frosted: 'Wallpaper',
  clay: 'Carefree',
  'pop-block': 'Blip Stream',
  'neon-terminal': 'Brain Dance',
  'brass-works': 'Industrial Revolution',
  greek: 'Teller of the Tales',
  angkor: 'Khmer Traditional Music',
  'deep-ocean': 'Jellyfish in Space',
  volcano: 'Volatile Reaction',
  atomic: 'Mesmerizing Galaxy',
  japan: 'Dreamer',
  desert: 'Teller of the Tales',
}

// Who made each track, for the line under the volume slider. Default: Kevin MacLeod, CC BY 4.0.
// angkor: a Khmer traditional piece supplied by the site owner (the downloaded file's name lost its Khmer vowel
// signs, so the exact title isn't recorded yet: set it in TRACKS); performer / licence not recorded yet either:
// fill in artist (and href / note) here once known.
const KEVIN = { artist: 'Kevin MacLeod', href: 'https://incompetech.com', note: 'Kevin MacLeod (incompetech.com) · CC BY 4.0' }
const CREDITS = {
  angkor: { artist: '', href: '', note: '' },
}
export const creditFor = (id) => CREDITS[id] || KEVIN

// Themes without their own file yet play another theme's track (TRACKS above names what's actually heard).
// Drop public/music/<id>.m4a in, remove the line here and set its title in TRACKS.
const SHARED_FILE = { japan: 'gallery', desert: 'greek' }

const FADE_MS = 900
// Master level: the tracks are mastered loud for background music, so the slider's 100% plays them at half
// their raw volume (everything below scales with it)
const MAX_GAIN = 0.5
const outVolume = () => music.volume * MAX_GAIN
const VISUAL = new Set(['night-session'])

const read = (key) => { try { return localStorage.getItem(key) } catch { return null } }
const write = (key, v) => { try { localStorage.setItem(key, v) } catch { /* storage blocked */ } }
const readVolume = () => {
  const v = Number(read('musicVolume'))
  return read('musicVolume') !== null && v >= 0 && v <= 1 ? v : 0.35
}

// enabled: the "Play music" switch (off = no music and no music button at all; back on from Settings)
// muted: the quick mute on the button. volume: 0..1 from the hover slider.
// playing: sound is actually coming out (false while waiting for the first interaction)
export const music = reactive({
  enabled: read('musicEnabled') !== 'off',
  muted: read('music') === 'off',
  volume: readVolume(),
  playing: false,
  title: '',
})

const src = (id) => `/music/${SHARED_FILE[id] || id || 'monochrome'}.m4a`

let current = null      // { el, id }
let unlocked = false    // the visitor has interacted, so play() is allowed

/* ---------- analyser for the music-reactive backgrounds ---------- */
let actx = null
let analyser = null
let spec = null         // dB per frequency bin
let wave = null         // time-domain samples
/** Per-frame audio reading: bands[] 0..1 (low → high, linear amplitude), level 0..1 (loudness), bass 0..1 */
export const audio = { bands: new Float32Array(32), level: 0, bass: 0, live: false }

function analyse(el) {
  if (el._src) return
  try {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)()
      analyser = actx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.78
      analyser.connect(actx.destination)
      spec = new Float32Array(analyser.frequencyBinCount)
      wave = new Float32Array(analyser.fftSize)
    }
    el._src = actx.createMediaElementSource(el)
    el._src.connect(analyser)
  } catch { /* no Web Audio: the background keeps its idle animation */ }
}

/** Fill `audio` from the analyser. Bands are spread logarithmically (more resolution in the bass). */
export function sampleAudio() {
  const on = !!(analyser && current?.el._src && music.playing && !current.el.paused)
  audio.live = on
  if (!on) {
    // ease back down to silence
    for (let i = 0; i < audio.bands.length; i++) audio.bands[i] *= 0.9
    audio.level *= 0.9
    audio.bass *= 0.9
    return audio
  }
  analyser.getFloatFrequencyData(spec)
  analyser.getFloatTimeDomainData(wave)
  const N = audio.bands.length
  const bins = spec.length
  const lo = 2, hi = Math.floor(bins * 0.7) // ~40 Hz .. ~15 kHz
  for (let b = 0; b < N; b++) {
    const a = Math.floor(lo * Math.pow(hi / lo, b / N))
    const z = Math.max(a + 1, Math.floor(lo * Math.pow(hi / lo, (b + 1) / N)))
    let sum = 0
    for (let k = a; k < z; k++) sum += Math.pow(10, spec[k] / 20) // dB → linear amplitude
    // higher bands carry less energy: tilt them up so the whole row moves
    const amp = (sum / (z - a) / MAX_GAIN) * (1 + b * 0.22) * 3.2
    audio.bands[b] = Math.min(1, Math.sqrt(amp))
  }
  let rms = 0
  for (let i = 0; i < wave.length; i++) rms += wave[i] * wave[i]
  audio.level = Math.min(1, (Math.sqrt(rms / wave.length) / MAX_GAIN) * 3.2)
  audio.bass = (audio.bands[0] + audio.bands[1] + audio.bands[2] + audio.bands[3]) / 4
  return audio
}

function fade(el, to, done) {
  const from = el.volume
  const start = performance.now()
  cancelAnimationFrame(el._fade)
  const step = (now) => {
    const k = Math.min(1, (now - start) / FADE_MS)
    el.volume = from + (to - from) * k
    if (k < 1) el._fade = requestAnimationFrame(step)
    else done?.()
  }
  el._fade = requestAnimationFrame(step)
}

function stopEl(el) {
  fade(el, 0, () => { el.pause(); el.removeAttribute('src'); el.load() })
}

/** The track that should be heard right now (null = silence). */
const wanted = () => (intro.running || !music.enabled || music.muted ? null : prefs.look)

function sync() {
  const id = wanted()
  if (id === null) {
    if (current) { const el = current.el; fade(el, 0, () => el.pause()) }
    music.playing = false
    if (current && current.id !== prefs.look) { stopEl(current.el); current = null }
    return
  }
  music.title = TRACKS[id] || ''
  if (!current || current.id !== id) {
    if (current) stopEl(current.el)
    const el = new Audio(src(id))
    el.loop = true
    el.preload = 'auto'
    el.volume = 0
    current = { el, id }
  }
  if (!unlocked || document.hidden) return
  const el = current.el
  // routed through Web Audio only once the visitor has interacted (a context made earlier starts suspended,
  // and a suspended context would silence the track)
  if (VISUAL.has(id)) analyse(el)
  if (actx?.state === 'suspended') actx.resume().catch(() => {})
  el.play().then(() => {
    // muted / theme changed while play() was pending: don't resurrect this track
    if (wanted() !== id || current?.el !== el) { el.pause(); return }
    music.playing = true
    fade(el, outVolume())
  }).catch(() => { music.playing = false })
}

export function setMuted(on) {
  music.muted = !!on
  write('music', on ? 'off' : 'on')
  unlocked = true // clicking the button counts as the interaction
  sync()
}
export const toggleMuted = () => setMuted(!music.muted)

export function setEnabled(on) {
  music.enabled = !!on
  write('musicEnabled', on ? 'on' : 'off')
  // switching music back on also un-mutes, so it's actually heard
  if (on && music.muted) { setMuted(false); return }
  unlocked = true
  sync()
}

/** Live volume from the slider (0..1). Dragging it up from muted un-mutes. */
export function setVolume(v) {
  music.volume = Math.max(0, Math.min(1, v))
  write('musicVolume', String(music.volume))
  if (music.volume > 0 && music.muted) { setMuted(false); return }
  if (current && music.playing) {
    cancelAnimationFrame(current.el._fade)
    current.el.volume = outVolume()
  }
}

// first interaction unlocks audio
const unlock = () => {
  if (unlocked) return
  unlocked = true
  sync()
  for (const ev of EVENTS) window.removeEventListener(ev, unlock, true)
}
const EVENTS = ['pointerdown', 'keydown', 'touchstart']
for (const ev of EVENTS) window.addEventListener(ev, unlock, true)

// background tab: pause, resume on return
document.addEventListener('visibilitychange', () => {
  if (!current) return
  if (document.hidden) { current.el.pause(); music.playing = false }
  else sync()
})

watch(() => [prefs.look, intro.running], sync, { immediate: true })
