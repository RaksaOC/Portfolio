// 3D background for Japan, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { GROUND, rand, dotTexture, makeDecor, wireMesh, scrollWithGrid, occlude } from '../shared/scene/kit.js'
import { ridgeGeometry } from '../shared/scene/geometry.js'
import { skyGlow, skyDisc, puffyClouds, flowerTexture } from '../shared/scene/sky.js'

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

export default async function japan(ctx) {
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
