// 3D background for Desert, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { GROUND, rand, dotTexture, makeDecor, particles, wireMesh, scrollWithGrid, occlude } from '../shared/scene/kit.js'
import { ridgeGeometry } from '../shared/scene/geometry.js'
import { skyGlow, skyDisc, puffyClouds } from '../shared/scene/sky.js'

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

export default async function desert(ctx) {
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
