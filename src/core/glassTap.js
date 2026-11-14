// Springy tap feedback for every glass surface, like the compact navbar: a ripple from the tap point
// plus a small rubber-band wobble. One delegated listener; listens to `click` (not pointerdown) so
// touch-scrolling across cards doesn't set them off.

// Glass surfaces (see the glass rule in themes/shared/base.css, plus the other frosted bits).
// The desktop navbar and the Experience progress pill have their own ripple.
const GLASS = [
  '.m-pill', '.project-card', '.bio-card', '.stats-card', '.tech-card', '.card-wrap', '.form', '.social',
  '.tab-wrapper button', '.tab-wrapper', '.bubble', '.request-cv .button', '.send-btn', '.emblem', '.orb',
  '.s-look', '.s-row', '.s-close', '.s-level', '.nav-links li', '.close-btn', '.arrow-btn', '.to-top', '.lb-btn', '.lb-thumb, .view-btn, .chat-fab, .chat-chip, .chat-send, .chat-pill',
].join(',')
const SKIP = 'input, textarea, select, lg-switch, lg-slider, .nav-bar, .pin-footer, .zoomable, .project-image'

const reduce = (() => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)') } catch { return { matches: false } }
})()

function ripple(el, x, y) {
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  let host = el.querySelector(':scope > .g-tap')
  if (!host) {
    host = document.createElement('span')
    host.className = 'g-tap'
    host.setAttribute('aria-hidden', 'true')
    el.appendChild(host)
  }
  const r = el.getBoundingClientRect()
  const dot = document.createElement('i')
  // keyboard "clicks" have no position: start from the middle
  const px = x || y ? x - r.left : r.width / 2
  const py = x || y ? y - r.top : r.height / 2
  dot.style.left = `${px}px`
  dot.style.top = `${py}px`
  // a soft ring roughly the element's size, capped so big cards only get a small local ripple
  dot.style.setProperty('--s', String(Math.min(26, Math.hypot(r.width, r.height) / 12)))
  host.appendChild(dot)
  dot.addEventListener('animationend', () => dot.remove(), { once: true })
}

function jelly(el) {
  const r = el.getBoundingClientRect()
  // small things wobble more than big cards
  const a = Math.min(0.08, 18 / Math.max(r.width, r.height, 1))
  el.animate(
    [
      { scale: '1 1' },
      { scale: `${1 + a} ${1 - a * 1.3}`, offset: 0.22 },
      { scale: `${1 - a * 0.6} ${1 + a * 0.9}`, offset: 0.42 },
      { scale: `${1 + a * 0.3} ${1 - a * 0.25}`, offset: 0.62 },
      { scale: '1 1' },
    ],
    { duration: 750, easing: 'ease-out' },
  )
}

export function initGlassTap() {
  document.addEventListener('click', (e) => {
    if (reduce.matches || !(e.target instanceof Element) || e.target.closest(SKIP)) return
    const el = e.target.closest(GLASS)
    if (!el) return
    ripple(el, e.clientX, e.clientY)
    jelly(el)
  }, true)
}
