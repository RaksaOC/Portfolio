// Desktop-width screens get the combined bottom-right corner dock (CornerDock.vue: Raksa AI, volume, back to
// top). Narrower screens keep the separate buttons (music bottom-right, back-to-top bottom-left, the AI pill
// in the mobile nav).
import { ref } from 'vue'

const mq = typeof matchMedia === 'function' ? matchMedia('(min-width: 1001px)') : null
export const dockDesktop = ref(!!mq?.matches)
mq?.addEventListener?.('change', (e) => { dockDesktop.value = e.matches })
