// 3D background for Greek, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { GROUND, rand, makeDecor, particles, wireMesh, scrollWithGrid, occlude } from '../shared/scene/kit.js'
import { roundTreeGeometry, ridgeGeometry } from '../shared/scene/geometry.js'

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

export default async function greek(ctx) {
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
