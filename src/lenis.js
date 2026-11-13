// Single smooth-scroll instance, shared so overlays can pause it.
import Lenis from 'lenis'

export const lenis = new Lenis({
  duration: 1.5, // slows down scroll
  smooth: true,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
