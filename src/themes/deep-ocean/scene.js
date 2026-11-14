// 3D background for Deep Ocean, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { GROUND, rand, dotTexture, makeDecor, risingSparks, wireMesh, scrollWithGrid } from '../shared/scene/kit.js'

// Rising bubbles, pulsing jellyfish, coral reefs with swaying seagrass and a fish school
export default async function deepOcean(ctx) {
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
