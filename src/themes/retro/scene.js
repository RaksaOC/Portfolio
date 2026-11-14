// 3D background for Retro (synthwave), layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { GROUND, rand, loadModel, useEnvironment, makeDecor, particles } from '../shared/scene/kit.js'
import { wireCar } from '../shared/scene/wire-car.js'
import ferrariUrl from './models/ferrari.glb?url'
import truckUrl from './models/milk-truck.glb?url'

export default async function retro(ctx) {
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
    const [ferrari, truck] = await Promise.all([loadModel(ferrariUrl), loadModel(truckUrl)])
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
