// 3D background for Atomic, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { GROUND, rand, dotTexture, makeDecor, particles, scrollWithGrid } from '../shared/scene/kit.js'

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

export default async function atomic(ctx) {
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
