// 3D background for Futuristic, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { GROUND, loadModel, makeDecor, particles } from '../shared/scene/kit.js'
import robotUrl from './models/robot.glb?url'

export default async function futuristic(ctx) {
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
    const robot = await loadModel(robotUrl)
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
