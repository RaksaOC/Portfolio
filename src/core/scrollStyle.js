// How the Skills section moves, picked in Settings → Scroll style:
//   flat:   a plain sideways track with soft edges
//   curved: cards tilt, shrink and bend the background through their glass near the edges
//   ribbon: a floating 3D glass band that rotates as you scroll or drag
// (Experience always has its own distorted, shrinking edge: Experience.vue)
// `?scroll=flat|curved|ribbon` forces one, e.g. for comparing them.
import { ref, watch } from 'vue'

export const SCROLL_STYLES = ['flat', 'curved', 'ribbon']
const DEFAULT_STYLE = 'ribbon'

function initial() {
  try {
    const forced = new URLSearchParams(location.search).get('scroll')
    if (SCROLL_STYLES.includes(forced)) return forced
    const saved = localStorage.getItem('scrollStyle')
    if (SCROLL_STYLES.includes(saved)) return saved
  } catch { /* no URL / storage access */ }
  return DEFAULT_STYLE
}

export const scrollStyle = ref(initial())

watch(scrollStyle, (v) => {
  try { localStorage.setItem('scrollStyle', v) } catch { /* storage blocked */ }
})

export function setScrollStyle(v) {
  if (SCROLL_STYLES.includes(v)) scrollStyle.value = v
}
