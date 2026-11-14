// 3D background for Cyberpunk, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { GROUND, rand, makeDecor } from '../shared/scene/kit.js'

export default async function cyberpunk(ctx) {
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
