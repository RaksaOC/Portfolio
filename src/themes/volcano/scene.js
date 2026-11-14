// 3D background for Volcano, layered over the base wireframe grid (components/background/Background.vue).
// Loaded lazily from the theme's index.js (loadScene), so only the active theme's scene is downloaded.

import * as THREE from 'three'
import { GROUND, rand, dotTexture, makeDecor, risingSparks, wireMesh } from '../shared/scene/kit.js'
import { ridgeGeometry } from '../shared/scene/geometry.js'

// A wireframe volcano on the horizon: glowing crater pool, thick lava rivers with flowing blobs, lava
// bombs that splash where they land on the slope, a smoke column and embers drifting everywhere.
function volcanoGeometry() {
  const pts = []
  const base = 190
  const rim = 26
  const h = 135
  for (let i = 0; i <= 14; i++) {
    const t = i / 14
    // concave flank: steep near the top, flaring at the base
    pts.push(new THREE.Vector2(rim + (base - rim) * Math.pow(1 - t, 2.2), h * t))
  }
  pts.push(new THREE.Vector2(rim * 0.7, h - 10)) // crater dip
  return new THREE.LatheGeometry(pts.reverse().map((v) => v), 30)
}

export default async function volcano(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const lava = ctx.look.scene.wire[dark ? 'dark' : 'light']
  const hot = dark ? 0xffc04d : 0xe0601a // bright core / droplets
  const rock = dark ? 0x7a2a14 : 0x4a1f10
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending
  const n = (desk, mob) => (ctx.mobile ? mob : desk)
  const Z = -330
  const H = 135
  const RIM = 26
  const BASE = 190
  // height of the flank at a distance r from the axis (inverse of the lathe profile)
  const surfaceY = (r) => {
    if (r >= BASE) return GROUND
    if (r <= RIM) return GROUND + H - 8
    return GROUND + H * (1 - Math.pow((r - RIM) / (BASE - RIM), 1 / 2.2))
  }

  const cone = wireMesh(volcanoGeometry(), rock, dark ? 0.5 : 0.45)
  cone.position.set(0, GROUND, Z)
  d.group.add(cone)
  const ranges = wireMesh(ridgeGeometry({ width: 1000, depth: 70, height: 70, seed: 3 }), rock, dark ? 0.28 : 0.3)
  ranges.position.set(0, GROUND, Z + 20)
  d.group.add(ranges)

  const top = new THREE.Vector3(0, GROUND + H, Z)
  // crater glow + a bubbling lava pool
  const glowMat = new THREE.PointsMaterial({ color: lava, size: 52, map: dotTexture(), transparent: true, opacity: dark ? 0.75 : 0.5, depthWrite: false, blending: blend, fog: false })
  d.group.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints([top.clone().add(new THREE.Vector3(0, -4, 0))]), glowMat))
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(RIM * 0.85, 24),
    new THREE.MeshBasicMaterial({ color: lava, transparent: true, opacity: 0.7, blending: blend, depthWrite: false, fog: false, side: THREE.DoubleSide }),
  )
  pool.rotation.x = -Math.PI / 2
  pool.position.copy(top).add(new THREE.Vector3(0, -6, 0))
  d.group.add(pool)

  // lava rivers: thick glowing tubes with a bright core, blobs of lava flowing down them
  const rivers = []
  const flows = []
  for (let r = 0; r < 5; r++) {
    const a = rand(-0.9, 0.9) + Math.PI / 2 // toward the camera side
    const pts = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const rad = RIM + (BASE - RIM) * Math.pow(t, 0.45) * 0.95
      const aa = a + Math.sin(t * 9 + r) * 0.09
      pts.push(new THREE.Vector3(Math.cos(aa) * rad, surfaceY(rad) - GROUND + 1, Math.sin(aa) * rad))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const width = rand(2.2, 3.6)
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, width, 6, false),
      new THREE.MeshBasicMaterial({ color: lava, transparent: true, opacity: 0.55, blending: blend, depthWrite: false, fog: false }),
    )
    const core = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, width * 0.35, 4, false),
      new THREE.MeshBasicMaterial({ color: hot, transparent: true, opacity: 0.9, blending: blend, depthWrite: false, fog: false }),
    )
    for (const m of [tube, core]) { m.position.set(0, GROUND, Z); d.group.add(m) }
    tube.userData.p = Math.random() * 6
    rivers.push(tube)
    // flowing blobs
    const F = n(26, 12)
    const fPos = new Float32Array(F * 3)
    const fu = Float32Array.from({ length: F }, () => Math.random())
    const fGeo = new THREE.BufferGeometry()
    fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3))
    const fPts = new THREE.Points(fGeo, new THREE.PointsMaterial({
      color: hot, size: width * 1.6, map: dotTexture(), transparent: true, depthWrite: false, blending: blend, fog: false,
    }))
    fPts.position.set(0, GROUND, Z)
    d.group.add(fPts)
    flows.push({ curve, fPos, fu, fGeo, speed: rand(0.04, 0.08) })
  }

  // eruption: lava bombs (big chunks + small spatter) on ballistic arcs that splash where they land
  const makeBombs = (count, size, color) => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    d.group.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color, size, map: dotTexture(), transparent: true, depthWrite: false, blending: blend, fog: false,
    })))
    const spawn = (i) => {
      pos.set([top.x + rand(-8, 8), top.y - 4, top.z + rand(-8, 8)], i * 3)
      vel.set([rand(-26, 26), rand(45, 95), rand(-14, 26)], i * 3)
    }
    for (let i = 0; i < count; i++) { spawn(i); pos[i * 3 + 1] = -9999 } // start "landed": they launch in a stream
    return { pos, vel, geo, spawn, count }
  }
  const chunks = makeBombs(n(70, 30), 4.2, lava)
  const spatter = makeBombs(n(200, 80), 1.8, hot)

  // splash droplets: a small pool reused round-robin
  const S = n(360, 140)
  const sPos = new Float32Array(S * 3).fill(-9999)
  const sVel = new Float32Array(S * 3)
  const sLife = new Float32Array(S)
  const sGeo = new THREE.BufferGeometry()
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
  const sMat = new THREE.PointsMaterial({ color: hot, size: 1.6, map: dotTexture(), transparent: true, depthWrite: false, blending: blend, fog: false })
  d.group.add(new THREE.Points(sGeo, sMat))
  let sNext = 0
  const splash = (x, y, z, amount) => {
    for (let k = 0; k < amount; k++) {
      const i = sNext
      sNext = (sNext + 1) % S
      sPos.set([x, y, z], i * 3)
      const a = rand(0, Math.PI * 2)
      const sp = rand(6, 16)
      sVel.set([Math.cos(a) * sp, rand(8, 20), Math.sin(a) * sp], i * 3)
      sLife[i] = rand(0.5, 0.9)
    }
  }

  // smoke column
  const smoke = risingSparks(ctx, {
    count: n(60, 24), color: dark ? 0x5a4a46 : 0x8a7a72, size: 26, speed: [6, 12], sway: 0.15,
    box: { x: [-14, 14], y: [GROUND + H, GROUND + H + 120], z: [Z - 10, Z + 10] },
  })
  smoke.points.material.blending = THREE.NormalBlending
  smoke.points.material.opacity = dark ? 0.16 : 0.22
  smoke.points.material.fog = false
  d.group.add(smoke.points)

  // embers in the air
  const embers = risingSparks(ctx, { count: n(260, 110), color: lava, size: 1.5, box: { x: [-180, 180], y: [GROUND, 90], z: [-260, -10] } })
  d.group.add(embers.points)

  let launch = 0
  const stepBombs = (b, dt, splashAmount) => {
    const { pos, vel, spawn, count } = b
    for (let i = 0; i < count; i++) {
      const j = i * 3
      if (pos[j + 1] < -9000) continue
      vel[j + 1] -= 34 * dt
      pos[j] += vel[j] * dt
      pos[j + 1] += vel[j + 1] * dt
      pos[j + 2] += vel[j + 2] * dt
      const ground = surfaceY(Math.hypot(pos[j] - top.x, pos[j + 2] - Z))
      if (vel[j + 1] < 0 && pos[j + 1] <= ground) {
        splash(pos[j], ground + 0.5, pos[j + 2], splashAmount)
        pos[j + 1] = -9999 // parked until relaunched
      }
    }
    b.geo.attributes.position.needsUpdate = true
  }
  const relaunch = (b, k) => {
    for (let i = 0, done = 0; i < b.count && done < k; i++) if (b.pos[i * 3 + 1] < -9000) { b.spawn(i); done++ }
  }

  d.onUpdate((dt, t) => {
    smoke.update(dt, t)
    embers.update(dt, t)
    // bursts: a steady stream with a bigger pulse every few seconds
    launch += dt * (ctx.mobile ? 22 : 45) * (1 + 2.5 * Math.max(0, Math.sin(t * 0.9)) ** 6)
    const k = Math.floor(launch)
    launch -= k
    relaunch(spatter, k)
    if (Math.random() < dt * 9) relaunch(chunks, 1)
    stepBombs(chunks, dt, 6)
    stepBombs(spatter, dt, 2)
    for (let i = 0; i < S; i++) {
      if (sLife[i] <= 0) continue
      const j = i * 3
      sLife[i] -= dt
      sVel[j + 1] -= 40 * dt
      sPos[j] += sVel[j] * dt
      sPos[j + 1] += sVel[j + 1] * dt
      sPos[j + 2] += sVel[j + 2] * dt
      if (sLife[i] <= 0) sPos[j + 1] = -9999
    }
    sGeo.attributes.position.needsUpdate = true
    flows.forEach((f) => {
      for (let i = 0; i < f.fu.length; i++) {
        f.fu[i] = (f.fu[i] + dt * f.speed) % 1
        const p = f.curve.getPointAt(f.fu[i])
        f.fPos.set([p.x + rand(-0.4, 0.4), p.y + 1.2, p.z + rand(-0.4, 0.4)], i * 3)
      }
      f.fGeo.attributes.position.needsUpdate = true
    })
    glowMat.size = 52 + Math.sin(t * 3) * 7 + Math.sin(t * 7.3) * 3
    pool.material.opacity = 0.55 + 0.2 * Math.sin(t * 4.1) * Math.sin(t * 1.7)
    rivers.forEach((rv) => { rv.material.opacity = 0.45 + 0.2 * Math.sin(t * 2 + rv.userData.p) })
  })
  return d.api
}
