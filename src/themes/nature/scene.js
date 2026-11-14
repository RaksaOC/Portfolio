// 3D background for Nature, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { GROUND, rand, dotTexture, makeDecor, particles } from '../shared/scene/kit.js'
import { roundTreeGeometry, ridgeGeometry } from '../shared/scene/geometry.js'

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

export default async function nature(ctx) {
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
