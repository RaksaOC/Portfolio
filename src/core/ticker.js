// One frame clock for every WebGL canvas (3D background, section icons, skill ribbon).
//
// Each canvas that changes forces the browser to re-composite the page, and every glass panel
// (backdrop-filter) over it is filtered again. Separate requestAnimationFrame loops drift apart: on a
// 120 Hz screen the background on even vsyncs and an icon on odd ones meant 120 full re-composites a
// second. Here they all draw on the same frames, under the Graphics fps cap (gfx.js; 0 = display rate).
import { gfxActive } from './gfx'

const subs = new Set()
let raf = 0
let last = 0
let pending = 0 // time since the last frame handed out, for the cap

function tick(now) {
  raf = subs.size ? requestAnimationFrame(tick) : 0
  if (!last) {
    // first frame after being idle: draw straight away, with no time step
    last = now
    pending = 0
    for (const fn of [...subs]) fn(0, now)
    return
  }
  pending += (now - last) / 1000
  last = now
  const cap = gfxActive.value.fps
  if (cap && pending < 1 / cap - 0.002) return
  const dt = Math.min(pending, 0.1)
  pending = 0
  for (const fn of [...subs]) fn(dt, now)
}

/** Call fn(dt, now) on every rendered frame until the returned function is called. */
export function onFrame(fn) {
  subs.add(fn)
  if (!raf) {
    last = 0
    raf = requestAnimationFrame(tick)
  }
  return () => subs.delete(fn)
}
