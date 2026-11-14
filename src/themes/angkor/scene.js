// 3D background for Angkor, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { GROUND, rand, dotTexture, makeDecor, particles, wireMesh, scrollWithGrid, occlude } from '../shared/scene/kit.js'
import { ridgeGeometry } from '../shared/scene/geometry.js'

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

export default async function angkor(ctx) {
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
