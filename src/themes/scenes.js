// 3D "decor" for each theme (look), layered on top of the base wireframe grid in Background.vue.
// Loaded lazily (dynamic import) so the default monochrome site never ships GLTFLoader / models.
//
// Scene conventions (from Background.vue): camera at (0, 0, 5..32) looking down -Z, fov 90,
// ground grid at y = -40 scrolling toward the camera, fog fades everything out by ~300 units.

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { audio, sampleAudio } from '../music'

const GROUND = -40
const rand = (a, b) => a + Math.random() * (b - a)

let loader = null
function loadModel(url) {
  if (!loader) {
    const draco = new DRACOLoader()
    draco.setDecoderPath('/draco/')
    loader = new GLTFLoader()
    loader.setDRACOLoader(draco)
  }
  return loader.loadAsync(url)
}

let dotTex = null
function dotTexture() {
  if (dotTex) return dotTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.6)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  dotTex = new THREE.CanvasTexture(c)
  return dotTex
}

function useEnvironment(ctx) {
  const pmrem = new THREE.PMREMGenerator(ctx.renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  ctx.scene.environment = env
  pmrem.dispose()
  return () => {
    if (ctx.scene.environment === env) ctx.scene.environment = null
    env.dispose()
  }
}

function disposeTree(obj) {
  obj.traverse((o) => {
    o.geometry?.dispose?.()
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
    mats.forEach((m) => {
      for (const k in m) if (m[k]?.isTexture && m[k] !== dotTex) m[k].dispose()
      m.dispose()
    })
  })
}

function makeDecor(ctx) {
  const group = new THREE.Group()
  ctx.scene.add(group)
  const updaters = []
  const cleanups = []
  const mixers = []
  return {
    group,
    onUpdate: (fn) => updaters.push(fn),
    onDispose: (fn) => cleanups.push(fn),
    mixer(root) {
      const m = new THREE.AnimationMixer(root)
      mixers.push(m)
      return m
    },
    api: {
      update(dt, t) {
        mixers.forEach((m) => m.update(dt))
        updaters.forEach((fn) => fn(dt, t))
      },
      dispose() {
        mixers.forEach((m) => m.stopAllAction())
        ctx.scene.remove(group)
        disposeTree(group)
        cleanups.forEach((fn) => fn())
      },
    },
  }
}

// Glowing particles drifting in a box
function particles(ctx, { count, color, size, box, drift = 0.6, additive = true, opacity = 0.9 }) {
  const pos = new Float32Array(count * 3)
  const base = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    base[i * 3] = rand(box.x[0], box.x[1])
    base[i * 3 + 1] = rand(box.y[0], box.y[1])
    base[i * 3 + 2] = rand(box.z[0], box.z[1])
    phase[i] = Math.random() * Math.PI * 2
  }
  pos.set(base)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color, size, map: dotTexture(), transparent: true, opacity, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  const points = new THREE.Points(geo, mat)
  const update = (dt, t) => {
    for (let i = 0; i < count; i++) {
      const p = phase[i]
      pos[i * 3] = base[i * 3] + Math.sin(t * 0.3 + p) * drift * 3
      pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.7 + p * 2) * drift * 2
    }
    geo.attributes.position.needsUpdate = true
    mat.opacity = opacity * (0.75 + 0.25 * Math.sin(t * 2.1))
  }
  return { points, update }
}

// Sparks / embers rising and wrapping back to the ground
function risingSparks(ctx, { count, color, size = 1.6, box, speed = [4, 14], sway = 0.05 }) {
  const pos = new Float32Array(count * 3)
  const vel = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos.set([rand(box.x[0], box.x[1]), rand(box.y[0], box.y[1]), rand(box.z[0], box.z[1])], i * 3)
    vel[i] = rand(speed[0], speed[1])
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color, size, map: dotTexture(), transparent: true, depthWrite: false,
    blending: ctx.isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  const update = (dt, t) => {
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += vel[i] * dt
      pos[i * 3] += Math.sin(t + i) * sway
      if (pos[i * 3 + 1] > box.y[1]) pos[i * 3 + 1] = box.y[0]
    }
    geo.attributes.position.needsUpdate = true
  }
  return { points: new THREE.Points(geo, mat), update }
}

const wireMesh = (geo, color, opacity, fog = false) =>
  new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity, fog }))

// Scroll objects toward the camera with the grid and wrap them to the back
function scrollWithGrid(d, ctx, objs, wrapAt = 40, span = 340) {
  d.onUpdate((dt) => objs.forEach((o) => {
    o.position.z += ctx.speed() * 60 * dt
    if (o.position.z > wrapAt) o.position.z -= span
  }))
}

// ---------------------------------------------------------------- Nature
// Tree geometry variants (merged so each tree is one draw call)
function pineGeometry(h) {
  const parts = []
  const tiers = 3
  for (let i = 0; i < tiers; i++) {
    const th = h * (0.5 - i * 0.08)
    const cone = new THREE.ConeGeometry(h * (0.3 - i * 0.07), th, 7, 2)
    cone.translate(0, h * 0.25 + i * h * 0.22 + th / 2, 0)
    parts.push(cone)
  }
  const trunk = new THREE.CylinderGeometry(h * 0.03, h * 0.045, h * 0.3, 5)
  trunk.translate(0, h * 0.15, 0)
  parts.push(trunk)
  return mergeGeometries(parts.map((g) => g.toNonIndexed()))
}
function roundTreeGeometry(h) {
  const crown = new THREE.IcosahedronGeometry(h * 0.32, 1)
  const p = crown.attributes.position
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * rand(0.88, 1.12), p.getY(i) * rand(0.8, 1.05), p.getZ(i) * rand(0.88, 1.12))
  crown.translate(0, h * 0.68, 0)
  const crown2 = new THREE.IcosahedronGeometry(h * 0.2, 1)
  crown2.translate(h * 0.18, h * 0.5, h * 0.05)
  const trunk = new THREE.CylinderGeometry(h * 0.04, h * 0.06, h * 0.5, 5)
  trunk.translate(0, h * 0.25, 0)
  return mergeGeometries([crown, crown2, trunk].map((g) => g.toNonIndexed()))
}

// Mountain ridge: a strip of terrain whose height grows toward the back edge
function ridgeGeometry({ width, depth, height, seed, segX = 90, segZ = 10 }) {
  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ)
  geo.rotateX(-Math.PI / 2)
  const p = geo.attributes.position
  const peaks = Array.from({ length: 7 }, (_, i) => ({
    x: -width / 2 + (i + 0.5) * (width / 7) + rand(-40, 40),
    h: rand(0.55, 1), w: rand(60, 120),
  }))
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i)
    const back = 1 - (z + depth / 2) / depth // 1 at the far edge, 0 at the front
    let y = 0
    peaks.forEach((pk) => { y = Math.max(y, pk.h * Math.exp(-((x - pk.x) ** 2) / (2 * pk.w * pk.w))) })
    y += 0.12 * Math.sin(x * 0.045 + seed) + 0.06 * Math.sin(x * 0.13 + seed * 2)
    p.setY(i, Math.max(0, y) * height * Math.pow(back, 0.8) + rand(0, height * 0.03))
  }
  return geo
}

async function nature(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  d.group.add(new THREE.HemisphereLight(dark ? 0x9fd3ff : 0xe8f6ff, dark ? 0x10301a : 0x6b8f4e, dark ? 1.4 : 2.2))

  // Mountains at the end of the path; fog off so they stay visible past the grid
  const ranges = [
    { z: -330, width: 1000, depth: 90, height: 175, color: dark ? 0x2f6f63 : 0x5f8f7a, opacity: dark ? 0.45 : 0.5, seed: 1 },
    { z: -290, width: 820, depth: 70, height: 105, color: dark ? 0x3fa86a : 0x3f7a4e, opacity: dark ? 0.55 : 0.6, seed: 4 },
  ]
  ranges.forEach((r) => {
    const m = new THREE.Mesh(
      ridgeGeometry(r),
      new THREE.MeshBasicMaterial({ color: r.color, wireframe: true, transparent: true, opacity: r.opacity, fog: false }),
    )
    m.position.set(0, GROUND, r.z)
    d.group.add(m)
  })
  // Snow caps: pale points on the highest vertices of the far range
  {
    const far = d.group.children[d.group.children.length - 2].geometry.attributes.position
    const caps = []
    for (let i = 0; i < far.count; i++) if (far.getY(i) > ranges[0].height * 0.62) caps.push(far.getX(i), far.getY(i) + GROUND, far.getZ(i) + ranges[0].z)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(caps, 3))
    d.group.add(new THREE.Points(g, new THREE.PointsMaterial({
      color: dark ? 0xe8fff4 : 0xffffff, size: 2.2, map: dotTexture(), transparent: true, depthWrite: false, fog: false,
    })))
  }

  const flies = particles(ctx, {
    count: ctx.mobile ? 140 : 360,
    color: dark ? 0xd8ff7a : 0x4c8f2f,
    size: dark ? 1.4 : 1.1,
    box: { x: [-160, 160], y: [GROUND + 2, 35], z: [-260, 0] },
    additive: dark,
  })
  d.group.add(flies.points)
  d.onUpdate(flies.update)

  // Forest on both sides of a clear centre path, scrolling with the grid
  const pineMat = new THREE.MeshBasicMaterial({ color: dark ? 0x3fa86a : 0x2f7a46, wireframe: true, transparent: true, opacity: 0.32 })
  const leafMat = new THREE.MeshBasicMaterial({ color: dark ? 0x8fd16a : 0x4f8f2f, wireframe: true, transparent: true, opacity: 0.28 })
  const pines = [24, 30, 36, 42].map(pineGeometry)
  const rounds = [20, 26, 32].map(roundTreeGeometry)
  const trees = []
  const count = ctx.mobile ? 70 : 150
  for (let i = 0; i < count; i++) {
    const pine = Math.random() < 0.62
    const tree = new THREE.Mesh(pine ? pines[i % pines.length] : rounds[i % rounds.length], pine ? pineMat : leafMat)
    const side = i % 2 ? 1 : -1
    // denser near the path, thinning out to the sides
    const x = side * (30 + Math.pow(Math.random(), 1.6) * 170)
    tree.position.set(x, GROUND, rand(-300, 40))
    tree.rotation.y = rand(0, Math.PI * 2)
    tree.scale.setScalar(rand(0.75, 1.35))
    d.group.add(tree)
    trees.push(tree)
  }
  d.onUpdate((dt) => {
    trees.forEach((tr) => {
      tr.position.z += ctx.speed() * 60 * dt
      if (tr.position.z > 40) tr.position.z -= 340
    })
  })
  return d.api
}

// ---------------------------------------------------------------- Cyberpunk
async function cyberpunk(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const pink = dark ? 0xff2bd6 : 0xb3008f
  const cyan = dark ? 0x00f0ff : 0x007c8a
  d.group.add(new THREE.AmbientLight(dark ? 0x5b3cff : 0xffffff, dark ? 0.8 : 1.6))
  const l1 = new THREE.PointLight(pink, 4000, 260)
  l1.position.set(-60, 20, -120)
  const l2 = new THREE.PointLight(cyan, 4000, 260)
  l2.position.set(60, 30, -140)
  d.group.add(l1, l2)

  // Neon rain
  const N = ctx.mobile ? 500 : 1300
  const rain = new Float32Array(N * 6)
  for (let i = 0; i < N; i++) {
    const x = rand(-160, 160), y = rand(GROUND, 80), z = rand(-260, 0)
    rain.set([x, y, z, x, y - rand(2, 5), z], i * 6)
  }
  const rainGeo = new THREE.BufferGeometry()
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rain, 3))
  const rainMesh = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: dark ? 0.35 : 0.5 }))
  d.group.add(rainMesh)
  d.onUpdate((dt) => {
    const fall = 70 * dt
    for (let i = 0; i < N; i++) {
      const o = i * 6
      rain[o + 1] -= fall
      rain[o + 4] -= fall
      if (rain[o + 4] < GROUND) {
        const len = rain[o + 1] - rain[o + 4]
        rain[o + 1] = 80
        rain[o + 4] = 80 - len
      }
    }
    rainGeo.attributes.position.needsUpdate = true
  })

  // Wireframe skyline corridor scrolling toward the camera
  const towers = []
  for (let i = 0; i < (ctx.mobile ? 20 : 44); i++) {
    const w = rand(10, 26), h = rand(30, 150), dpt = rand(10, 26)
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, dpt))
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
      color: i % 3 ? pink : cyan, transparent: true, opacity: dark ? 0.55 : 0.7,
    }))
    const side = i % 2 ? 1 : -1
    line.position.set(side * rand(55, 150), GROUND + h / 2, rand(-300, 20))
    d.group.add(line)
    towers.push(line)
  }
  d.onUpdate((dt) => {
    towers.forEach((tw) => {
      tw.position.z += ctx.speed() * 60 * dt
      if (tw.position.z > 40) tw.position.z -= 340
    })
  })

  // Flying traffic: short light streaks crossing between the towers
  const cars = Array.from({ length: ctx.mobile ? 8 : 18 }, (_, i) => {
    const len = rand(6, 14)
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(len, 0, 0)])
    const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: i % 2 ? pink : 0xffd166, transparent: true, opacity: 0.9 }))
    line.userData = { v: rand(30, 70) * (i % 2 ? 1 : -1) }
    line.position.set(rand(-200, 200), rand(10, 70), rand(-260, -60))
    d.group.add(line)
    return line
  })
  d.onUpdate((dt) => {
    cars.forEach((c) => {
      c.position.x += c.userData.v * dt
      if (c.position.x > 220) c.position.x = -220
      if (c.position.x < -220) c.position.x = 220
    })
  })
  return d.api
}

// ---------------------------------------------------------------- Futuristic
async function futuristic(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const cyan = dark ? 0x00e5ff : 0x007c99
  const center = new THREE.Vector3(0, GROUND + 14, -75)

  // HUD rings orbiting the hologram
  const rings = [22, 29, 36].map((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.25, 6, 96),
      new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.55 - i * 0.12, wireframe: i === 2 }),
    )
    ring.position.copy(center)
    ring.rotation.x = Math.PI / 2 + i * 0.35
    d.group.add(ring)
    return ring
  })
  // Tick marks on the outer ring, like a HUD dial
  const ticks = new THREE.Group()
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const len = i % 4 ? 1.5 : 4
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(a) * 40, Math.sin(a) * 40, 0),
      new THREE.Vector3(Math.cos(a) * (40 + len), Math.sin(a) * (40 + len), 0),
    ])
    ticks.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.6 })))
  }
  ticks.position.copy(center)
  d.group.add(ticks)

  // Ground scanner pulse
  const pulse = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1, 96),
    new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  )
  pulse.rotation.x = -Math.PI / 2
  pulse.position.set(center.x, GROUND + 0.2, center.z)
  d.group.add(pulse)

  const data = particles(ctx, {
    count: ctx.mobile ? 150 : 360, color: cyan, size: 0.9,
    box: { x: [-140, 140], y: [GROUND, 50], z: [-240, -10] }, drift: 0.3, additive: dark,
  })
  d.group.add(data.points)

  d.onUpdate((dt, t) => {
    rings[0].rotation.z += dt * 0.6
    rings[1].rotation.z -= dt * 0.4
    rings[1].rotation.y = Math.sin(t * 0.5) * 0.3
    rings[2].rotation.z += dt * 0.2
    ticks.rotation.z -= dt * 0.15
    const k = (t * 0.45) % 1
    pulse.scale.setScalar(5 + k * 70)
    pulse.material.opacity = 0.6 * (1 - k)
    data.update(dt, t)
  })

  if (ctx.models) {
    const robot = await loadModel('/models/RobotExpressive.glb')
    if (ctx.cancelled()) return d.api
    const bot = robot.scene
    bot.scale.setScalar(7.5)
    bot.position.set(center.x, GROUND, center.z)
    // Hologram: wireframe + faint additive fill
    bot.traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshBasicMaterial({
          color: cyan, wireframe: true, transparent: true, opacity: dark ? 0.55 : 0.7,
          blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false,
        })
      }
    })
    const dance = robot.animations.find((a) => a.name === 'Dance') || robot.animations[0]
    d.mixer(bot).clipAction(dance).play()
    d.group.add(bot)
  }
  return d.api
}

