<template>
  <div id="bg-root" ref="rootRef">
    <canvas id="canvas" ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { prefs, intro } from '../prefs'
import { findLook } from '../themes/looks'
import { gfxActive } from '../gfx'
import { chat } from '../chat/chat'

const rootRef = ref(null)
const canvasRef = ref(null)

let cleanup = () => {}

const isDark = () => (document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark') === 'dark'
const NO_GLOBE = ['nature', 'greek', 'angkor', 'volcano', 'atomic', 'japan', 'desert', 'night-session']
const cssColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#0e0e0e'

onMounted(() => {
  const canvas = canvasRef.value
  const mobile = window.innerWidth < 978

  // Setup ------------------------------------------------------------------------------------------------
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  // Always fills the window. When the AI chat is docked the scene keeps running under the glass panel, but
  // its centre (vanishing point) moves to the middle of the page that's left: the camera frames the page
  // strip exactly as if the window were that narrow, and the view is extended to the right under the panel
  const root = rootRef.value
  const boxW = () => root.clientWidth || window.innerWidth
  const boxH = () => root.clientHeight || window.innerHeight
  let dockNow = 0 // eased panel width the projection is currently built for
  const project = () => {
    const w = boxW(), h = boxH()
    const page = Math.max(1, w - dockNow)
    camera.aspect = page / h
    if (dockNow > 0.5) camera.setViewOffset(page, h, 0, 0, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }
  project()
  renderer.setSize(boxW(), boxH())
  // Graphics setting caps the pixel ratio (render resolution)
  const applyResolution = () => renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, gfxActive.value.resolution))
  applyResolution()

  const onResize = () => {
    project()
    renderer.setSize(boxW(), boxH())
  }
  window.addEventListener('resize', onResize)
  const boxObserver = new ResizeObserver(onResize)
  boxObserver.observe(root)

  // Base objects -----------------------------------------------------------------------------------------
  const wireMaterials = []
  const wireMat = () => {
    const m = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.1 })
    wireMaterials.push(m)
    return m
  }

  // Infinite ground grid: two planes leapfrogging toward the camera
  const PLANE = 600
  const gridGeo = new THREE.PlaneGeometry(PLANE, PLANE, 40, 40)
  const gridMat = wireMat()
  // While the reload intro is picking a theme only the globe shows; the grid fades in with the theme
  const gridTarget = () => (intro.running && !look.id ? 0 : look.scene.gridOpacity)
  const planes = [0, -PLANE].map((z) => {
    const p = new THREE.Mesh(gridGeo, gridMat)
    p.rotation.x = -Math.PI / 2
    p.position.set(0, -40, z)
    scene.add(p)
    return p
  })

  // Wireframe sphere-in-cube props
  const props = []
  function sphereInCube(x, y, z) {
    const size = mobile ? 7 : 10
    const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), wireMat())
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(size / 2), wireMat())
    cube.position.set(x, y, z)
    sphere.position.set(x, y, z)
    scene.add(cube, sphere)
    props.push({ cube, sphere })
  }
  sphereInCube(0, 0, -20) // welcome screen
  sphereInCube(40, 25, 0) // hero
  sphereInCube(-40, 25, 0)

  // Night sky for the reload intro: while the reel is picking a theme the background goes pitch black and
  // a field of twinkling stars fades in around the camera; it fades away again as the theme is revealed.
  const STARS = mobile ? 900 : 2200
  const starPos = new Float32Array(STARS * 3)
  const starSize = new Float32Array(STARS)
  const starPhase = new Float32Array(STARS)
  for (let i = 0; i < STARS; i++) {
    // uniform over the whole sphere around the camera, so the sky is full edge to edge
    const u = Math.random() * 2 - 1
    const a = Math.random() * Math.PI * 2
    const r = 200 + Math.random() * 180
    const s = Math.sqrt(1 - u * u)
    starPos.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3)
    starSize[i] = Math.random() < 0.08 ? 3 + Math.random() * 1.5 : 1 + Math.random() * 1.6
    starPhase[i] = Math.random() * Math.PI * 2
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  starGeo.setAttribute('size', new THREE.BufferAttribute(starSize, 1))
  starGeo.setAttribute('phase', new THREE.BufferAttribute(starPhase, 1))
  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float size; attribute float phase; uniform float uTime; uniform float uPx; varying float vTw;
      void main() {
        vTw = 0.55 + 0.45 * sin(uTime * (1.2 + fract(phase * 3.7) * 2.2) + phase);
        gl_PointSize = size * uPx * (0.8 + 0.4 * vTw);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uOpacity; varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) + 0.15 * a, a * a * vTw * uOpacity);
      }`,
  })
  const stars = new THREE.Points(starGeo, starMat)
  stars.renderOrder = -1
  stars.frustumCulled = false
  stars.visible = false
  scene.add(stars)
  const BLACK = new THREE.Color(0x000000)

  // Look / theme --------------------------------------------------------------------------------------------
  let look = findLook(prefs.look)

  // Colours actually on screen; the intro reel eases these toward the theme it's passing
  const curBg = new THREE.Color()
  const curWire = new THREE.Color()
  const tmp = new THREE.Color()
  let darkNow = true

  function paint() {
    look = findLook(prefs.look)
    const dark = isDark()
    darkNow = dark
    const bg = new THREE.Color(cssColor('--dark'))
    curBg.copy(bg)
    curWire.setHex(look.scene.wire[dark ? 'dark' : 'light'])
    wireMaterials.forEach((m) => m.color.setHex(look.scene.wire[dark ? 'dark' : 'light']))
    // Themes with their own centrepiece (forest, temples, volcano) hide the centre globe
    props[0].cube.visible = props[0].sphere.visible = !NO_GLOBE.includes(look.id)
    scene.fog = new THREE.Fog(bg, 100, 300)
    renderer.setClearColor(bg, 1)
  }

  // Theme decor (lights, particles, models) --------------------------------------------------------------
  let decor = null
  let decorToken = 0
  async function setDecor() {
    const token = ++decorToken
    decor?.dispose()
    decor = null
    if (!look.id) return
    const { buildDecor } = await import('../themes/scenes.js')
    const built = await buildDecor(look.id, {
      scene,
      renderer,
      isDark: isDark(),
      mobile: mobile || gfxActive.value.lite,
      models: gfxActive.value.models,
      speed: () => look.scene.speed,
      look,
      cancelled: () => token !== decorToken,
    })
    if (token !== decorToken) return built?.dispose()
    decor = built
  }

  window.__bgStats = () => ({ decor: !!decor, look: look.id || 'monochrome' })

  // Re-style when the look or light/dark theme changes
  const refresh = () => requestAnimationFrame(() => { paint(); setDecor() }) // wait for CSS vars to update
  const themeObserver = new MutationObserver(refresh)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-look'] })
  const onStorage = (e) => { if (e.key === 'theme') refresh() }
  window.addEventListener('storage', onStorage)


  // The intro painted the sky black; when it ends, put the look's own background back (needed for Monochrome,
  // which doesn't change data-look so nothing else repaints it)
  const stopIntro = watch(() => intro.running, (running) => { if (!running) requestAnimationFrame(paint) })

  // Graphics changes: resolution applies live, models / lite rebuild the theme decor
  const stopGfx = watch(gfxActive, (g, old) => {
    applyResolution()
    if (!old || g.models !== old.models || g.lite !== old.lite) setDecor()
  })

  paint()
  gridMat.opacity = gridTarget()
  setDecor()

  // Camera eases back as the hero scrolls away
  const onScroll = () => {
    const y = window.scrollY
    camera.position.z = 5 + Math.min(y, 300) * 0.09
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  // Single render loop ------------------------------------------------------------------------------------
  const clock = new THREE.Clock()
  let raf = 0
  let pending = 0 // time since the last rendered frame, for the fps cap
  function animate() {
    raf = requestAnimationFrame(animate)
    const cap = gfxActive.value.fps
    pending += clock.getDelta()
    if (cap && pending < 1 / cap - 0.002) return
    const dt = Math.min(pending, 0.1)
    pending = 0
    const t = clock.elapsedTime
    const speed = look.scene.speed * 60 * dt

    // follow the docked chat panel (eased like its slide-in; instant-ish while its edge is dragged)
    const dockTarget = document.documentElement.classList.contains('chat-docked') ? chat.dockWidth : 0
    if (Math.abs(dockTarget - dockNow) > 0.5) {
      dockNow += (dockTarget - dockNow) * Math.min(1, dt * 14)
      project()
    } else if (dockNow !== dockTarget) {
      dockNow = dockTarget
      project()
    }

    gridMat.opacity += (gridTarget() - gridMat.opacity) * Math.min(1, dt * 2.5)
    // Reload intro: pitch-black starry sky while the reel spins, the globe tinted to the theme on the payline
    const night = intro.running && !look.id
    if (night) {
      const k = Math.min(1, dt * 3)
      curBg.lerp(BLACK, k)
      renderer.setClearColor(curBg, 1)
      scene.fog.color.copy(curBg)
      if (intro.preview != null) {
        const pv = findLook(intro.preview)
        curWire.lerp(tmp.setHex(pv.scene.wire[darkNow ? 'dark' : 'light']), Math.min(1, dt * 7))
        wireMaterials.forEach((m) => m.color.copy(curWire))
      }
    }
    const so = starMat.uniforms.uOpacity
    so.value += ((night ? 1 : 0) - so.value) * Math.min(1, dt * (night ? 1.5 : 2.5))
    stars.visible = so.value > 0.01
    if (stars.visible) {
      starMat.uniforms.uTime.value = t
      starMat.uniforms.uPx.value = renderer.getPixelRatio()
      stars.rotation.y = t * 0.006
    }
    planes.forEach((p) => { p.position.z += speed })
    planes.forEach((p, i) => {
      if (p.position.z > PLANE) p.position.z = planes[1 - i].position.z - PLANE
    })
    props.forEach(({ sphere, cube }) => {
      sphere.rotation.y -= 0.3 * dt
      sphere.rotation.z -= 0.3 * dt
      cube.rotation.x += 0.3 * dt
      cube.rotation.y += 0.3 * dt
    })
    decor?.update(dt, t)
    renderer.render(scene, camera)
  }
  animate()

  cleanup = () => {
    cancelAnimationFrame(raf)
    stopGfx()
    stopIntro()
    window.removeEventListener('resize', onResize)
    boxObserver.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('storage', onStorage)
    themeObserver.disconnect()
    decor?.dispose()
    starGeo.dispose()
    starMat.dispose()
    renderer.dispose()
  }
})

onUnmounted(() => cleanup())
</script>

<style>
#bg-root {
  position: fixed;
  inset: 0;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  background: var(--dark);
}


#canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: fade-background 0.2s ease forwards;
  opacity: 0;
}

@keyframes fade-background {
  from {
    background-color: #000000;
  }

  to {
    opacity: 1;
  }
}
</style>