// Low-poly neon car outline (side profile extruded across its width), nose toward +z
function wireCar(color, dark) {
  const profile = new THREE.Shape([
    [-2.3, 0.35], [-2.3, 0.85], [-1.2, 1.05], [-0.6, 1.6], [0.9, 1.6], [1.5, 1.05], [2.4, 0.9], [2.4, 0.35],
  ].map(([x, y]) => new THREE.Vector2(x, y)))
  const body = new THREE.ExtrudeGeometry(profile, { depth: 2, bevelEnabled: false })
  body.translate(0, 0, -1)
  body.rotateY(-Math.PI / 2) // length along z, nose (+x) → +z
  const group = new THREE.Group()
  const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 })
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(body, 20), lineMat))
  group.add(new THREE.Mesh(body, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: dark ? 0.12 : 0.2, depthWrite: false })))
  const wheels = []
  ;[[-1.05, 1.5], [1.05, 1.5], [-1.05, -1.4], [1.05, -1.4]].forEach(([x, z]) => {
    const w = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10).rotateZ(Math.PI / 2)), lineMat)
    w.position.set(x, 0.45, z)
    group.add(w)
    wheels.push(w)
  })
  // Headlights
  const lights = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.7, 0.7, 2.35), new THREE.Vector3(0.7, 0.7, 2.35)]),
    new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  group.add(lights)
  group.scale.setScalar(5.5)
  return [group, wheels]
}

// ---------------------------------------------------------------- Retro (synthwave)
async function retro(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark

  // Striped sunset sun (shader so the stripes can scroll)
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(80, 96),
    new THREE.ShaderMaterial({
      transparent: true,
      fog: false,
      uniforms: { uTime: { value: 0 }, uTop: { value: new THREE.Color(0xffd166) }, uBottom: { value: new THREE.Color(0xff2e88) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `
        varying vec2 vUv; uniform float uTime; uniform vec3 uTop; uniform vec3 uBottom;
        void main(){
          vec3 col = mix(uBottom, uTop, smoothstep(0.1, 0.95, vUv.y));
          float band = fract(vUv.y * 14.0 + uTime * 0.25);
          float gap = smoothstep(0.55, 0.0, vUv.y) * 0.75;
          if (vUv.y < 0.55 && band < gap) discard;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  )
  sun.position.set(0, 18, -285)
  d.group.add(sun)
  d.onUpdate((dt, t) => { sun.material.uniforms.uTime.value = t })

  // Solid floor under the grid so the sun sets "behind" the horizon
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.MeshBasicMaterial({ color: dark ? 0x0d0020 : 0xffd9ef }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = GROUND - 0.6
  d.group.add(floor)

  // Wireframe mountains on both sides of the road. The ridges are a smooth height field that rolls toward
  // the camera with the grid (slower: they're far away), so new peaks keep growing out of the ground at
  // the back and sinking at the front, and the whole range slowly breathes up and down.
  const mountMat = new THREE.MeshBasicMaterial({ color: dark ? 0x9d4dff : 0x8a2be2, wireframe: true, transparent: true, opacity: 0.7 })
  const ranges = [-1, 1].map((side) => {
    const geo = new THREE.PlaneGeometry(320, 110, 32, 11)
    geo.rotateX(-Math.PI / 2) // local z: -55 (far) .. 55 (near)
    const p = geo.attributes.position
    const edge = Float32Array.from({ length: p.count }, (_, i) =>
      1 - THREE.MathUtils.smoothstep(Math.abs(p.getX(i) + side * 160), 0, 160)) // tall by the road
    const ph = [rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)]
    const m = new THREE.Mesh(geo, mountMat)
    m.position.set(side * 230, GROUND, -200)
    d.group.add(m)
    return { p, edge, ph }
  })
  const ridge = (x, z, ph) => {
    const n = 0.5 * Math.sin(x * 0.045 + z * 0.02 + ph[0]) + 0.35 * Math.sin(z * 0.07 + x * 0.013 + ph[1])
      + 0.25 * Math.sin((x + z) * 0.11 + ph[2])
    return 18 + 62 * Math.pow(THREE.MathUtils.clamp((n + 1.1) / 2.2, 0, 1), 1.6)
  }
  let roll = 0
  const shapeRanges = (t) => ranges.forEach(({ p, edge, ph }) => {
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      // rise out of the ground over the back third, sink back down at the very front
      const zEnv = THREE.MathUtils.smoothstep(z, -55, -15) * (1 - 0.55 * THREE.MathUtils.smoothstep(z, 25, 55))
      const breathe = 0.82 + 0.18 * Math.sin(t * 0.7 + x * 0.025 + ph[0])
      p.setY(i, edge[i] * zEnv * breathe * ridge(x, z - roll, ph))
    }
    p.needsUpdate = true
  })
  shapeRanges(0)
  d.onUpdate((dt, t) => {
    roll += ctx.speed() * 60 * dt * 0.35
    shapeRanges(t)
  })

  const stars = particles(ctx, {
    count: ctx.mobile ? 120 : 300, color: dark ? 0xffffff : 0xc2187a, size: 0.8,
    box: { x: [-300, 300], y: [20, 140], z: [-290, -150] }, drift: 0.05, additive: dark,
  })
  d.group.add(stars.points)
  d.onUpdate(stars.update)

  // Traffic: cars on four lanes drive toward the camera at exactly the grid's speed.
  // Ferrari model faces +z (the camera) with rotation 0.
  const LANES = [-34, -13, 13, 34]
  const FAR = -300, NEAR = 30
  const cars = []
  const addCar = (obj, wheels = [], spinAxis = 'x') => {
    const lane = cars.length % LANES.length
    obj.userData.wheels = wheels
    obj.userData.spinAxis = spinAxis
    obj.position.set(LANES[lane], GROUND, 0)
    d.group.add(obj)
    cars.push(obj)
  }

  // Procedural neon wire cars (always available, no download)
  const neon = [0x00e5ff, 0xffd166, 0xff4fd8]
  const wireCount = ctx.models ? (ctx.mobile ? 1 : 2) : (ctx.mobile ? 3 : 5)
  for (let i = 0; i < wireCount; i++) addCar(...wireCar(neon[i % neon.length], dark))

  if (ctx.models) {
    d.onDispose(useEnvironment(ctx))
    d.group.add(new THREE.HemisphereLight(0xff9de2, 0x2a0a4a, 2))
    const [ferrari, truck] = await Promise.all([loadModel('/models/ferrari.glb'), loadModel('/models/CesiumMilkTruck.glb')])
    if (ctx.cancelled()) return d.api

    const base = ferrari.scene.children[0]
    const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.15 })
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x220033, metalness: 0.25, roughness: 0, transmission: 0.6 })
    const paints = ctx.mobile ? [0xff2e88, 0x00e5ff] : [0xff2e88, 0x00e5ff, 0xffd166, 0x9d4dff]
    paints.forEach((color) => {
      const car = base.clone()
      const body = car.getObjectByName('body')
      if (body) body.material = new THREE.MeshPhysicalMaterial({
        color, metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05,
        emissive: new THREE.Color(color).multiplyScalar(0.18),
      })
      ;['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl', 'trim'].forEach((n) => { const o = car.getObjectByName(n); if (o) o.material = chrome })
      const g = car.getObjectByName('glass')
      if (g) g.material = glass
      car.scale.setScalar(6)
      addCar(car, ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].map((n) => car.getObjectByName(n)).filter(Boolean))
    })

    // Milk truck (Z-up model with a baked rotation): wrap it so it faces the camera like the cars
    const t = truck.scene
    t.scale.setScalar(4.6)
    t.rotation.y = 0 // cab toward the camera
    const holder = new THREE.Group()
    holder.add(t)
    const box = new THREE.Box3().setFromObject(holder)
    t.position.y -= box.min.y // sit on the road
    const mixer = d.mixer(t)
    truck.animations.forEach((clip) => mixer.clipAction(clip).play())
    addCar(holder)
  }

  // Spread cars along the road, staggered per lane
  cars.forEach((c, i) => { c.position.z = FAR + ((i * 0.37) % 1) * (NEAR - FAR) })
  d.onUpdate((dt) => {
    const v = ctx.speed() * 60 * dt // same as the grid
    cars.forEach((c) => {
      c.position.z += v
      if (c.position.z > NEAR) {
        // respawn in the lane with the most room at the far end, so cars never overlap
        const room = (x) => Math.min(...cars.filter((o) => o !== c && o.position.x === x).map((o) => o.position.z - FAR), 999)
        const lane = [...LANES].sort((a, b) => room(b) - room(a) + rand(-10, 10))[0]
        c.position.set(lane, GROUND, FAR - rand(0, 40))
      }
      c.userData.wheels.forEach((w) => { w.rotation.x += v * 0.35 })
    })
  })
  return d.api
}

// ---------------------------------------------------------------- Ambient (themes ported from study-hub)
// One light-weight scene in the theme's accent colour; `look.scene.ambient` picks the flavour:
//   bokeh  - big soft lights drifting       shapes - floating wireframe solids
//   blocks - wire cubes riding the grid      orbits - huge rotating arcs on the horizon
//   bars   - equaliser bars pulsing          code   - falling terminal glyph streaks
//   embers - rising sparks + brass gears
async function ambient(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const look = ctx.look
  const color = new THREE.Color(look.scene.wire[dark ? 'dark' : 'light'])
  const kind = look.scene.ambient
  const n = (desk, mob) => (ctx.mobile ? mob : desk)

  const dust = particles(ctx, {
    count: n(220, 90), color, size: 0.8, drift: 0.25, additive: dark, opacity: 0.6,
    box: { x: [-200, 200], y: [GROUND, 90], z: [-280, -20] },
  })
  d.group.add(dust.points)
  d.onUpdate(dust.update)

  const lineMat = (o = 0.6) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? o : Math.min(1, o + 0.2) })
  const scroll = (objs, wrapAt = 40, span = 340) => d.onUpdate((dt) => objs.forEach((o) => {
    o.position.z += ctx.speed() * 60 * dt
    if (o.position.z > wrapAt) o.position.z -= span
  }))

  if (kind === 'bokeh') {
    const big = particles(ctx, {
      count: n(40, 18), color, size: 9, drift: 1.2, additive: dark, opacity: dark ? 0.35 : 0.25,
      box: { x: [-180, 180], y: [-10, 80], z: [-240, -60] },
    })
    d.group.add(big.points)
    d.onUpdate(big.update)
  }

  if (kind === 'shapes') {
    const geos = [new THREE.IcosahedronGeometry(6, 0), new THREE.OctahedronGeometry(6, 0), new THREE.TorusGeometry(5, 1.6, 6, 16), new THREE.SphereGeometry(5, 10, 8)]
    const shapes = Array.from({ length: n(16, 8) }, (_, i) => {
      const m = new THREE.LineSegments(new THREE.EdgesGeometry(geos[i % geos.length], 1), lineMat(0.7))
      const side = i % 2 ? 1 : -1
      m.position.set(side * rand(30, 150), rand(-10, 60), rand(-260, -40))
      m.scale.setScalar(rand(0.7, 1.8))
      m.userData = { spin: rand(0.2, 0.7), bob: Math.random() * 6, y: m.position.y }
      d.group.add(m)
      return m
    })
    d.onUpdate((dt, t) => shapes.forEach((m) => {
      m.rotation.x += m.userData.spin * dt
      m.rotation.y += m.userData.spin * 0.7 * dt
      m.position.y = m.userData.y + Math.sin(t * 0.6 + m.userData.bob) * 4
    }))
  }

  if (kind === 'blocks') {
    const cubes = Array.from({ length: n(40, 18) }, (_, i) => {
      const s = rand(6, 22)
      const m = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s * rand(0.6, 2.4), s)), lineMat(0.65))
      const side = i % 2 ? 1 : -1
      m.position.set(side * rand(35, 160), GROUND + (s * 0.6), rand(-300, 40))
      d.group.add(m)
      return m
    })
    scroll(cubes)
  }

  if (kind === 'orbits') {
    const arcs = [120, 160, 200].map((r, i) => {
      const pts = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * (1.1 + i * 0.25)).getPoints(160)
      const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.7 - i * 0.15))
      arc.position.set(0, GROUND + 10, -260)
      arc.rotation.x = -0.25 - i * 0.12
      arc.material.fog = false
      d.group.add(arc)
      return arc
    })
    const planet = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(38, 2), 1), lineMat(0.45))
    planet.material.fog = false
    planet.position.set(0, GROUND + 10, -270)
    d.group.add(planet)
    d.onUpdate((dt) => {
      arcs.forEach((a, i) => { a.rotation.z += dt * (0.08 + i * 0.05) * (i % 2 ? -1 : 1) })
      planet.rotation.y += dt * 0.05
    })
  }

  // Night Session: an equaliser that plays the theme's song (src/music.js routes it through an analyser).
  // The volume is applied before the analyser, so everything shrinks with the slider; muted / not started,
  // the bars fall back to a lazy idle bounce
  if (kind === 'bars') {
    const BANDS = audio.bands.length
    const bars = []
    const perSide = n(24, 12)
    ;[-1, 1].forEach((side) => {
      for (let i = 0; i < perSide; i++) {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: dark ? 0.55 : 0.7 })
        const bar = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), mat)
        bar.position.set(side * (40 + (i % 4) * 12), GROUND, -40 - Math.floor(i / 4) * 40)
        // nearest row = bass, further rows climb the spectrum; the outer columns take the higher half of each row
        bar.userData = { phase: Math.random() * 6, h: rand(10, 60), band: Math.floor((i / perSide) * BANDS), base: mat.opacity }
        d.group.add(bar)
        bars.push(bar)
      }
    })

    // a round equaliser on the horizon: spokes mirrored left / right, a ring that kicks with the bass
    const SPOKES = n(96, 64)
    const R = 40
    const spokePos = new Float32Array(SPOKES * 6)
    const spokeGeo = new THREE.BufferGeometry()
    spokeGeo.setAttribute('position', new THREE.BufferAttribute(spokePos, 3))
    const spokes = new THREE.LineSegments(spokeGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? 0.85 : 0.9, fog: false }))
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, k) => new THREE.Vector3(Math.cos((k / 96) * Math.PI * 2) * R, Math.sin((k / 96) * Math.PI * 2) * R, 0))),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? 0.7 : 0.8, fog: false }),
    )
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTexture(), color, transparent: true, opacity: 0, depthWrite: false, fog: false,
      blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
    }))
    halo.scale.set(R * 4, R * 4, 1)
    const eq = new THREE.Group()
    eq.add(halo, ring, spokes)
    eq.position.set(0, GROUND + 84, -250)
    d.group.add(eq)

    let mix = 0 // 0 idle .. 1 following the music, eased so mute / unmute doesn't jump
    let kick = 0
    d.onUpdate((dt, t) => {
      const a = sampleAudio()
      mix += ((a.live ? 1 : 0) - mix) * Math.min(1, dt * 3)
      kick = Math.max(a.bass, kick - dt * 1.8)
      for (const b of bars) {
        const u = b.userData
        const idle = 2 + u.h * 0.6 * (0.5 + 0.5 * Math.abs(Math.sin(t * 2.4 + u.phase)))
        const live = 2 + a.bands[u.band] * 52
        const h = idle * (1 - mix) + live * mix
        b.scale.y = h
        b.position.y = GROUND + h / 2
        b.material.opacity = Math.min(1, u.base + 0.4 * a.bands[u.band] * mix)
      }
      for (let k = 0; k < SPOKES; k++) {
        const ang = (k / SPOKES) * Math.PI * 2 + Math.PI / 2
        // mirrored: the bass sits at the top and bottom of the ring, highs at the sides
        const m = k < SPOKES / 2 ? k : SPOKES - k
        const band = Math.min(BANDS - 1, Math.floor((m / (SPOKES / 2)) * BANDS * 0.85))
        const idle = 1.5 + 1.5 * Math.abs(Math.sin(t * 1.6 + k * 0.4))
        const len = idle * (1 - mix) + (1 + a.bands[band] * 26) * mix
        const r0 = R + 2 + kick * 4 * mix
        const c = Math.cos(ang), s = Math.sin(ang)
        spokePos.set([c * r0, s * r0, 0, c * (r0 + len), s * (r0 + len), 0], k * 6)
      }
      spokeGeo.attributes.position.needsUpdate = true
      const pulse = 1 + kick * 0.14 * mix
      ring.scale.setScalar(pulse)
      ring.rotation.z += dt * 0.1
      halo.material.opacity = (dark ? 0.12 : 0.1) + (dark ? 0.45 : 0.3) * a.level * mix
      halo.scale.setScalar(R * 4 * (1 + kick * 0.3 * mix))
      dust.points.material.size = 0.8 * (1 + kick * 1.2 * mix)
    })
  }

  if (kind === 'code') {
    const N = n(700, 300)
    const pos = new Float32Array(N * 6)
    const speed = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const x = rand(-170, 170), y = rand(GROUND, 90), z = rand(-260, -10), len = rand(1, 4)
      pos.set([x, y, z, x, y - len, z], i * 6)
      speed[i] = rand(20, 60)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    d.group.add(new THREE.LineSegments(geo, lineMat(0.55)))
    d.onUpdate((dt) => {
      for (let i = 0; i < N; i++) {
        const o = i * 6, f = speed[i] * dt
        pos[o + 1] -= f
        pos[o + 4] -= f
        if (pos[o + 4] < GROUND) { const len = pos[o + 1] - pos[o + 4]; pos[o + 1] = 90; pos[o + 4] = 90 - len }
      }
      geo.attributes.position.needsUpdate = true
    })
  }

  if (kind === 'embers') {
    const sparks = risingSparks(ctx, { count: n(260, 110), color, box: { x: [-180, 180], y: [GROUND, 90], z: [-260, -20] } })
    d.group.add(sparks.points)
    d.onUpdate(sparks.update)
    // brass gears on the horizon
    const gearShape = (r, teeth) => {
      const pts = []
      for (let i = 0; i <= teeth * 4; i++) {
        const a = (i / (teeth * 4)) * Math.PI * 2
        const rr = i % 4 < 2 ? r : r * 0.84
        pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0))
      }
      return new THREE.BufferGeometry().setFromPoints(pts)
    }
    const gears = [[-70, 30, 34, 14], [-25, 5, 20, 10], [80, 40, 40, 16]].map(([x, y, r, t]) => {
      const g = new THREE.Line(gearShape(r, t), lineMat(0.55))
      g.material.fog = false
      g.position.set(x, y, -250)
      d.group.add(g)
      return g
    })
    d.onUpdate((dt) => gears.forEach((g, i) => { g.rotation.z += dt * (i % 2 ? -0.3 : 0.2) }))
  }

  return d.api
}

// Buildings are wireframes, so the mountains / grid behind would show through them. A depth-only twin
// (draws nothing, writes depth, pushed back a hair so the building's own front lines still pass) makes
// the building hide whatever is behind it - and its own back edges, for a cleaner silhouette.
const occluderMat = new THREE.MeshBasicMaterial({
  colorWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2,
})
function occlude(group) {
  const meshes = []
  group.traverse((o) => { if (o.isMesh) meshes.push(o) })
  meshes.forEach((m) => {
    const o = new THREE.Mesh(m.geometry, occluderMat)
    o.position.copy(m.position)
    o.rotation.copy(m.rotation)
    o.scale.copy(m.scale)
    o.renderOrder = -1
    m.parent.add(o)
  })
}

// ---------------------------------------------------------------- Greek
// Wireframe Parthenon on the horizon, a broken colonnade along the path, drifting gold dust
function greekTemple(color, opacity) {
  const g = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity, fog: false })
  // three-step stylobate
  for (let i = 0; i < 3; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(150 - i * 8, 4, 70 - i * 8, 15, 1, 6), mat)
    step.position.y = 2 + i * 4
    g.add(step)
  }
  const base = 12
  const colH = 46
  const col = new THREE.CylinderGeometry(2.4, 2.9, colH, 12, 3, true) // 12 flutes
  const capital = new THREE.BoxGeometry(7, 2.2, 7)
  const addCol = (x, z) => {
    const c = new THREE.Mesh(col, mat)
    c.position.set(x, base + colH / 2, z)
    const cap = new THREE.Mesh(capital, mat)
    cap.position.set(x, base + colH + 1.1, z)
    g.add(c, cap)
  }
  for (let i = 0; i < 8; i++) for (const z of [-25, 25]) addCol(-59 + i * (118 / 7), z)
  for (let j = 1; j < 4; j++) for (const x of [-59, 59]) addCol(x, -25 + j * 12.5)
  // entablature + pediment
  const top = base + colH + 2.2
  const ent = new THREE.Mesh(new THREE.BoxGeometry(128, 9, 60, 16, 1, 6), mat)
  ent.position.y = top + 4.5
  g.add(ent)
  const tri = new THREE.Shape()
  tri.moveTo(-66, 0)
  tri.lineTo(66, 0)
  tri.lineTo(0, 17)
  tri.closePath()
  const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 62, bevelEnabled: false, curveSegments: 1 }), mat)
  ped.position.set(0, top + 9, -31)
  g.add(ped)
  return g
}

async function greek(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const accent = ctx.look.scene.wire[dark ? 'dark' : 'light']
  const marble = dark ? 0xe8e4d8 : 0x2a3a58

  const temple = greekTemple(marble, dark ? 0.32 : 0.4)
  temple.scale.setScalar(1.5)
  temple.position.set(0, GROUND, -285)
  occlude(temple)
  d.group.add(temple)
  // hills behind it
  const hill = wireMesh(ridgeGeometry({ width: 900, depth: 80, height: 70, seed: 2 }), accent, dark ? 0.25 : 0.3)
  hill.position.set(0, GROUND, -340)
  d.group.add(hill)

  // ruins on the plain: fallen drums, stone blocks, amphorae and statues on plinths, olive trees
  const stoneMat = new THREE.MeshBasicMaterial({ color: marble, wireframe: true, transparent: true, opacity: dark ? 0.24 : 0.3 })
  const oliveMat = new THREE.MeshBasicMaterial({ color: dark ? 0x9fb88a : 0x5a7a4a, wireframe: true, transparent: true, opacity: dark ? 0.26 : 0.32 })
  const amphora = new THREE.LatheGeometry([
    [0.01, 0], [1.6, 0.3], [2.6, 2.5], [3, 5], [2.4, 7.5], [1.1, 8.6], [1, 10.2], [1.6, 10.6],
  ].map(([x, y]) => new THREE.Vector2(x, y)), 10)
  const statue = mergeGeometries([
    new THREE.CylinderGeometry(1.5, 2.6, 11, 8).translate(0, 5.5, 0), // draped body
    new THREE.CylinderGeometry(1.2, 1.5, 4, 8).translate(0, 12.5, 0), // torso
    new THREE.SphereGeometry(1.3, 8, 6).translate(0, 15.6, 0), // head
  ].map((g) => g.toNonIndexed()))
  const props = []
  const place = (mesh, i, total, near = 26, far = 130) => {
    const side = i % 2 ? 1 : -1
    mesh.position.x = side * rand(near, far)
    mesh.position.z = -300 + (i / total) * 340 + rand(-6, 6)
    d.group.add(mesh)
    props.push(mesh)
  }
  const nProps = ctx.mobile ? 10 : 22
  for (let i = 0; i < nProps; i++) {
    const kind = i % 4
    if (kind === 0) { // fallen column drum
      const len = rand(8, 18)
      const m = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, len, 12, 1), stoneMat)
      m.rotation.set(0, rand(0, Math.PI), Math.PI / 2)
      m.position.y = GROUND + 2.4
      place(m, i, nProps)
    } else if (kind === 1) { // block (+ maybe a second on top)
      const m = new THREE.Mesh(new THREE.BoxGeometry(rand(5, 9), rand(3, 5), rand(4, 7)), stoneMat)
      m.rotation.y = rand(0, Math.PI)
      m.position.y = GROUND + 2
      place(m, i, nProps)
    } else { // plinth with an amphora or a statue
      const g = new THREE.Group()
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 6), stoneMat)
      plinth.position.y = 2.5
      const top = new THREE.Mesh(kind === 2 ? amphora : statue, stoneMat)
      top.position.y = 5
      g.add(plinth, top)
      g.position.y = GROUND
      g.rotation.y = rand(0, Math.PI)
      place(g, i, nProps)
    }
  }
  const olives = [18, 22, 26].map(roundTreeGeometry)
  const nOlive = ctx.mobile ? 8 : 16
  for (let i = 0; i < nOlive; i++) {
    const t = new THREE.Mesh(olives[i % 3], oliveMat)
    t.position.y = GROUND
    t.rotation.y = rand(0, Math.PI * 2)
    t.scale.set(rand(1, 1.3), rand(0.7, 0.9), rand(1, 1.3)) // squat and wide like an olive
    place(t, i + 1, nOlive, 60, 170)
  }
  scrollWithGrid(d, ctx, props)

  // broken columns lining the path
  const colMat = new THREE.MeshBasicMaterial({ color: marble, wireframe: true, transparent: true, opacity: dark ? 0.26 : 0.32 })
  const cols = []
  const count = ctx.mobile ? 16 : 30
  for (let i = 0; i < count; i++) {
    const h = rand(10, 34)
    const c = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, h, 12, 2, true), colMat)
    const side = i % 2 ? 1 : -1
    c.position.set(side * rand(34, 120), GROUND + h / 2, -300 + (i / count) * 340)
    c.rotation.z = rand(-0.06, 0.06)
    d.group.add(c)
    cols.push(c)
  }
  scrollWithGrid(d, ctx, cols)

  const dust = particles(ctx, {
    count: ctx.mobile ? 120 : 260, color: dark ? 0xf0d58a : 0xb08a2e, size: 0.9, drift: 0.5, additive: dark, opacity: 0.7,
    box: { x: [-180, 180], y: [GROUND, 80], z: [-280, -10] },
  })
  d.group.add(dust.points)
  d.onUpdate(dust.update)
  return d.api
}

// ---------------------------------------------------------------- Angkor
// Angkor Wat in wireframe: stepped terraces, five lotus-bud towers (quincunx), its reflection in the moat,
// a sunrise disc behind it, a flagstone causeway with balustrades, sugar palms and grass along it, fireflies.
// Angkor Wat, front (west) view, built as architecture rather than blocks: a stepped plinth, three rising
// tiers of colonnaded galleries under stepped roofs, a main entrance gate (gopura) with layered pediments
// and stairs, the cruciform Terrace of Honour in front, and the five lotus-bud towers of the quincunx on the
// top tier. Everything is merged into one solid (drawn as a faint fill + depth-only occluder) and its crisp
// edges (EdgesGeometry), so the hidden lines drop out and the carving reads as layers. Front = +z.
function prasatGeometry(h, r, tiers = 12) {
  // lotus-bud spire: a slight swell then a taper to a point, built from ledged tiers; 8 sides turned so a
  // flat face looks forward, which gives each tier a crisp ring and the corners their ribs
  // full and rounded like the real lotus buds: stays wide for most of its height, then curves in to the tip
  const prof = (t) => r * (1 + 0.14 * Math.sin(Math.PI * t * 0.8)) * (1 - Math.pow(t, 1.6))
  const pts = [new THREE.Vector2(r * 1.08, 0)]
  for (let i = 0; i < tiers; i++) {
    const t0 = i / tiers
    const t1 = (i + 0.62) / tiers
    const t2 = (i + 0.78) / tiers
    pts.push(
      new THREE.Vector2(prof(t0) * 1.04, h * t0 + 0.01),
      new THREE.Vector2(prof(t0) * 0.9, h * t1),
      new THREE.Vector2(prof(t0) * 0.97, h * t2),  // little carved band near each ledge
      new THREE.Vector2(prof((i + 1) / tiers) * 1.04, h * ((i + 1) / tiers) - 0.01),
    )
  }
  pts.push(new THREE.Vector2(r * 0.1, h * 1.0), new THREE.Vector2(r * 0.04, h * 1.06), new THREE.Vector2(0.001, h * 1.1))
  return new THREE.LatheGeometry(pts, 8, Math.PI / 8).toNonIndexed()
}

function angkorTemple() {
  const parts = []        // solid pieces (merged into one geometry)
  const box = (w, h, d, x, y, z) => parts.push(new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z).toNonIndexed())
  const col = (x, y, z, h, r = 0.55) => parts.push(new THREE.CylinderGeometry(r * 0.85, r, h, 6).translate(x, y + h / 2, z).toNonIndexed())
  // gable (fronton) with the curled-up ends of Khmer pediments, as a thin slab facing the front
  const gable = (w, h, x, y, z) => {
    const sh = new THREE.Shape()
    sh.moveTo(-w / 2 - 1.2, 1.2)
    sh.quadraticCurveTo(-w / 2, 0, -w / 2 + 1, 0.4)
    sh.quadraticCurveTo(-w * 0.18, h * 0.55, 0, h)
    sh.quadraticCurveTo(w * 0.18, h * 0.55, w / 2 - 1, 0.4)
    sh.quadraticCurveTo(w / 2, 0, w / 2 + 1.2, 1.2)
    sh.lineTo(w / 2 + 0.6, -0.4)
    sh.lineTo(-w / 2 - 0.6, -0.4)
    parts.push(new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: false, curveSegments: 6 }).translate(x, y, z).toNonIndexed())
  }
  // stepped roof over a gallery strip: three slabs narrowing to the ridge
  const roof = (w, d, x, y, z) => {
    box(w + 2, 1, d + 2, x, y, z)
    box(w, 1.6, d * 0.72, x, y + 1, z)
    box(w - 3, 1.2, d * 0.4, x, y + 2.6, z)
  }
  // a gallery strip along the front of a tier: wall, outer colonnade, stepped roof
  const gallery = (w, h, d, y, zFront, step = 5.5) => {
    box(w, h, d, 0, y, zFront - d / 2)
    for (let x = -w / 2 + 2; x <= w / 2 - 2; x += step) col(x, y, zFront + 2.2, h - 0.6)
    box(w, 0.8, 4.4, 0, y + h - 0.8, zFront + 2.2)            // architrave over the columns
    roof(w, d + 4, 0, y + h, zFront - d / 2 + 2)
  }
  // a porch / gate pavilion projecting from a gallery: body, door frame, columns, layered pediments
  const porch = (w, h, d, y, zFront, layers) => {
    box(w, h, d, 0, y, zFront - d / 2)
    box(w * 0.36, h * 0.7, 0.6, 0, y, zFront + 0.3)            // door surround
    box(w * 0.24, h * 0.58, 0.8, 0, y, zFront + 0.5)           // door
    for (const x of [-w / 2 + 1.4, -w * 0.26, w * 0.26, w / 2 - 1.4]) col(x, y, zFront + 1.6, h - 0.4, 0.7)
    box(w + 1.5, 1, 3.2, 0, y + h - 0.2, zFront + 1.2)
    layers.forEach(([gw, gh, dy, dz], i) => gable(gw, gh, 0, y + h + dy, zFront + 1 - dz - i * 0.01))
  }
  const stairs = (w, h, steps, zFrom, zTo, y = 0) => {
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      box(w - i * 0.15, h / steps * (i + 1), (zFrom - zTo) / steps, 0, y, zFrom - (zFrom - zTo) * (t + 0.5 / steps))
    }
  }

  // the base: a tall stone terrace (laterite core faced in sandstone) rising in moulded courses, its face
  // carved into panels between pilasters; a central bastion carries the broad main stair, with guardian lions
  // on the stair landings and a balustrade along the top edge in front of the gallery
  box(254, 1.6, 176, 0, 0, 0)                                    // footing
  box(250, 1.2, 172, 0, 1.6, 0)
  box(246, 4.4, 168, 0, 2.8, 0)                                  // carved course
  box(250, 1.1, 172, 0, 7.2, 0)                                  // cornice
  box(252, 1.4, 174, 0, 8.3, 0)                                  // coping
  const T1 = 9.7
  // pilasters and carved panels along the front face (sculpture reads as their raised relief)
  for (let x = -120; x <= 120; x += 8) {
    if (Math.abs(x) < 26) continue
    box(1.3, 4.4, 0.9, x, 2.8, 84.4)
    box(4.6, 2.6, 0.45, x + 4, 3.7, 84.2)                         // relief panel between pilasters
  }
  // central bastion with the stair cut into it, stepped cheek walls and lions on each landing
  box(46, T1, 14, 0, 0, 91)
  box(48, 1.2, 15, 0, T1 - 1.2, 91)
  stairs(20, T1, 12, 116, 98)
  for (const sx of [-1, 1]) {
    const cx = sx * 12.5
    box(4.2, T1 * 0.62, 7, cx, 0, 110.5)                         // lower cheek
    box(4.2, T1, 7.5, cx, 0, 102.5)                              // upper cheek
    const lion = (y, z) => {
      box(2.2, 0.8, 3.4, cx, y, z)                               // pedestal
      box(1.8, 1.6, 2.6, cx, y + 0.8, z - 0.2)                   // haunches
      box(1.6, 2.2, 1.4, cx, y + 1.4, z + 0.9)                   // chest, sitting up
      box(1.9, 1.7, 1.6, cx, y + 3.2, z + 1.1)                   // maned head
    }
    lion(T1 * 0.62, 112)
    lion(T1, 104)
  }
  // balustrade on the terrace edge, either side of the bastion
  for (const sx of [-1, 1]) {
    for (let x = 26; x <= 120; x += 2.6) col(sx * x, T1, 82.6, 2.6, 0.32)
    box(96, 0.9, 1.4, sx * 73, T1 + 2.6, 82.6)
    box(96, 0.6, 1.8, sx * 73, T1, 82.6)
  }

  // tier 1: the long outer gallery (front + returning sides), corner pavilions, main gate
  gallery(240, 9, 9, T1, 78)
  for (const sx of [-1, 1]) {
    box(9, 9, 150, sx * 115.5, T1, -2)                           // side galleries
    roof(9, 150, sx * 115.5, T1 + 9, -2)
    box(18, 12, 18, sx * 115, T1, 74)                            // corner pavilion
    parts.push(prasatGeometry(14, 6.5, 6).translate(sx * 115, T1 + 12, 74))
  }
  // main gate (gopura) on the bastion: a tall central pavilion with three pediments stepping back, its stepped
  // roof, and two lower side porches
  porch(30, 16, 14, T1, 96, [[28, 7, 0.4, 0], [22, 6.5, 5, 3], [16, 6, 9.5, 6]])
  box(26, 3, 13, 0, T1 + 16, 89)
  box(20, 3, 10, 0, T1 + 19, 89)
  box(13, 3, 7, 0, T1 + 22, 89)
  for (const sx of [-1, 1]) {
    box(14, 12, 10, sx * 24, T1, 84)
    gable(13, 5, sx * 24, T1 + 12.4, 89)
  }

  // cruciform Terrace of Honour in front of the stair, with naga balustrades
  const TZ = 128
  box(34, 3, 22, 0, 0, TZ)
  box(64, 3, 10, 0, 0, TZ)
  for (const sx of [-1, 1]) {
    for (let z = TZ - 10; z <= TZ + 10; z += 2.4) col(sx * 17, 3, z, 2.2, 0.3)
    box(0.9, 0.9, 22, sx * 17, 5.2, TZ)                           // naga body (rail)
    box(2.2, 4, 2.2, sx * 17, 3, TZ + 11.5)                       // rearing naga heads at the corners
  }
  stairs(14, 3, 4, TZ + 16, TZ + 11)

  // tier 2: a raised platform with its own gallery, porch and steps
  const T2 = T1 + 9
  box(176, 8, 118, 0, T1, -4)
  box(180, 1.2, 122, 0, T2 - 1.2, -4)
  gallery(172, 9, 8, T2, 55)
  for (const sx of [-1, 1]) { box(8, 9, 110, sx * 82, T2, -4); roof(8, 110, sx * 82, T2 + 9, -4) }
  stairs(18, 8, 6, 64, 56, T1)
  porch(20, 12, 10, T2, 60, [[19, 5.5, 0.4, 0], [14, 5, 4, 2.5]])

  // tier 3 (Bakan): the steep central mass with its gallery, very steep stairs and the porch at the top
  const T3 = T2 + 18
  box(118, 18, 80, 0, T2, -6)
  box(122, 1.4, 84, 0, T2 + 6, -6)
  box(122, 1.4, 84, 0, T2 + 12, -6)
  box(124, 1.6, 86, 0, T3 - 1.6, -6)
  gallery(114, 9, 7, T3, 33, 5)
  for (const sx of [-1, 1]) { box(7, 9, 74, sx * 53.5, T3, -6); roof(7, 74, sx * 53.5, T3 + 9, -6) }
  stairs(12, 18, 12, 44, 34, T2)
  porch(16, 11, 8, T3, 37, [[15, 5, 0.4, 0], [11, 4.5, 3.5, 2]])

  // the quincunx: four corner towers and the tall central one, each on a cella with a front porch
  const tower = (x, z, base, h, r, lift = 0) => {
    box(r * 2.1, 10, r * 2.1, x, base + lift, z)
    box(r * 1.1, 8, 3, x, base + lift, z + r * 1.05 + 1.5)       // front porch of the cella
    gable(r * 1.2, 3.5, x, base + lift + 8.2, z + r * 1.05 + 2.6)
    box(r * 2.3, 1.4, r * 2.3, x, base + lift + 10, z)
    parts.push(prasatGeometry(h, r).translate(x, base + lift + 11.4, z))
  }
  for (const [x, z] of [[-48, 24], [48, 24], [-48, -36], [48, -36]]) tower(x, z, T3, 33, 8.6)
  box(30, 8, 30, 0, T3, -6)                                       // the central tower's raised base
  tower(0, -6, T3, 50, 12.2, 8)

  const geo = mergeGeometries(parts)
  return { geo, edges: new THREE.EdgesGeometry(geo, 24) }
}

// Sugar palm (Cambodia's tnaot): a tall, thin, slightly curving ringed trunk topped by a round burst of fan
// leaves (each a fan of stiff leaflets on a long stalk), with a few dead fronds hanging under the crown.
// Returned as line pairs so it reads crisply: { trunk, fronds, dead } (arrays of Vector3 pairs).
function sugarPalm(h) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z)
  const lean = V(rand(-0.1, 0.1) * h, 0, rand(-0.06, 0.06) * h)
  const axis = (t) => V(lean.x * t * t, h * t, lean.z * t * t) // curves more toward the top
  const trunk = []
  const fronds = []
  const dead = []
  // trunk: a tight stack of slightly tilted rings (the leaf scars), so it reads as a ringed trunk, not a ladder
  const r0 = h * 0.028
  const r1 = h * 0.018
  const ringAt = (t, k, tilt) => {
    const c = axis(t)
    const r = r0 + (r1 - r0) * t
    const a = (k / 8) * Math.PI * 2
    return c.add(V(Math.cos(a) * r, Math.sin(a + tilt) * r * 0.25, Math.sin(a) * r))
  }
  for (let t = 0.01; t < 0.96; t += rand(0.022, 0.034)) {
    const tilt = rand(0, Math.PI * 2)
    for (let k = 0; k < 8; k++) trunk.push(ringAt(t, k, tilt), ringAt(t, k + 1, tilt))
  }
  const top = axis(1)
  // crown
  const N = 20 + Math.floor(Math.random() * 5)
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + rand(-0.15, 0.15)
    const e = rand(-0.45, 1.0) // elevation: some droop, most stand up and out
    const dir = V(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a))
    const stalk = h * rand(0.1, 0.16)
    const P = top.clone().addScaledVector(dir, stalk).add(V(0, -stalk * 0.12, 0))
    fronds.push(top.clone(), P)
    const side = V(-Math.sin(a), 0, Math.cos(a))
    const L = h * rand(0.13, 0.19)
    for (let k = 0; k <= 10; k++) {
      const th = -1.15 + (k / 10) * 2.3
      const ld = dir.clone().multiplyScalar(Math.cos(th)).addScaledVector(side, Math.sin(th)).normalize()
      const len = L * (1 - 0.22 * Math.abs(th))
      const M = P.clone().addScaledVector(ld, len * 0.55)
      const E = P.clone().addScaledVector(ld, len).add(V(0, -len * (0.12 + 0.12 * Math.abs(th)), 0))
      fronds.push(P, M, M, E)
    }
  }
  // a skirt of dead fronds hanging under the crown
  for (let i = 0; i < 5; i++) {
    const a = rand(0, Math.PI * 2)
    const P = top.clone().add(V(Math.cos(a) * h * 0.05, -h * rand(0.08, 0.14), Math.sin(a) * h * 0.05))
    dead.push(top.clone().add(V(0, -h * 0.02, 0)), P)
    for (let k = 0; k < 6; k++) {
      const b = a + rand(-0.5, 0.5)
      dead.push(P, P.clone().add(V(Math.cos(b) * h * 0.03, -h * rand(0.05, 0.09), Math.sin(b) * h * 0.03)))
    }
  }
  return { trunk, fronds, dead }
}

// A patch of grass: tufts of bent blades, as line pairs
function grassPatch(w, d, tufts, h) {
  const pts = []
  for (let i = 0; i < tufts; i++) {
    const cx = rand(-w / 2, w / 2)
    const cz = rand(-d / 2, d / 2)
    const blades = 5 + Math.floor(Math.random() * 4)
    for (let b = 0; b < blades; b++) {
      const a = rand(0, Math.PI * 2)
      const lean = rand(0.15, 0.55)
      const bh = h * rand(0.6, 1.2)
      const base = new THREE.Vector3(cx + rand(-0.4, 0.4), 0, cz + rand(-0.4, 0.4))
      const mid = base.clone().add(new THREE.Vector3(Math.cos(a) * bh * lean * 0.3, bh * 0.6, Math.sin(a) * bh * lean * 0.3))
      const tip = base.clone().add(new THREE.Vector3(Math.cos(a) * bh * lean, bh, Math.sin(a) * bh * lean))
      pts.push(base, mid, mid, tip)
    }
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

async function angkor(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const n = (desk, mob) => (ctx.mobile ? mob : desk)
  const gold = ctx.look.scene.wire[dark ? 'dark' : 'light']
  const stone = dark ? 0xd9c79c : 0x5a4a2a

  // sunrise behind the temple
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(70, 48),
    new THREE.MeshBasicMaterial({
      color: dark ? 0xf0a640 : 0xf6c36a, transparent: true, opacity: dark ? 0.22 : 0.35, fog: false,
      blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false,
    }),
  )
  sun.position.set(0, GROUND + 70, -380)
  d.group.add(sun)

  // the temple: crisp stone edges over a faint fill; the depth-only twin hides the lines (and anything) behind it
  const T_SCALE = 1.15
  const T_Z = -322
  const { geo: tGeo, edges: tEdges } = angkorTemple()
  const temple = new THREE.Group()
  temple.add(
    new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({ color: stone, transparent: true, opacity: dark ? 0.05 : 0.08, depthWrite: false, fog: false })),
    new THREE.LineSegments(tEdges, new THREE.LineBasicMaterial({ color: stone, transparent: true, opacity: dark ? 0.62 : 0.7, fog: false })),
  )
  temple.scale.setScalar(T_SCALE)
  temple.position.set(0, GROUND, T_Z)
  occlude(temple)
  d.group.add(temple)
  // where the temple's front ends (the terrace steps): palms and grass beside the causeway stay hidden behind
  // this line and come out of the mist in front of it, so nothing visibly cuts through the walls
  const FRONT_Z = T_Z + 145 * T_SCALE
  const TEMPLE_HALF_W = 128 * T_SCALE + 14

  // low mist along the temple's foot
  const mistMat = new THREE.SpriteMaterial({
    map: dotTexture(), color: dark ? 0xd8c49a : 0xfff4dc, transparent: true, opacity: dark ? 0.032 : 0.11,
    depthWrite: false, fog: false, blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  const mist = Array.from({ length: n(70, 34) }, (_, i) => {
    const m = new THREE.Sprite(mistMat)
    const size = rand(30, 80)
    m.scale.set(size * 2.2, size * 0.4, 1)
    m.position.set(rand(-190, 190), GROUND + rand(1, 9), FRONT_Z + rand(-30, 18) - (i % 4 === 0 ? 40 : 0))
    m.userData = { v: rand(1, 3) * (Math.random() < 0.5 ? -1 : 1), y: m.position.y, ph: rand(0, 6) }
    d.group.add(m)
    return m
  })
  d.onUpdate((dt, t) => mist.forEach((m) => {
    const u = m.userData
    m.position.x += u.v * dt
    m.position.y = u.y + Math.sin(t * 0.35 + u.ph) * 1
    if (m.position.x > 200) m.position.x = -200
    if (m.position.x < -200) m.position.x = 200
  }))

  // jungle tree line either side of the temple
  const jungle = wireMesh(ridgeGeometry({ width: 1000, depth: 60, height: 38, seed: 7, segX: 120 }), dark ? 0x2f6f55 : 0x3f6a4a, dark ? 0.3 : 0.35)
  jungle.position.set(0, GROUND, -345)
  d.group.add(jungle)

  const props = []
  const SPAN = 340

  // the causeway: big irregular flagstones, row after row, toward the temple
  const flagEdge = new THREE.LineBasicMaterial({ color: stone, transparent: true, opacity: dark ? 0.42 : 0.5 })
  const flagFill = new THREE.MeshBasicMaterial({ color: stone, transparent: true, opacity: dark ? 0.06 : 0.1, depthWrite: false })
  const HALF = 17
  let z = 0
  const rows = []
  while (z < SPAN) {
    const depth = Math.min(rand(4.5, 7.5), SPAN - z)
    if (depth < 1) break
    const boxes = []
    let x = -HALF
    while (x < HALF - 1) {
      const w = Math.min(rand(6, 12), HALF - x)
      const off = rand(-0.5, 0.5)
      boxes.push(new THREE.BoxGeometry(w - 0.5, 0.4, depth - 0.5).translate(x + w / 2, 0.2, off * 0.3))
      x += w
    }
    const merged = mergeGeometries(boxes)
    const g = new THREE.Group()
    g.add(new THREE.Mesh(merged, flagFill), new THREE.LineSegments(new THREE.EdgesGeometry(merged), flagEdge))
    g.position.set(0, GROUND, -300 + z + depth / 2)
    rows.push(g)
    z += depth
  }
  rows.forEach((r) => { d.group.add(r); props.push(r) })

  // stone balustrades along both edges: plinth, little columns and a top rail, in tiling sections
  const SEG = 17
  const railGeo = (() => {
    const parts = [
      new THREE.BoxGeometry(SEG, 1.2, 2.4).translate(0, 0.6, 0), // plinth
      new THREE.BoxGeometry(SEG, 1.1, 1.8).translate(0, 5.4, 0), // rail
    ]
    for (let x = -SEG / 2 + 1.2; x < SEG / 2; x += 2.4) parts.push(new THREE.CylinderGeometry(0.45, 0.55, 3.8, 6).translate(x, 3, 0))
    return new THREE.EdgesGeometry(mergeGeometries(parts.map((p) => p.toNonIndexed())), 25)
  })()
  const railMat = new THREE.LineBasicMaterial({ color: stone, transparent: true, opacity: dark ? 0.45 : 0.55 })
  for (const side of [-1, 1]) {
    for (let i = 0; i < SPAN / SEG; i++) {
      const r = new THREE.LineSegments(railGeo, railMat)
      r.rotation.y = Math.PI / 2
      r.position.set(side * (HALF + 2), GROUND, -300 + i * SEG + SEG / 2)
      d.group.add(r)
      props.push(r)
    }
  }

  // grass on both sides of the causeway
  const grassMat = new THREE.LineBasicMaterial({ color: dark ? 0x6fbf6a : 0x4f8f3a, transparent: true, opacity: dark ? 0.55 : 0.6 })
  const nGrass = n(60, 26)
  for (let i = 0; i < nGrass; i++) {
    const g = new THREE.LineSegments(grassPatch(rand(16, 30), rand(10, 18), n(14, 9), rand(1.6, 2.8)), grassMat)
    const side = i % 2 ? 1 : -1
    g.position.set(side * rand(30, 175), GROUND, -300 + (i / nGrass) * SPAN + rand(-5, 5))
    g.rotation.y = rand(0, Math.PI)
    d.group.add(g)
    props.push(g)
  }

  // sugar palms lining the causeway, a few leaning over it
  const trunkMat = new THREE.LineBasicMaterial({ color: dark ? 0xb7a37a : 0x6a5a3a, transparent: true, opacity: dark ? 0.6 : 0.65 })
  const frondMat = new THREE.LineBasicMaterial({ color: dark ? 0x86cf8e : 0x3f7a4e, transparent: true, opacity: dark ? 0.62 : 0.7 })
  const deadMat = new THREE.LineBasicMaterial({ color: dark ? 0xa8945e : 0x7a6a3a, transparent: true, opacity: dark ? 0.55 : 0.6 })
  const variants = [32, 38, 44, 50, 56, 62].map((h) => {
    const p = sugarPalm(h)
    return ['trunk', 'fronds', 'dead'].map((k) => new THREE.BufferGeometry().setFromPoints(p[k]))
  })
  const count = n(36, 18)
  for (let i = 0; i < count; i++) {
    const [tg, fg, dg] = variants[i % variants.length]
    const palm = new THREE.Group()
    palm.add(new THREE.LineSegments(tg, trunkMat), new THREE.LineSegments(fg, frondMat), new THREE.LineSegments(dg, deadMat))
    const side = i % 2 ? 1 : -1
    palm.position.set(side * (28 + Math.pow(Math.random(), 1.3) * 130), GROUND, -300 + (i / count) * SPAN + rand(-6, 6))
    palm.rotation.set(0, rand(0, Math.PI * 2), 0)
    d.group.add(palm)
    props.push(palm)
  }
  scrollWithGrid(d, ctx, props, 40, SPAN)
  const nearTemple = [...props.filter((o) => o.isLineSegments && o.material === grassMat), ...props.filter((o) => o.isGroup && o.children.length === 3)]
  d.onUpdate(() => nearTemple.forEach((o) => {
    o.visible = !(o.position.z < FRONT_Z + 6 && Math.abs(o.position.x) < TEMPLE_HALF_W)
  }))

  const flies = particles(ctx, {
    count: ctx.mobile ? 120 : 280, color: dark ? 0xffd27a : 0xb5781a, size: 1.2, drift: 0.8, additive: dark,
    box: { x: [-170, 170], y: [GROUND + 2, 50], z: [-280, -10] },
  })
  d.group.add(flies.points)
  d.onUpdate(flies.update)
  // lotus petals drifting low over the moat (pink)
  const lotus = particles(ctx, {
    count: ctx.mobile ? 30 : 70, color: dark ? 0xff8fb8 : 0xd0487a, size: 1.6, drift: 0.4, additive: dark, opacity: 0.7,
    box: { x: [-150, 150], y: [GROUND, GROUND + 6], z: [-300, -60] },
  })
  d.group.add(lotus.points)
  d.onUpdate((dt, t) => { lotus.update(dt, t); sun.material.opacity = (dark ? 0.2 : 0.32) + 0.04 * Math.sin(t * 0.4) })
  return d.api
}

// ---------------------------------------------------------------- Deep Ocean
// Rising bubbles, pulsing jellyfish, coral reefs with swaying seagrass and a fish school
async function deepOcean(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const glow = ctx.look.scene.wire[dark ? 'dark' : 'light']
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending
  const n = (desk, mob) => (ctx.mobile ? mob : desk)

  // bubbles
  const bubbles = risingSparks(ctx, {
    count: n(260, 110), color: dark ? 0xbff6ff : 0x2a8fb0, size: 1.1, speed: [6, 18], sway: 0.08,
    box: { x: [-170, 170], y: [GROUND, 90], z: [-260, -10] },
  })
  d.group.add(bubbles.points)

  // jellyfish: wire bell + wavy tentacles, bobbing and pulsing
  const jellies = []
  for (let j = 0; j < n(5, 3); j++) {
    const jelly = new THREE.Group()
    const r = rand(6, 11)
    const bell = wireMesh(new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), glow, dark ? 0.55 : 0.5, true)
    bell.material.blending = blend
    jelly.add(bell)
    const tentacles = []
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2
      const pts = Array.from({ length: 14 }, (_, i) => new THREE.Vector3(Math.cos(a) * r * 0.6, -i * r * 0.28, Math.sin(a) * r * 0.6))
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: glow, transparent: true, opacity: dark ? 0.4 : 0.45, blending: blend }))
      jelly.add(line)
      tentacles.push({ geo, a })
    }
    jelly.position.set(rand(-120, 120), rand(-10, 40), rand(-220, -70))
    jelly.userData = { tentacles, r, p: Math.random() * 6, y0: jelly.position.y, bell }
    d.group.add(jelly)
    jellies.push(jelly)
  }

  // reef patches along both sides: branching coral, brain / table coral, tube anemones, seagrass clumps
  const coralCols = dark ? [0xff7aa8, 0xff9f5a, 0xb58cff, 0x3fe0c0, 0xffd36e] : [0xd2477a, 0xd2702a, 0x7a52d0, 0x13987e, 0xb58a1a]
  const meshMat = coralCols.map((c) => new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: dark ? 0.45 : 0.5, blending: blend }))
  const lineMat = coralCols.map((c) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: dark ? 0.6 : 0.65, blending: blend }))
  const grassMat = new THREE.LineBasicMaterial({ color: dark ? 0x2fbf8f : 0x1f7a5a, transparent: true, opacity: dark ? 0.55 : 0.65 })
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const branchCoral = (size) => {
    const pts = []
    const grow = (from, dir, len, depth) => {
      const to = from.clone().addScaledVector(dir, len)
      pts.push(from, to)
      if (depth === 0) return
      const kids = 2 + (Math.random() < 0.4 ? 1 : 0)
      for (let k = 0; k < kids; k++) {
        const nd = dir.clone().add(new THREE.Vector3(rand(-0.75, 0.75), rand(0.15, 0.55), rand(-0.75, 0.75))).normalize()
        grow(to, nd, len * rand(0.6, 0.8), depth - 1)
      }
    }
    grow(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), size * 0.35, 4)
    return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), pick(lineMat))
  }
  const brainCoral = (r) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), pick(meshMat))
    m.scale.y = 0.7
    return m
  }
  const tableCoral = (r) => {
    const g = new THREE.Group()
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.2, r * 0.6, 6, 1, true), pick(meshMat))
    stalk.position.y = r * 0.3
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.25, r * 0.22, 16, 1, true), stalk.material)
    plate.position.y = r * 0.68
    g.add(stalk, plate)
    return g
  }
  const anemones = () => {
    const g = new THREE.Group()
    const mat = pick(meshMat)
    for (let k = 0; k < 6; k++) {
      const h = rand(3, 8)
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, h, 6, 1, true), mat)
      tube.position.set(rand(-2.5, 2.5), h / 2, rand(-2.5, 2.5))
      tube.rotation.set(rand(-0.25, 0.25), 0, rand(-0.25, 0.25))
      g.add(tube)
    }
    return g
  }
  // seagrass: one LineSegments per clump of 7-11 blades, re-bent every frame
  const grassClumps = []
  const grassClump = () => {
    const K = 8
    const blades = Array.from({ length: Math.floor(rand(7, 12)) }, () => ({
      x: rand(-3, 3), z: rand(-3, 3), h: rand(9, 24), lean: rand(-0.35, 0.35), p: Math.random() * 6,
    }))
    const pos = new Float32Array(blades.length * (K - 1) * 6)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const seg = new THREE.LineSegments(geo, grassMat)
    seg.userData = { blades, K, pos }
    seg.frustumCulled = false
    grassClumps.push(seg)
    return seg
  }
  const bendGrass = (seg, t) => {
    const { blades, K, pos } = seg.userData
    let o = 0
    for (const b of blades) {
      let px = b.x, py = 0, pz = b.z
      for (let k = 1; k < K; k++) {
        const f = k / (K - 1)
        const x = b.x + (b.lean * f + Math.sin(t * 0.9 + b.p + f * 2.5) * 0.35 * f * f) * b.h * 0.5
        const y = f * b.h
        const z = b.z + Math.cos(t * 0.7 + b.p + f * 2) * 0.12 * f * f * b.h
        pos[o++] = px; pos[o++] = py; pos[o++] = pz
        pos[o++] = x; pos[o++] = y; pos[o++] = z
        px = x; py = y; pz = z
      }
    }
    seg.geometry.attributes.position.needsUpdate = true
  }

  const reefs = []
  const nReef = n(26, 11)
  for (let i = 0; i < nReef; i++) {
    const reef = new THREE.Group()
    const side = i % 2 ? 1 : -1
    reef.position.set(side * rand(26, 150), GROUND, -300 + (i / nReef) * 340 + rand(-8, 8))
    const items = Math.floor(rand(3, 6))
    for (let k = 0; k < items; k++) {
      const kind = Math.random()
      const obj = kind < 0.3 ? grassClump()
        : kind < 0.5 ? branchCoral(rand(10, 20))
          : kind < 0.65 ? brainCoral(rand(3, 6))
            : kind < 0.8 ? tableCoral(rand(5, 9))
              : anemones()
      obj.position.x += rand(-10, 10)
      obj.position.z += rand(-10, 10)
      obj.rotation.y = rand(0, Math.PI * 2)
      reef.add(obj)
    }
    reef.add(grassClump()) // every patch gets at least one clump of seagrass
    d.group.add(reef)
    reefs.push(reef)
  }
  scrollWithGrid(d, ctx, reefs)

  // fish school circling
  const fishN = n(70, 30)
  const fishPos = new Float32Array(fishN * 3)
  const fishOff = Array.from({ length: fishN }, () => [rand(-14, 14), rand(-6, 6), rand(-10, 10), rand(0.8, 1.2)])
  const fishGeo = new THREE.BufferGeometry()
  fishGeo.setAttribute('position', new THREE.BufferAttribute(fishPos, 3))
  d.group.add(new THREE.Points(fishGeo, new THREE.PointsMaterial({
    color: dark ? 0xd9f3ff : 0x0b4f6a, size: 1.3, map: dotTexture(), transparent: true, depthWrite: false, blending: blend,
  })))

  d.onUpdate((dt, t) => {
    bubbles.update(dt, t)
    jellies.forEach((jl) => {
      const { tentacles, r, p, y0, bell } = jl.userData
      const pulse = Math.sin(t * 1.6 + p)
      bell.scale.set(1 + pulse * 0.08, 1 - pulse * 0.1, 1 + pulse * 0.08)
      jl.position.y = y0 + Math.sin(t * 0.5 + p) * 6
      tentacles.forEach(({ geo, a }) => {
        const pos = geo.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const w = Math.sin(t * 2 + i * 0.5 + a + p) * i * 0.12
          pos.setX(i, Math.cos(a) * r * 0.6 + w)
          pos.setZ(i, Math.sin(a) * r * 0.6 + w * 0.6)
        }
        pos.needsUpdate = true
      })
    })
    grassClumps.forEach((g) => bendGrass(g, t))
    const cx = Math.sin(t * 0.15) * 80
    const cz = -150 + Math.cos(t * 0.15) * 50
    const head = t * 0.15
    for (let i = 0; i < fishN; i++) {
      const [ox, oy, oz, sp] = fishOff[i]
      fishPos[i * 3] = cx + ox * Math.cos(head) + Math.sin(t * sp + i) * 1.5
      fishPos[i * 3 + 1] = 20 + oy + Math.sin(t * 1.3 * sp + i) * 1.2
      fishPos[i * 3 + 2] = cz + oz + ox * Math.sin(head)
    }
    fishGeo.attributes.position.needsUpdate = true
  })
  return d.api
}

// ---------------------------------------------------------------- Volcano
// A wireframe volcano on the horizon: glowing crater pool, thick lava rivers with flowing blobs, lava
// bombs that splash where they land on the slope, a smoke column and embers drifting everywhere.
function volcanoGeometry() {
  const pts = []
  const base = 190
  const rim = 26
  const h = 135
  for (let i = 0; i <= 14; i++) {
    const t = i / 14
    // concave flank: steep near the top, flaring at the base
    pts.push(new THREE.Vector2(rim + (base - rim) * Math.pow(1 - t, 2.2), h * t))
  }
  pts.push(new THREE.Vector2(rim * 0.7, h - 10)) // crater dip
  return new THREE.LatheGeometry(pts.reverse().map((v) => v), 30)
}

async function volcano(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const lava = ctx.look.scene.wire[dark ? 'dark' : 'light']
  const hot = dark ? 0xffc04d : 0xe0601a // bright core / droplets
  const rock = dark ? 0x7a2a14 : 0x4a1f10
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending
  const n = (desk, mob) => (ctx.mobile ? mob : desk)
  const Z = -330
  const H = 135
  const RIM = 26
  const BASE = 190
  // height of the flank at a distance r from the axis (inverse of the lathe profile)
  const surfaceY = (r) => {
    if (r >= BASE) return GROUND
    if (r <= RIM) return GROUND + H - 8
    return GROUND + H * (1 - Math.pow((r - RIM) / (BASE - RIM), 1 / 2.2))
  }

  const cone = wireMesh(volcanoGeometry(), rock, dark ? 0.5 : 0.45)
  cone.position.set(0, GROUND, Z)
  d.group.add(cone)
  const ranges = wireMesh(ridgeGeometry({ width: 1000, depth: 70, height: 70, seed: 3 }), rock, dark ? 0.28 : 0.3)
  ranges.position.set(0, GROUND, Z + 20)
  d.group.add(ranges)

  const top = new THREE.Vector3(0, GROUND + H, Z)
  // crater glow + a bubbling lava pool
  const glowMat = new THREE.PointsMaterial({ color: lava, size: 52, map: dotTexture(), transparent: true, opacity: dark ? 0.75 : 0.5, depthWrite: false, blending: blend, fog: false })
  d.group.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints([top.clone().add(new THREE.Vector3(0, -4, 0))]), glowMat))
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(RIM * 0.85, 24),
    new THREE.MeshBasicMaterial({ color: lava, transparent: true, opacity: 0.7, blending: blend, depthWrite: false, fog: false, side: THREE.DoubleSide }),
  )
  pool.rotation.x = -Math.PI / 2
  pool.position.copy(top).add(new THREE.Vector3(0, -6, 0))
  d.group.add(pool)

  // lava rivers: thick glowing tubes with a bright core, blobs of lava flowing down them
  const rivers = []
  const flows = []
  for (let r = 0; r < 5; r++) {
    const a = rand(-0.9, 0.9) + Math.PI / 2 // toward the camera side
    const pts = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const rad = RIM + (BASE - RIM) * Math.pow(t, 0.45) * 0.95
      const aa = a + Math.sin(t * 9 + r) * 0.09
      pts.push(new THREE.Vector3(Math.cos(aa) * rad, surfaceY(rad) - GROUND + 1, Math.sin(aa) * rad))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const width = rand(2.2, 3.6)
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, width, 6, false),
      new THREE.MeshBasicMaterial({ color: lava, transparent: true, opacity: 0.55, blending: blend, depthWrite: false, fog: false }),
    )
    const core = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, width * 0.35, 4, false),
      new THREE.MeshBasicMaterial({ color: hot, transparent: true, opacity: 0.9, blending: blend, depthWrite: false, fog: false }),
    )
    for (const m of [tube, core]) { m.position.set(0, GROUND, Z); d.group.add(m) }
    tube.userData.p = Math.random() * 6
    rivers.push(tube)
    // flowing blobs
    const F = n(26, 12)
    const fPos = new Float32Array(F * 3)
    const fu = Float32Array.from({ length: F }, () => Math.random())
    const fGeo = new THREE.BufferGeometry()
    fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3))
    const fPts = new THREE.Points(fGeo, new THREE.PointsMaterial({
      color: hot, size: width * 1.6, map: dotTexture(), transparent: true, depthWrite: false, blending: blend, fog: false,
    }))
    fPts.position.set(0, GROUND, Z)
    d.group.add(fPts)
    flows.push({ curve, fPos, fu, fGeo, speed: rand(0.04, 0.08) })
  }

  // eruption: lava bombs (big chunks + small spatter) on ballistic arcs that splash where they land
  const makeBombs = (count, size, color) => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    d.group.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color, size, map: dotTexture(), transparent: true, depthWrite: false, blending: blend, fog: false,
    })))
    const spawn = (i) => {
      pos.set([top.x + rand(-8, 8), top.y - 4, top.z + rand(-8, 8)], i * 3)
      vel.set([rand(-26, 26), rand(45, 95), rand(-14, 26)], i * 3)
    }
    for (let i = 0; i < count; i++) { spawn(i); pos[i * 3 + 1] = -9999 } // start "landed": they launch in a stream
    return { pos, vel, geo, spawn, count }
  }
  const chunks = makeBombs(n(70, 30), 4.2, lava)
  const spatter = makeBombs(n(200, 80), 1.8, hot)

  // splash droplets: a small pool reused round-robin
  const S = n(360, 140)
  const sPos = new Float32Array(S * 3).fill(-9999)
  const sVel = new Float32Array(S * 3)
  const sLife = new Float32Array(S)
  const sGeo = new THREE.BufferGeometry()
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
  const sMat = new THREE.PointsMaterial({ color: hot, size: 1.6, map: dotTexture(), transparent: true, depthWrite: false, blending: blend, fog: false })
  d.group.add(new THREE.Points(sGeo, sMat))
  let sNext = 0
  const splash = (x, y, z, amount) => {
    for (let k = 0; k < amount; k++) {
      const i = sNext
      sNext = (sNext + 1) % S
      sPos.set([x, y, z], i * 3)
      const a = rand(0, Math.PI * 2)
      const sp = rand(6, 16)
      sVel.set([Math.cos(a) * sp, rand(8, 20), Math.sin(a) * sp], i * 3)
      sLife[i] = rand(0.5, 0.9)
    }
  }

  // smoke column
  const smoke = risingSparks(ctx, {
    count: n(60, 24), color: dark ? 0x5a4a46 : 0x8a7a72, size: 26, speed: [6, 12], sway: 0.15,
    box: { x: [-14, 14], y: [GROUND + H, GROUND + H + 120], z: [Z - 10, Z + 10] },
  })
  smoke.points.material.blending = THREE.NormalBlending
  smoke.points.material.opacity = dark ? 0.16 : 0.22
  smoke.points.material.fog = false
  d.group.add(smoke.points)

  // embers in the air
  const embers = risingSparks(ctx, { count: n(260, 110), color: lava, size: 1.5, box: { x: [-180, 180], y: [GROUND, 90], z: [-260, -10] } })
  d.group.add(embers.points)

  let launch = 0
  const stepBombs = (b, dt, splashAmount) => {
    const { pos, vel, spawn, count } = b
    for (let i = 0; i < count; i++) {
      const j = i * 3
      if (pos[j + 1] < -9000) continue
      vel[j + 1] -= 34 * dt
      pos[j] += vel[j] * dt
      pos[j + 1] += vel[j + 1] * dt
      pos[j + 2] += vel[j + 2] * dt
      const ground = surfaceY(Math.hypot(pos[j] - top.x, pos[j + 2] - Z))
      if (vel[j + 1] < 0 && pos[j + 1] <= ground) {
        splash(pos[j], ground + 0.5, pos[j + 2], splashAmount)
        pos[j + 1] = -9999 // parked until relaunched
      }
    }
    b.geo.attributes.position.needsUpdate = true
  }
  const relaunch = (b, k) => {
    for (let i = 0, done = 0; i < b.count && done < k; i++) if (b.pos[i * 3 + 1] < -9000) { b.spawn(i); done++ }
  }

  d.onUpdate((dt, t) => {
    smoke.update(dt, t)
    embers.update(dt, t)
    // bursts: a steady stream with a bigger pulse every few seconds
    launch += dt * (ctx.mobile ? 22 : 45) * (1 + 2.5 * Math.max(0, Math.sin(t * 0.9)) ** 6)
    const k = Math.floor(launch)
    launch -= k
    relaunch(spatter, k)
    if (Math.random() < dt * 9) relaunch(chunks, 1)
    stepBombs(chunks, dt, 6)
    stepBombs(spatter, dt, 2)
    for (let i = 0; i < S; i++) {
      if (sLife[i] <= 0) continue
      const j = i * 3
      sLife[i] -= dt
      sVel[j + 1] -= 40 * dt
      sPos[j] += sVel[j] * dt
      sPos[j + 1] += sVel[j + 1] * dt
      sPos[j + 2] += sVel[j + 2] * dt
      if (sLife[i] <= 0) sPos[j + 1] = -9999
    }
    sGeo.attributes.position.needsUpdate = true
    flows.forEach((f) => {
      for (let i = 0; i < f.fu.length; i++) {
        f.fu[i] = (f.fu[i] + dt * f.speed) % 1
        const p = f.curve.getPointAt(f.fu[i])
        f.fPos.set([p.x + rand(-0.4, 0.4), p.y + 1.2, p.z + rand(-0.4, 0.4)], i * 3)
      }
      f.fGeo.attributes.position.needsUpdate = true
    })
    glowMat.size = 52 + Math.sin(t * 3) * 7 + Math.sin(t * 7.3) * 3
    pool.material.opacity = 0.55 + 0.2 * Math.sin(t * 4.1) * Math.sin(t * 1.7)
    rivers.forEach((rv) => { rv.material.opacity = 0.45 + 0.2 * Math.sin(t * 2 + rv.userData.p) })
  })
  return d.api
}

// ---------------------------------------------------------------- Atomic
// A big atom on the horizon (nucleus + three tilted orbits with electrons), smaller atoms floating,
// ball-and-stick molecules drifting along the path and faint particle-track spirals.
function atomModel({ r, nucleus, orbits, colors, blend, dark, electronSize }) {
  const g = new THREE.Group()
  const [pCol, nCol, eCol] = colors
  const pMat = new THREE.MeshBasicMaterial({ color: pCol, wireframe: true, transparent: true, opacity: dark ? 0.55 : 0.6, fog: false })
  const nMat = new THREE.MeshBasicMaterial({ color: nCol, wireframe: true, transparent: true, opacity: dark ? 0.45 : 0.5, fog: false })
  const ball = new THREE.IcosahedronGeometry(r * 0.16, 1)
  for (let i = 0; i < nucleus; i++) {
    const m = new THREE.Mesh(ball, i % 2 ? pMat : nMat)
    m.position.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(r * 0.16 * Math.cbrt(Math.random()) * 1.6)
    g.add(m)
  }
  const ringMat = new THREE.LineBasicMaterial({ color: eCol, transparent: true, opacity: dark ? 0.55 : 0.6, blending: blend, fog: false })
  const electrons = []
  const ePos = new Float32Array(orbits * 3)
  for (let k = 0; k < orbits; k++) {
    const curve = new THREE.EllipseCurve(0, 0, r, r * 0.38, 0, Math.PI * 2)
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)), ringMat)
    const tilt = new THREE.Group()
    tilt.rotation.set(Math.PI / 2 + rand(-0.2, 0.2), 0, (k / orbits) * Math.PI)
    tilt.add(ring)
    g.add(tilt)
    electrons.push({ tilt, phase: rand(0, Math.PI * 2), speed: rand(1.2, 2) * (k % 2 ? 1 : -1) })
  }
  const eGeo = new THREE.BufferGeometry()
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3))
  const ePts = new THREE.Points(eGeo, new THREE.PointsMaterial({
    color: eCol, size: electronSize, map: dotTexture(), transparent: true, depthWrite: false, blending: blend, fog: false,
  }))
  g.add(ePts)
  const v = new THREE.Vector3()
  const update = (t) => {
    electrons.forEach((e, k) => {
      const a = e.phase + t * e.speed
      v.set(Math.cos(a) * r, Math.sin(a) * r * 0.38, 0)
      e.tilt.updateMatrix()
      v.applyMatrix4(e.tilt.matrix)
      ePos.set([v.x, v.y, v.z], k * 3)
    })
    eGeo.attributes.position.needsUpdate = true
  }
  return { group: g, update }
}

function molecule(atomCols, bondMat, dark) {
  // a little ball-and-stick chain / ring
  const g = new THREE.Group()
  const ring = Math.random() < 0.4
  const count = ring ? 6 : Math.floor(rand(3, 6))
  const pts = []
  for (let i = 0; i < count; i++) {
    if (ring) {
      const a = (i / count) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * 5, Math.sin(a) * 5, 0))
    } else {
      const prev = pts[i - 1] || new THREE.Vector3()
      pts.push(i === 0 ? prev.clone() : prev.clone().add(new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(5)))
    }
  }
  pts.forEach((p, i) => {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(i % 3 === 0 ? 1.8 : 1.3, 1), new THREE.MeshBasicMaterial({
      color: atomCols[i % atomCols.length], wireframe: true, transparent: true, opacity: dark ? 0.6 : 0.65,
    }))
    s.position.copy(p)
    g.add(s)
  })
  const bonds = []
  for (let i = 1; i < count; i++) bonds.push(pts[i - 1], pts[i])
  if (ring) bonds.push(pts[count - 1], pts[0])
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(bonds), bondMat))
  return g
}

async function atomic(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending
  const n = (desk, mob) => (ctx.mobile ? mob : desk)
  const violet = ctx.look.scene.wire[dark ? 'dark' : 'light']
  const cyan = dark ? 0x6cf0ff : 0x0b7f9a
  const pink = dark ? 0xff7ad9 : 0xc0388f
  const cols = [violet, pink, cyan]

  const atoms = []
  const big = atomModel({ r: 70, nucleus: 22, orbits: 3, colors: cols, blend, dark, electronSize: 6 })
  big.group.position.set(0, GROUND + 95, -300)
  d.group.add(big.group)
  atoms.push({ ...big, spin: 0.12 })
  for (let i = 0; i < n(7, 4); i++) {
    const a = atomModel({ r: rand(8, 16), nucleus: Math.floor(rand(4, 9)), orbits: Math.floor(rand(1, 4)), colors: cols, blend, dark, electronSize: 2.6 })
    a.group.position.set((i % 2 ? 1 : -1) * rand(60, 170), rand(GROUND + 25, 70), rand(-260, -80))
    a.group.rotation.set(rand(0, 3), rand(0, 3), 0)
    d.group.add(a.group)
    atoms.push({ ...a, spin: rand(0.2, 0.5), bob: rand(0, 6), y0: a.group.position.y })
  }

  // molecules drifting along the path
  const bondMat = new THREE.LineBasicMaterial({ color: dark ? 0xc8ccff : 0x3a3f7a, transparent: true, opacity: dark ? 0.5 : 0.6 })
  const mols = []
  const nMol = n(18, 8)
  for (let i = 0; i < nMol; i++) {
    const m = molecule(cols, bondMat, dark)
    m.position.set((i % 2 ? 1 : -1) * rand(28, 140), rand(GROUND + 6, 20), -300 + (i / nMol) * 340)
    m.userData.spin = new THREE.Vector3(rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4))
    d.group.add(m)
    mols.push(m)
  }
  scrollWithGrid(d, ctx, mols)

  // particle-track spirals (cloud chamber), fading in and out
  const tracks = []
  for (let i = 0; i < n(6, 3); i++) {
    const pts = []
    const r0 = rand(10, 22)
    const turns = rand(2, 4)
    for (let k = 0; k <= 120; k++) {
      const f = k / 120
      const a = f * turns * Math.PI * 2
      const r = r0 * (1 - f * 0.85)
      pts.push(new THREE.Vector3(Math.cos(a) * r + f * 30, Math.sin(a) * r, 0))
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({
      color: i % 2 ? cyan : pink, transparent: true, opacity: 0, blending: blend, fog: false,
    }))
    line.position.set(rand(-160, 160), rand(0, 70), rand(-250, -120))
    line.rotation.z = rand(0, Math.PI * 2)
    line.userData.p = rand(0, 10)
    d.group.add(line)
    tracks.push(line)
  }

  const dust = particles(ctx, {
    count: n(240, 100), color: cyan, size: 0.9, drift: 0.4, additive: dark, opacity: 0.6,
    box: { x: [-200, 200], y: [GROUND, 90], z: [-280, -10] },
  })
  d.group.add(dust.points)

  d.onUpdate((dt, t) => {
    dust.update(dt, t)
    atoms.forEach((a) => {
      a.update(t)
      a.group.rotation.y += a.spin * dt
      if (a.y0 !== undefined) a.group.position.y = a.y0 + Math.sin(t * 0.6 + a.bob) * 4
    })
    mols.forEach((m) => {
      m.rotation.x += m.userData.spin.x * dt
      m.rotation.y += m.userData.spin.y * dt
      m.rotation.z += m.userData.spin.z * dt
    })
    tracks.forEach((tr) => {
      // each track flashes on for a moment every ~8s
      const ph = ((t + tr.userData.p) % 8) / 8
      tr.material.opacity = ph < 0.25 ? (dark ? 0.6 : 0.7) * Math.sin((ph / 0.25) * Math.PI) : 0
    })
  })
  return d.api
}

// ---------------------------------------------------------------- Sky helpers (Japan, Desert)
// A wide plane with a vertical colour fade, standing behind everything: a glow along the horizon
function skyGlow(stops, { width = 1600, height = 320, y = GROUND + 110, z = -440, opacity = 1, additive = false } = {}) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, 0, 256)
  stops.forEach(([at, col]) => grd.addColorStop(at, col))
  g.fillStyle = grd
  g.fillRect(0, 0, 4, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity, depthWrite: false, fog: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    }),
  )
  m.position.set(0, y, z)
  m.renderOrder = -2
  return m
}

// A flat disc in the sky (sun / moon) with a soft halo
function skyDisc({ r, color, halo, opacity, x, y, z, additive }) {
  const g = new THREE.Group()
  const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, fog: false, depthWrite: false, blending,
  }))
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: dotTexture(), color: halo, transparent: true, opacity: opacity * 0.7, fog: false, depthWrite: false, blending,
  }))
  glow.scale.setScalar(r * 5)
  g.add(glow, disc)
  g.position.set(x, y, z)
  g.renderOrder = -1
  return g
}

// Puffy cumulus clouds: soft sprite clusters drifting slowly across the far sky
function puffyClouds(d, { count, color, opacity, blend, y = [140, 230], z = -440 }) {
  const mat = new THREE.SpriteMaterial({ map: dotTexture(), color, transparent: true, opacity, depthWrite: false, fog: false, blending: blend })
  const clouds = []
  for (let c = 0; c < count; c++) {
    const g = new THREE.Group()
    const w = rand(60, 110)
    for (let i = 0; i < 11; i++) {
      const s = new THREE.Sprite(mat)
      const u = (i / 10) * 2 - 1
      const size = (1 - Math.abs(u) * 0.55) * rand(38, 58)
      s.position.set(u * w * 0.5 + rand(-6, 6), size * 0.28 + rand(-3, 6), rand(-4, 4))
      s.scale.setScalar(size)
      g.add(s)
    }
    g.position.set(rand(-420, 420), GROUND + rand(y[0], y[1]), z + c * 3)
    g.userData.v = rand(1.2, 3)
    d.group.add(g)
    clouds.push(g)
  }
  d.onUpdate((dt) => clouds.forEach((g) => { g.position.x += g.userData.v * dt; if (g.position.x > 520) g.position.x = -520 }))
}

// A small five-petal sakura flower with crisp edges (white, so vertex colours tint it), for blossom points
let flowerTex = null
function flowerTexture() {
  if (flowerTex) return flowerTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  g.translate(32, 32)
  g.fillStyle = '#ffffff'
  for (let i = 0; i < 5; i++) {
    g.save()
    g.rotate((i / 5) * Math.PI * 2)
    g.beginPath()
    g.moveTo(0, 0)
    g.bezierCurveTo(-15, -8, -13, -26, -4, -29)
    g.lineTo(0, -24) // notched tip
    g.lineTo(4, -29)
    g.bezierCurveTo(13, -26, 15, -8, 0, 0)
    g.fill()
    g.restore()
  }
  g.globalCompositeOperation = 'destination-out' // a tiny hole so the centre reads as darker
  g.globalAlpha = 0.35
  g.beginPath()
  g.arc(0, 0, 5, 0, Math.PI * 2)
  g.fill()
  flowerTex = new THREE.CanvasTexture(c)
  flowerTex.colorSpace = THREE.SRGBColorSpace
  return flowerTex
}

// ---------------------------------------------------------------- Japan
// Dusk over Mount Fuji, framed by a big vermilion torii over a stone path lined with lanterns and sakura
// trees; petals tumble down everywhere and settle on the ground.
const FUJI = { H: 180, BASE: 270, RIM: 30 }
// concave: about 23 deg at the foot steepening to about 50 deg at the summit (never vertical, so no chimney)
const fujiR = (y) => {
  const u = 1 - Math.min(1, Math.max(0, y / FUJI.H))
  return FUJI.RIM + (FUJI.BASE - FUJI.RIM) * (0.6 * u + 0.4 * u * u * u)
}

function fujiGeometry() {
  // gently concave flanks up to a flat-topped crater
  const pts = []
  for (let i = 0; i <= 14; i++) {
    const y = (FUJI.H * i) / 14
    pts.push(new THREE.Vector2(fujiR(y), y))
  }
  pts.push(new THREE.Vector2(FUJI.RIM * 0.6, FUJI.H - 5))
  return new THREE.LatheGeometry(pts, 36)
}

function fujiSnowGeometry() {
  // the top of the cone, a hair wider, its lower edge pulled down into streaks along the ravines
  const from = FUJI.H * 0.6
  const pts = []
  for (let i = 0; i <= 6; i++) {
    const y = from + ((FUJI.H - from) * i) / 6
    pts.push(new THREE.Vector2(fujiR(y) * 1.012, y))
  }
  const geo = new THREE.LatheGeometry(pts, 54)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i)
    let y = p.getY(i)
    const a = Math.atan2(z, x)
    // how far this vertex sits from the cap's lower edge (0 = on it) - only the lowest rings stretch
    const k = 1 - Math.min(1, (y - from) / ((FUJI.H - from) * 0.4))
    if (k > 0) {
      const streak = Math.pow(0.5 + 0.5 * Math.sin(a * 13 + Math.sin(a * 5) * 2), 3) * 34 + Math.sin(a * 29) * 4
      y -= streak * k
      const r = fujiR(y) * 1.012
      p.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r)
    }
  }
  geo.computeBoundingSphere()
  return geo
}

// bend a beam's vertices up toward its ends (the upswept roof line of a torii)
function sweptBeam(w, h, d, lift) {
  const geo = new THREE.BoxGeometry(w, h, d, 24, 1, 1)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const t = p.getX(i) / (w / 2)
    p.setY(i, p.getY(i) + lift * Math.pow(Math.abs(t), 2.4))
  }
  return geo
}

function toriiGate(mat) {
  const g = new THREE.Group()
  const add = (geo, x, y, z = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.rotation.z = rz
    g.add(m)
  }
  const H = 50
  const pillar = new THREE.CylinderGeometry(2.4, 3, H, 12, 4, true)
  add(pillar, -21, H / 2, 0, -0.035) // pillars lean in a little
  add(pillar, 21, H / 2, 0, 0.035)
  const stone = new THREE.CylinderGeometry(4, 4.4, 2.6, 12, 1)
  add(stone, -21.4, 1.3)
  add(stone, 21.4, 1.3)
  add(sweptBeam(72, 4, 6.4, 4.2), 0, H + 6.2) // kasagi
  add(sweptBeam(64, 2.8, 5, 1.6), 0, H + 2.4) // shimaki
  add(new THREE.BoxGeometry(60, 3, 3.6, 16, 1, 1), 0, H - 11) // nuki (tie beam)
  add(new THREE.BoxGeometry(3.6, 10, 3.2), 0, H - 4) // gakuzuka (name plaque post)
  return g
}

// a tapered cylinder from a to b (radius r0 at a, r1 at b)
function limb(a, b, r0, r1, radial = 7) {
  const len = a.distanceTo(b)
  const geo = new THREE.CylinderGeometry(r1, r0, len, radial, 1, true)
  geo.translate(0, len / 2, 0)
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()))
  geo.translate(a.x, a.y, a.z)
  return geo.toNonIndexed()
}

const SAKURA = {
  dark: [0xffb7d0, 0xff8fb8, 0xffd9e6, 0xf7a1c4, 0xffffff],
  light: [0xf08cb0, 0xe0648f, 0xf5aac6, 0xd94f80, 0xfbd0df],
}

// A sakura: a thick, tapering trunk that splits into wide, low branches, each ending in a cloud of blossom
// (hundreds of soft pink dots), with a carpet of fallen petals on the ground underneath.
function sakuraTree(h, trunkMat, barkMat, bloomMat, carpetMat, palette, density = 1) {
  const g = new THREE.Group()
  const V = (x, y, z) => new THREE.Vector3(x, y, z)
  const lean = rand(-0.12, 0.12) * h
  const p0 = V(0, 0, 0)
  const p1 = V(lean * 0.4, h * 0.28, 0)
  const p2 = V(lean, h * 0.5, rand(-0.03, 0.03) * h)
  const R = h * 0.065
  const wood = []
  const bark = [] // line pairs: grain running along each limb, plus a few rings, drawn just above the surface
  const branch = (a, b, r0, r1, radial, lines) => {
    wood.push(limb(a, b, r0, r1, radial))
    const axis = b.clone().sub(a)
    const dir = axis.clone().normalize()
    const side = new THREE.Vector3(0, 1, 0).cross(dir)
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0)
    side.normalize()
    const up = dir.clone().cross(side)
    const at = (t, ang, out = 1.06) => {
      const r = (r0 + (r1 - r0) * t) * out
      return a.clone().addScaledVector(axis, t).addScaledVector(side, Math.cos(ang) * r).addScaledVector(up, Math.sin(ang) * r)
    }
    for (let k = 0; k < lines; k++) {
      let ang = (k / lines) * Math.PI * 2 + rand(-0.3, 0.3)
      const from = rand(0, 0.25)
      const to = rand(0.65, 1)
      let prev = at(from, ang)
      for (let t = from + 0.12; t <= to; t += 0.12) {
        ang += rand(-0.12, 0.12) // the grain wanders a little
        const p = at(t, ang)
        bark.push(prev, p)
        prev = p
      }
    }
    // a couple of rings (the horizontal marks on cherry bark)
    if (lines > 3) for (let k = 0; k < 2; k++) {
      const t = rand(0.15, 0.85)
      for (let j = 0; j < 8; j++) bark.push(at(t, (j / 8) * Math.PI * 2), at(t, ((j + 1) / 8) * Math.PI * 2))
    }
  }
  branch(V(0, -0.5, 0), V(0, h * 0.05, 0), R * 1.6, R * 1.05, 8, 6) // root flare
  branch(V(0, h * 0.05, 0), p1, R * 1.05, R * 0.8, 8, 7)
  branch(p1, p2, R * 0.8, R * 0.6, 8, 6)
  const clusters = [] // [centre, radius]
  const nb = 4 + Math.floor(Math.random() * 2)
  for (let i = 0; i < nb; i++) {
    const from = i === 0 ? p1 : p2
    const a = (i / nb) * Math.PI * 2 + rand(-0.35, 0.35)
    const reach = h * rand(0.32, 0.5)
    const mid = from.clone().add(V(Math.cos(a) * reach * 0.5, h * rand(0.1, 0.18), Math.sin(a) * reach * 0.5))
    const end = from.clone().add(V(Math.cos(a) * reach, h * rand(0.14, 0.3), Math.sin(a) * reach))
    branch(from, mid, R * 0.5, R * 0.32, 6, 3)
    branch(mid, end, R * 0.32, R * 0.12, 5, 2)
    clusters.push([end, h * rand(0.17, 0.24)], [mid.clone().add(V(0, h * 0.06, 0)), h * rand(0.12, 0.17)])
  }
  clusters.push([p2.clone().add(V(0, h * 0.28, 0)), h * 0.26])
  g.add(new THREE.Mesh(mergeGeometries(wood), trunkMat))
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(bark), barkMat))

  // blossom: dots filling flattened balls, a little denser toward the middle, in mixed pinks (and a few whites)
  const pos = []
  const col = []
  const c = new THREE.Color()
  const pick = () => c.setHex(palette[Math.floor(Math.random() * palette.length)])
  clusters.forEach(([ctr, r]) => {
    const count = Math.round(r * 11 * density)
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1
      const t = Math.random() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const k = r * Math.pow(Math.random(), 0.45)
      pos.push(ctr.x + Math.cos(t) * s * k * 1.25, ctr.y + u * k * 0.62, ctr.z + Math.sin(t) * s * k * 1.15)
      pick()
      col.push(c.r, c.g, c.b)
    }
  })
  const bg = new THREE.BufferGeometry()
  bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.add(new THREE.Points(bg, bloomMat))

  // fallen petals around the trunk, thinning out toward the edge of the canopy
  const cp = []
  const cc = []
  const spread = h * 0.6
  for (let i = 0; i < Math.round(130 * density); i++) {
    const t = Math.random() * Math.PI * 2
    const k = spread * Math.pow(Math.random(), 0.7)
    cp.push(Math.cos(t) * k, 0.2, Math.sin(t) * k)
    pick()
    cc.push(c.r, c.g, c.b)
  }
  const cg = new THREE.BufferGeometry()
  cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3))
  cg.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3))
  g.add(new THREE.Points(cg, carpetMat))
  return g
}

function stoneLanternGeometry() {
  const parts = [
    new THREE.BoxGeometry(6, 1.6, 6).translate(0, 0.8, 0), // base
    new THREE.CylinderGeometry(1.1, 1.4, 7, 6).translate(0, 5.1, 0), // post
    new THREE.BoxGeometry(4.6, 1.2, 4.6).translate(0, 9.2, 0), // platform
    new THREE.BoxGeometry(3.8, 4, 3.8, 2, 2, 2).translate(0, 11.8, 0), // fire box
    new THREE.ConeGeometry(4.6, 3.4, 4).rotateY(Math.PI / 4).translate(0, 15.5, 0), // roof
    new THREE.SphereGeometry(0.9, 6, 4).translate(0, 17.8, 0), // finial
  ]
  return mergeGeometries(parts.map((p) => p.toNonIndexed()))
}

function petalGeometry(size) {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(-0.55 * size, 0.3 * size, -0.5 * size, 0.85 * size, -0.12 * size, size)
  s.lineTo(0, 0.86 * size) // the notch at the tip
  s.lineTo(0.12 * size, size)
  s.bezierCurveTo(0.5 * size, 0.85 * size, 0.55 * size, 0.3 * size, 0, 0)
  return new THREE.ShapeGeometry(s, 4).translate(0, -size / 2, 0)
}

async function japan(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const n = (desk, mob) => (ctx.mobile ? mob : desk)
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending
  const violet = ctx.look.scene.wire[dark ? 'dark' : 'light']
  const torii = dark ? 0xff4a3d : 0xc8322b
  const palette = SAKURA[dark ? 'dark' : 'light']
  // Fuji's foot reaches FUJI.BASE in front of its axis; it must end behind the gate (GZ = -230), or the slope
  // swallows the gate's feet and the gate looks like it's floating on the mountainside
  const FZ = -540

  // dusk sky: magenta glow on the horizon fading up into violet
  d.group.add(skyGlow(dark
    ? [[0, 'rgba(120,80,220,0)'], [0.55, 'rgba(160,90,210,0.22)'], [0.85, 'rgba(255,120,170,0.45)'], [1, 'rgba(255,150,170,0.25)']]
    : [[0, 'rgba(190,160,255,0)'], [0.6, 'rgba(210,170,240,0.35)'], [0.9, 'rgba(255,170,200,0.55)'], [1, 'rgba(255,190,210,0.3)']],
  { additive: dark, y: GROUND + 120, height: 300 }))
  // dark: a pale moon; light: the red rising sun
  d.group.add(skyDisc(dark
    ? { r: 15, color: 0xfff2e6, halo: 0xd9b8ff, opacity: 0.75, x: 290, y: GROUND + 230, z: -520, additive: true }
    : { r: 30, color: 0xe2413a, halo: 0xff9a8a, opacity: 0.6, x: 290, y: GROUND + 200, z: -520, additive: false }))
  // puffy clouds in the dusk colours
  puffyClouds(d, { count: n(6, 4), color: dark ? 0xd9b4ff : 0xfff6fb, opacity: dark ? 0.2 : 0.9, blend, y: [150, 240] })

  // Mount Fuji, dead centre at the end of the path (close enough that its foot sits on the visible ground)
  const fujiCol = dark ? 0x6f62c9 : 0x4b3f99
  const snowCol = dark ? 0xf4f0ff : 0x8f8fd8
  const fuji = new THREE.Group()
  fuji.add(wireMesh(fujiGeometry(), fujiCol, dark ? 0.42 : 0.4))
  fuji.add(wireMesh(fujiSnowGeometry(), snowCol, dark ? 0.75 : 0.7))
  fuji.position.set(0, GROUND, FZ)
  occlude(fuji)
  d.group.add(fuji)
  // foothills around its base and the nearer hills, so it sits in the land instead of floating behind it
  const foot = wireMesh(ridgeGeometry({ width: 1000, depth: 60, height: 30, seed: 11, segX: 100 }), fujiCol, dark ? 0.3 : 0.32)
  foot.position.set(0, GROUND, FZ + 60)
  d.group.add(foot)
  const hills = wireMesh(ridgeGeometry({ width: 1100, depth: 70, height: 40, seed: 5, segX: 110 }), violet, dark ? 0.26 : 0.3)
  hills.position.set(0, GROUND, -310)
  d.group.add(hills)

  // the torii over the path, well in front of Fuji and smaller than it (the mountain towers over the gate)
  const gateMat = new THREE.MeshBasicMaterial({ color: torii, wireframe: true, transparent: true, opacity: dark ? 0.62 : 0.64, fog: false })
  const gate = toriiGate(gateMat)
  const GZ = -230
  gate.scale.setScalar(1.3)
  gate.position.set(0, GROUND, GZ)
  occlude(gate)
  d.group.add(gate)
  // the gate stands on a low two-step stone platform, so it meets the ground (not fogged: it stays crisp)
  const baseCol = dark ? 0xd8cce8 : 0x6a5f7c
  const baseGeo = mergeGeometries([
    new THREE.BoxGeometry(84, 1.6, 22).translate(0, 0.8, 0),
    new THREE.BoxGeometry(70, 1.4, 16).translate(0, 2.3, 0),
  ])
  const platform = new THREE.Group()
  platform.add(
    new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({ color: baseCol, transparent: true, opacity: dark ? 0.12 : 0.16, depthWrite: false, fog: false })),
    new THREE.LineSegments(new THREE.EdgesGeometry(baseGeo), new THREE.LineBasicMaterial({ color: baseCol, transparent: true, opacity: dark ? 0.6 : 0.65, fog: false })),
  )
  platform.position.set(0, GROUND, GZ)
  d.group.add(platform)

  // fog round the gate's foot: a soft pool lying on the ground plus thick drifting banks of mist, so the
  // lanterns, stones and trees that scroll past fade through it instead of visibly cutting through the gate
  const fogCol = dark ? 0x8e7bd8 : 0xfbf4fa
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(420, 150), new THREE.MeshBasicMaterial({
    map: dotTexture(), color: fogCol, transparent: true, opacity: dark ? 0.16 : 0.42, depthWrite: false, fog: false, blending: blend,
  }))
  pool.rotation.x = -Math.PI / 2
  pool.position.set(0, GROUND + 0.6, GZ + 10)
  d.group.add(pool)
  const mistMat = new THREE.SpriteMaterial({
    map: dotTexture(), color: fogCol, transparent: true, opacity: dark ? 0.085 : 0.3,
    depthWrite: false, fog: false, blending: blend,
  })
  const mist = Array.from({ length: n(80, 40) }, (_, i) => {
    const m = new THREE.Sprite(mistMat)
    const size = rand(36, 90)
    m.scale.set(size * 2, size * 0.42, 1)
    // most hug the gate's foot; a thinner band trails off along the ground either side
    const near = i % 3 !== 0
    m.position.set(near ? rand(-90, 90) : rand(-260, 260), GROUND + rand(1, near ? 10 : 6), GZ + rand(near ? -30 : -55, near ? 40 : 60))
    m.userData = { v: rand(1.5, 4) * (Math.random() < 0.5 ? -1 : 1), y: m.position.y, ph: rand(0, 6), near }
    d.group.add(m)
    return m
  })
  d.onUpdate((dt, t) => mist.forEach((m) => {
    const u = m.userData
    m.position.x += u.v * dt
    m.position.y = u.y + Math.sin(t * 0.4 + u.ph) * 1.2
    const lim = u.near ? 110 : 270
    if (m.position.x > lim) m.position.x = -lim
    if (m.position.x < -lim) m.position.x = lim
  }))

  // the approach: stepping stones down the middle with kerb lines either side, scrolling with the grid
  const stoneCol = dark ? 0xe6dcf0 : 0x6a5f7c
  const slabFill = new THREE.MeshBasicMaterial({ color: stoneCol, transparent: true, opacity: dark ? 0.1 : 0.14, depthWrite: false })
  const slabEdge = new THREE.LineBasicMaterial({ color: stoneCol, transparent: true, opacity: dark ? 0.55 : 0.6 })
  const slabGeo = new THREE.BoxGeometry(17, 0.6, 6.5)
  const slabLines = new THREE.EdgesGeometry(slabGeo)
  const props = []
  const SLABS = 38
  for (let i = 0; i < SLABS; i++) {
    const s = new THREE.Group()
    s.add(new THREE.Mesh(slabGeo, slabFill), new THREE.LineSegments(slabLines, slabEdge))
    s.position.set(rand(-0.6, 0.6), GROUND + 0.3, -300 + (i / SLABS) * 340)
    s.rotation.y = rand(-0.03, 0.03)
    d.group.add(s)
    props.push(s)
  }
  const kerb = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-11, GROUND + 0.1, -320), new THREE.Vector3(-11, GROUND + 0.1, 60),
    new THREE.Vector3(11, GROUND + 0.1, -320), new THREE.Vector3(11, GROUND + 0.1, 60),
  ])
  d.group.add(new THREE.LineSegments(kerb, slabEdge))

  // stone lanterns in pairs along the path
  const lanternGeo = stoneLanternGeometry()
  const stoneMat = new THREE.MeshBasicMaterial({ color: dark ? 0xc9bfd8 : 0x5d5470, wireframe: true, transparent: true, opacity: dark ? 0.3 : 0.36 })
  const glowMat = new THREE.SpriteMaterial({ map: dotTexture(), color: dark ? 0xffb35c : 0xe0802a, transparent: true, opacity: dark ? 0.85 : 0.6, depthWrite: false, blending: blend })
  const lanterns = []
  const pairs = n(7, 4)
  for (let i = 0; i < pairs; i++) {
    for (const side of [-1, 1]) {
      const g = new THREE.Group()
      g.add(new THREE.Mesh(lanternGeo, stoneMat))
      const glow = new THREE.Sprite(glowMat)
      glow.position.y = 11.8
      glow.scale.setScalar(9)
      g.add(glow)
      g.position.set(side * 16, GROUND, -300 + ((i + 0.5) / pairs) * 340) // well inside the gate's pillars
      d.group.add(g)
      props.push(g)
      lanterns.push(glow)
    }
  }

  // sakura trees either side
  const trunkMat = new THREE.MeshBasicMaterial({ color: dark ? 0x6e4864 : 0x5a3446, transparent: true, opacity: dark ? 0.9 : 0.85 })
  const barkMat = new THREE.LineBasicMaterial({ color: dark ? 0x2a1830 : 0x2e1a24, transparent: true, opacity: dark ? 0.75 : 0.55 })
  // crisp little flowers (alphaTest cuts the edge instead of fading it, so they don't look blurred)
  const bloomMat = new THREE.PointsMaterial({ size: 1.9, map: flowerTexture(), vertexColors: true, transparent: true, alphaTest: 0.45, opacity: 1 })
  const carpetMat = new THREE.PointsMaterial({ size: 1.3, map: flowerTexture(), vertexColors: true, transparent: true, alphaTest: 0.45, opacity: dark ? 0.85 : 0.9 })
  const nTrees = n(20, 9)
  for (let i = 0; i < nTrees; i++) {
    const t = sakuraTree(rand(28, 42), trunkMat, barkMat, bloomMat, carpetMat, palette, ctx.mobile ? 0.6 : 1.15)
    const side = i % 2 ? 1 : -1
    // kept clear of the gate's pillars (their crowns would cut through them as they scroll past)
    t.position.set(side * (58 + Math.pow(Math.random(), 1.4) * 120), GROUND, -300 + (i / nTrees) * 340 + rand(-6, 6))
    t.rotation.y = rand(0, Math.PI * 2)
    d.group.add(t)
    props.push(t)
  }
  scrollWithGrid(d, ctx, props)
  d.onUpdate((dt, t) => lanterns.forEach((l, i) => { l.material.opacity = (dark ? 0.75 : 0.55) + 0.12 * Math.sin(t * 3 + i * 1.7) }))

  // falling sakura petals: they tumble down on the breeze, land flat, lie there a while, then fall again
  const P = n(280, 120)
  const petals = new THREE.InstancedMesh(petalGeometry(1.5), new THREE.MeshBasicMaterial({
    color: dark ? 0xffc2d6 : 0xe57aa0, transparent: true, opacity: dark ? 0.85 : 0.8, side: THREE.DoubleSide, depthWrite: false,
  }), P)
  const spawn = (p, anywhere) => {
    p.x = rand(-200, 170)
    p.y = anywhere ? rand(GROUND, 100) : rand(70, 110)
    p.z = rand(-280, -14)
    p.land = 0
  }
  const st = Array.from({ length: P }, () => {
    const p = {
      v: rand(3, 7), sway: rand(0.6, 1.6), ph: rand(0, Math.PI * 2),
      rx: rand(0, 6), ry: rand(0, 6), rz: rand(0, 6), sx: rand(0.6, 1.8), sy: rand(0.4, 1.4), s: rand(0.6, 1.25),
    }
    spawn(p, true)
    return p
  })
  const o = new THREE.Object3D()
  d.group.add(petals)
  d.onUpdate((dt, t) => {
    const fwd = ctx.speed() * 60 * dt
    for (let i = 0; i < P; i++) {
      const p = st[i]
      p.z += fwd
      if (p.land > 0) {
        // lying on the ground, riding along with it
        p.land -= dt
        if (p.land <= 0 || p.z > -6) spawn(p, false)
        o.position.set(p.x, GROUND + 0.25, p.z)
        o.rotation.set(-Math.PI / 2, 0, p.rz)
      } else {
        p.y -= p.v * dt
        p.x += (Math.sin(t * 0.7 + p.ph) * p.sway + 2.2) * dt // a light breeze to the right
        if (p.x > 190) p.x = -190
        if (p.z > -14) p.z -= 266
        p.rx += p.sx * dt
        p.ry += p.sy * dt
        if (p.y <= GROUND + 0.25) p.land = rand(4, 9)
        o.position.set(p.x, p.y, p.z)
        o.rotation.set(p.rx, p.ry, p.rz + Math.sin(t + p.ph) * 0.6)
      }
      o.scale.setScalar(p.s)
      o.updateMatrix()
      petals.setMatrixAt(i, o.matrix)
    }
    petals.instanceMatrix.needsUpdate = true
  })
  return d.api
}

// ---------------------------------------------------------------- Desert
// Canyon country: a butte and a long mesa on the horizon, dunes, sandstone walls along the path, saguaro
// cacti, boulders, puffy clouds, tumbleweeds bouncing across, sand blowing over the ground and a few
// vultures circling high up.
function rockGeometry(w, h, d, layers = 3) {
  // stacked, slightly offset strata with chunky noise, like weathered sandstone
  const parts = []
  let y = 0
  for (let i = 0; i < layers; i++) {
    const lh = (h / layers) * rand(0.8, 1.2)
    const k = 1 - i * rand(0.08, 0.16)
    const box = mergeVertices(new THREE.BoxGeometry(w * k, lh, d * k, Math.max(2, Math.round(w / 14)), 2, Math.max(2, Math.round(d / 14))).deleteAttribute('normal').deleteAttribute('uv'))
    const p = box.attributes.position
    for (let j = 0; j < p.count; j++) {
      const nx = p.getX(j), ny = p.getY(j), nz = p.getZ(j)
      const jag = Math.sin(nx * 0.21 + i * 3) * Math.cos(nz * 0.17 + i) * 0.14 + rand(-0.09, 0.09)
      const top = ny > 0
      p.setXYZ(j, nx * (1 + jag) + rand(-1.2, 1.2), ny + (top ? rand(-lh * 0.22, lh * 0.08) : rand(-lh * 0.05, 0)), nz * (1 + jag) + rand(-1.2, 1.2))
    }
    box.translate(rand(-w * 0.04, w * 0.04), y + lh / 2, rand(-d * 0.04, d * 0.04))
    parts.push(box.toNonIndexed())
    y += lh * 0.98
  }
  return mergeGeometries(parts)
}

function saguaroGeometry(h) {
  const r = h * 0.085
  const parts = [
    new THREE.CylinderGeometry(r, r * 1.08, h, 8, 3, true).translate(0, h / 2, 0),
    new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, h, 0),
  ]
  const arms = 1 + Math.floor(Math.random() * 2)
  const first = Math.random() < 0.5 ? -1 : 1
  for (let i = 0; i < arms; i++) {
    const side = i === 0 ? first : -first // a second arm goes on the other side
    const ar = r * 0.72
    const at = h * rand(0.35, 0.55)
    const out = h * rand(0.16, 0.22)
    const up = h * rand(0.22, 0.34)
    const elbow = new THREE.CylinderGeometry(ar, ar, out, 8, 1, true).rotateZ(Math.PI / 2).translate(side * out / 2, at, 0)
    const rise = new THREE.CylinderGeometry(ar, ar, up, 8, 2, true).translate(side * out, at + up / 2, 0)
    const cap = new THREE.SphereGeometry(ar, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(side * out, at + up, 0)
    parts.push(elbow, rise, cap)
  }
  return mergeGeometries(parts.map((p) => p.toNonIndexed()))
}

function tumbleweedGeometry(r) {
  const geo = new THREE.IcosahedronGeometry(r, 1)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const k = rand(0.7, 1.15)
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k)
  }
  // a second, rotated tangle inside for the twiggy look
  const inner = new THREE.IcosahedronGeometry(r * 0.7, 0).rotateX(0.6).rotateZ(0.4)
  return mergeGeometries([geo.toNonIndexed(), inner.toNonIndexed()])
}

async function desert(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const n = (desk, mob) => (ctx.mobile ? mob : desk)
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending
  const rockCol = dark ? 0xe0864a : 0xa8501c
  const farRock = dark ? 0xc77a8f : 0x9a5a4a // distant rock goes rosy in the haze, like the reference
  const sand = dark ? 0xf2c27a : 0xb98242
  const green = dark ? 0x86d16a : 0x3f7f35

  // sky: dark = sunset glow on the horizon, light = a bright warm haze
  d.group.add(skyGlow(dark
    ? [[0, 'rgba(120,60,140,0)'], [0.5, 'rgba(200,90,120,0.2)'], [0.85, 'rgba(255,150,80,0.45)'], [1, 'rgba(255,190,110,0.3)']]
    : [[0, 'rgba(96,165,232,0.6)'], [0.45, 'rgba(140,195,245,0.45)'], [0.8, 'rgba(255,205,200,0.45)'], [1, 'rgba(255,225,190,0.35)']],
  { additive: dark, y: dark ? GROUND + 115 : GROUND + 260, height: dark ? 320 : 620 }))
  const sun = skyDisc(dark
    ? { r: 30, color: 0xffa04a, halo: 0xff6a3a, opacity: 0.55, x: 30, y: GROUND + 55, z: -470, additive: true }
    : { r: 20, color: 0xfff6d8, halo: 0xffe08a, opacity: 0.9, x: 150, y: GROUND + 230, z: -470, additive: false })
  d.group.add(sun)

  if (dark) {
    const stars = particles(ctx, {
      count: n(260, 120), color: 0xfff1dc, size: 0.9, drift: 0.05, opacity: 0.8,
      box: { x: [-500, 500], y: [GROUND + 170, GROUND + 420], z: [-480, -430] },
    })
    stars.points.material.fog = false
    d.group.add(stars.points)
    d.onUpdate(stars.update)
  }

  // puffy clouds drifting slowly
  puffyClouds(d, { count: n(6, 4), color: dark ? 0xf3b8cf : 0xffffff, opacity: dark ? 0.22 : 0.85, blend })

  // horizon: a tall butte (centre right), a long mesa (left), dunes in front
  const far = (geo, x, z, op) => {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: farRock, wireframe: true, transparent: true, opacity: op, fog: false })))
    g.position.set(x, GROUND, z)
    occlude(g)
    d.group.add(g)
  }
  far(rockGeometry(60, 125, 50, 4), 120, -360, dark ? 0.42 : 0.45)
  far(rockGeometry(34, 80, 30, 3), 168, -375, dark ? 0.32 : 0.36)
  far(rockGeometry(230, 58, 70, 3), -210, -385, dark ? 0.36 : 0.4)
  const dunes = wireMesh(ridgeGeometry({ width: 1200, depth: 80, height: 34, seed: 9, segX: 100 }), sand, dark ? 0.3 : 0.34)
  dunes.position.set(0, GROUND, -310)
  d.group.add(dunes)
  const dunes2 = wireMesh(ridgeGeometry({ width: 1100, depth: 60, height: 18, seed: 13, segX: 90 }), sand, dark ? 0.22 : 0.26)
  dunes2.position.set(0, GROUND, -250)
  d.group.add(dunes2)

  // along the path: sandstone walls further out, cacti and boulders nearer, all scrolling with the grid
  const props = []
  const rockMat = new THREE.MeshBasicMaterial({ color: rockCol, wireframe: true, transparent: true, opacity: dark ? 0.34 : 0.4 })
  const nWalls = n(10, 6)
  for (let i = 0; i < nWalls; i++) {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(rockGeometry(rand(40, 80), rand(45, 110), rand(30, 55), 2 + Math.floor(Math.random() * 3)), rockMat))
    occlude(g)
    const side = i % 2 ? 1 : -1
    g.position.set(side * rand(130, 220), GROUND, -300 + (i / nWalls) * 340)
    g.rotation.y = rand(-0.4, 0.4)
    d.group.add(g)
    props.push(g)
  }
  const cactusMat = new THREE.MeshBasicMaterial({ color: green, wireframe: true, transparent: true, opacity: dark ? 0.38 : 0.42 })
  const cactusGeos = [22, 28, 34, 40].map(saguaroGeometry)
  const nCac = n(24, 12)
  for (let i = 0; i < nCac; i++) {
    const c = new THREE.Mesh(cactusGeos[i % cactusGeos.length], cactusMat)
    const side = i % 2 ? 1 : -1
    c.position.set(side * rand(30, 120), GROUND, -300 + (i / nCac) * 340 + rand(-5, 5))
    c.rotation.y = rand(0, Math.PI * 2)
    c.scale.setScalar(rand(0.8, 1.2))
    d.group.add(c)
    props.push(c)
  }
  const boulderMat = new THREE.MeshBasicMaterial({ color: rockCol, wireframe: true, transparent: true, opacity: dark ? 0.28 : 0.34 })
  const nBould = n(16, 8)
  for (let i = 0; i < nBould; i++) {
    const geo = new THREE.DodecahedronGeometry(rand(3, 7), 0)
    geo.scale(rand(1, 1.6), rand(0.5, 0.8), rand(1, 1.4))
    const b = new THREE.Mesh(geo, boulderMat)
    const side = i % 2 ? 1 : -1
    b.position.set(side * rand(22, 110), GROUND + 1.5, -300 + (i / nBould) * 340 + rand(-8, 8))
    b.rotation.y = rand(0, Math.PI)
    d.group.add(b)
    props.push(b)
  }
  scrollWithGrid(d, ctx, props)

  // tumbleweeds rolling and bouncing across the path
  const weedMat = new THREE.MeshBasicMaterial({ color: dark ? 0xd9b07a : 0x8a6234, wireframe: true, transparent: true, opacity: dark ? 0.5 : 0.55 })
  const weeds = Array.from({ length: n(5, 3) }, () => {
    const r = rand(3, 5)
    const m = new THREE.Mesh(tumbleweedGeometry(r), weedMat)
    m.userData = { r, dir: Math.random() < 0.5 ? 1 : -1, v: rand(14, 26), hop: rand(1.6, 2.6), ph: rand(0, 6) }
    m.position.set(rand(-180, 180), GROUND + r, rand(-220, -40))
    d.group.add(m)
    return m
  })
  d.onUpdate((dt, t) => weeds.forEach((m) => {
    const u = m.userData
    m.position.x += u.dir * u.v * dt
    m.position.z += ctx.speed() * 60 * dt
    m.position.y = GROUND + u.r + Math.abs(Math.sin(t * u.hop + u.ph)) * u.r * 1.4
    m.rotation.z -= (u.dir * u.v * dt) / u.r
    m.rotation.x += dt * 0.3
    if (Math.abs(m.position.x) > 200 || m.position.z > -20) {
      u.dir = Math.random() < 0.5 ? 1 : -1
      m.position.set(-u.dir * 195, GROUND + u.r, rand(-240, -60))
    }
  }))

  // sand blowing low over the ground
  const S = n(420, 160)
  const sPos = new Float32Array(S * 3)
  const sV = new Float32Array(S)
  for (let i = 0; i < S; i++) {
    sPos.set([rand(-200, 200), GROUND + Math.pow(Math.random(), 2) * 14, rand(-260, -8)], i * 3)
    sV[i] = rand(10, 30)
  }
  const sGeo = new THREE.BufferGeometry()
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
  const sMat = new THREE.PointsMaterial({ color: sand, size: 0.7, map: dotTexture(), transparent: true, opacity: dark ? 0.7 : 0.75, depthWrite: false, blending: blend })
  d.group.add(new THREE.Points(sGeo, sMat))
  d.onUpdate((dt, t) => {
    for (let i = 0; i < S; i++) {
      sPos[i * 3] += sV[i] * dt
      sPos[i * 3 + 1] += Math.sin(t * 2 + i) * 0.02
      if (sPos[i * 3] > 200) sPos[i * 3] = -200
    }
    sGeo.attributes.position.needsUpdate = true
  })

  // vultures circling high over the canyon
  const birdGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-4, 1.2, 0), new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(1.6, 0, 0), new THREE.Vector3(1.6, 0, 0), new THREE.Vector3(4, 1.2, 0),
  ])
  const birdMat = new THREE.LineBasicMaterial({ color: dark ? 0xfbe8cf : 0x3b2213, transparent: true, opacity: 0.7, fog: false })
  const birds = Array.from({ length: n(3, 2) }, (_, i) => {
    const b = new THREE.LineSegments(birdGeo, birdMat)
    b.userData = { r: rand(28, 48), w: rand(0.18, 0.3) * (i % 2 ? 1 : -1), ph: rand(0, 6), y: GROUND + rand(120, 160) }
    d.group.add(b)
    return b
  })
  d.onUpdate((dt, t) => birds.forEach((b) => {
    const u = b.userData
    const a = t * u.w + u.ph
    b.position.set(100 + Math.cos(a) * u.r, u.y + Math.sin(a * 2) * 3, -300 + Math.sin(a) * u.r * 0.5)
    b.scale.set(2, 2 * (0.6 + 0.4 * Math.sin(t * 5 + u.ph)), 2) // lazy wing beats
  }))
  return d.api
}

const BUILDERS = { nature, cyberpunk, futuristic, retro, greek, angkor, 'deep-ocean': deepOcean, volcano, atomic, japan, desert }

/**
 * @param {string} id look id
 * @param {{scene, renderer, isDark:boolean, mobile:boolean, models:boolean, speed:() => number, cancelled:() => boolean}} ctx
 */
export async function buildDecor(id, ctx) {
  const build = BUILDERS[id] || (ctx.look?.scene?.ambient ? ambient : null)
  return build ? build(ctx) : null
}

