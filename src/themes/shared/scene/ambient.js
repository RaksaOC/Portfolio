// Shared ambient 3D scene for the themes ported from study-hub (no scene of their own): loaded through their
// index.js (loadScene), with `scene.ambient` choosing the flavour listed below.

import * as THREE from 'three'
import { audio, sampleAudio } from '../../../core/music.js'
import { GROUND, rand, dotTexture, makeDecor, particles, risingSparks } from './kit.js'

// One light-weight scene in the theme's accent colour; `look.scene.ambient` picks the flavour:
//   bokeh  - big soft lights drifting       shapes - floating wireframe solids
//   blocks - wire cubes riding the grid      orbits - huge rotating arcs on the horizon
//   bars   - equaliser bars pulsing          code   - falling terminal glyph streaks
//   embers - rising sparks + brass gears
export default async function ambient(ctx) {
  const d = makeDecor(ctx)
  const dark = ctx.isDark
  const look = ctx.look
  const color = new THREE.Color(look.scene.wire[dark ? 'dark' : 'light'])
  const kind = look.scene.ambient
  const n = (desk, mob) => (ctx.mobile ? mob : desk)

  const dust = particles(ctx, {
    count: n(220, 90), color, size: 0.8, drift: 0.25, additive: dark, opacity: 0.6,
    box: { x: [-200, 200], y: [GROUND, 90], z: [-280, -20] },
  })
  d.group.add(dust.points)
  d.onUpdate(dust.update)

  const lineMat = (o = 0.6) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? o : Math.min(1, o + 0.2) })
  const scroll = (objs, wrapAt = 40, span = 340) => d.onUpdate((dt) => objs.forEach((o) => {
    o.position.z += ctx.speed() * 60 * dt
    if (o.position.z > wrapAt) o.position.z -= span
  }))

  if (kind === 'bokeh') {
    const big = particles(ctx, {
      count: n(40, 18), color, size: 9, drift: 1.2, additive: dark, opacity: dark ? 0.35 : 0.25,
      box: { x: [-180, 180], y: [-10, 80], z: [-240, -60] },
    })
    d.group.add(big.points)
    d.onUpdate(big.update)
  }

  if (kind === 'shapes') {
    const geos = [new THREE.IcosahedronGeometry(6, 0), new THREE.OctahedronGeometry(6, 0), new THREE.TorusGeometry(5, 1.6, 6, 16), new THREE.SphereGeometry(5, 10, 8)]
    const shapes = Array.from({ length: n(16, 8) }, (_, i) => {
      const m = new THREE.LineSegments(new THREE.EdgesGeometry(geos[i % geos.length], 1), lineMat(0.7))
      const side = i % 2 ? 1 : -1
      m.position.set(side * rand(30, 150), rand(-10, 60), rand(-260, -40))
      m.scale.setScalar(rand(0.7, 1.8))
      m.userData = { spin: rand(0.2, 0.7), bob: Math.random() * 6, y: m.position.y }
      d.group.add(m)
      return m
    })
    d.onUpdate((dt, t) => shapes.forEach((m) => {
      m.rotation.x += m.userData.spin * dt
      m.rotation.y += m.userData.spin * 0.7 * dt
      m.position.y = m.userData.y + Math.sin(t * 0.6 + m.userData.bob) * 4
    }))
  }

  if (kind === 'blocks') {
    const cubes = Array.from({ length: n(40, 18) }, (_, i) => {
      const s = rand(6, 22)
      const m = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s * rand(0.6, 2.4), s)), lineMat(0.65))
      const side = i % 2 ? 1 : -1
      m.position.set(side * rand(35, 160), GROUND + (s * 0.6), rand(-300, 40))
      d.group.add(m)
      return m
    })
    scroll(cubes)
  }

  if (kind === 'orbits') {
    const arcs = [120, 160, 200].map((r, i) => {
      const pts = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * (1.1 + i * 0.25)).getPoints(160)
      const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.7 - i * 0.15))
      arc.position.set(0, GROUND + 10, -260)
      arc.rotation.x = -0.25 - i * 0.12
      arc.material.fog = false
      d.group.add(arc)
      return arc
    })
    const planet = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(38, 2), 1), lineMat(0.45))
    planet.material.fog = false
    planet.position.set(0, GROUND + 10, -270)
    d.group.add(planet)
    d.onUpdate((dt) => {
      arcs.forEach((a, i) => { a.rotation.z += dt * (0.08 + i * 0.05) * (i % 2 ? -1 : 1) })
      planet.rotation.y += dt * 0.05
    })
  }

  // Night Session: an equaliser that plays the theme's song (core/music.js routes it through an analyser).
  // The volume is applied before the analyser, so everything shrinks with the slider; muted / not started,
  // the bars fall back to a lazy idle bounce
  if (kind === 'bars') {
    const BANDS = audio.bands.length
    const bars = []
    const perSide = n(24, 12)
    ;[-1, 1].forEach((side) => {
      for (let i = 0; i < perSide; i++) {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: dark ? 0.55 : 0.7 })
        const bar = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), mat)
        bar.position.set(side * (40 + (i % 4) * 12), GROUND, -40 - Math.floor(i / 4) * 40)
        // nearest row = bass, further rows climb the spectrum; the outer columns take the higher half of each row
        bar.userData = { phase: Math.random() * 6, h: rand(10, 60), band: Math.floor((i / perSide) * BANDS), base: mat.opacity }
        d.group.add(bar)
        bars.push(bar)
      }
    })

    // a round equaliser on the horizon: spokes mirrored left / right, a ring that kicks with the bass
    const SPOKES = n(96, 64)
    const R = 40
    const spokePos = new Float32Array(SPOKES * 6)
    const spokeGeo = new THREE.BufferGeometry()
    spokeGeo.setAttribute('position', new THREE.BufferAttribute(spokePos, 3))
    const spokes = new THREE.LineSegments(spokeGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? 0.85 : 0.9, fog: false }))
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, k) => new THREE.Vector3(Math.cos((k / 96) * Math.PI * 2) * R, Math.sin((k / 96) * Math.PI * 2) * R, 0))),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? 0.7 : 0.8, fog: false }),
    )
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTexture(), color, transparent: true, opacity: 0, depthWrite: false, fog: false,
      blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
    }))
    halo.scale.set(R * 4, R * 4, 1)
    const eq = new THREE.Group()
    eq.add(halo, ring, spokes)
    eq.position.set(0, GROUND + 84, -250)
    d.group.add(eq)

    let mix = 0 // 0 idle .. 1 following the music, eased so mute / unmute doesn't jump
    let kick = 0
    d.onUpdate((dt, t) => {
      const a = sampleAudio()
      mix += ((a.live ? 1 : 0) - mix) * Math.min(1, dt * 3)
      kick = Math.max(a.bass, kick - dt * 1.8)
      for (const b of bars) {
        const u = b.userData
        const idle = 2 + u.h * 0.6 * (0.5 + 0.5 * Math.abs(Math.sin(t * 2.4 + u.phase)))
        const live = 2 + a.bands[u.band] * 52
        const h = idle * (1 - mix) + live * mix
        b.scale.y = h
        b.position.y = GROUND + h / 2
        b.material.opacity = Math.min(1, u.base + 0.4 * a.bands[u.band] * mix)
      }
      for (let k = 0; k < SPOKES; k++) {
        const ang = (k / SPOKES) * Math.PI * 2 + Math.PI / 2
        // mirrored: the bass sits at the top and bottom of the ring, highs at the sides
        const m = k < SPOKES / 2 ? k : SPOKES - k
        const band = Math.min(BANDS - 1, Math.floor((m / (SPOKES / 2)) * BANDS * 0.85))
        const idle = 1.5 + 1.5 * Math.abs(Math.sin(t * 1.6 + k * 0.4))
        const len = idle * (1 - mix) + (1 + a.bands[band] * 26) * mix
        const r0 = R + 2 + kick * 4 * mix
        const c = Math.cos(ang), s = Math.sin(ang)
        spokePos.set([c * r0, s * r0, 0, c * (r0 + len), s * (r0 + len), 0], k * 6)
      }
      spokeGeo.attributes.position.needsUpdate = true
      const pulse = 1 + kick * 0.14 * mix
      ring.scale.setScalar(pulse)
      ring.rotation.z += dt * 0.1
      halo.material.opacity = (dark ? 0.12 : 0.1) + (dark ? 0.45 : 0.3) * a.level * mix
      halo.scale.setScalar(R * 4 * (1 + kick * 0.3 * mix))
      dust.points.material.size = 0.8 * (1 + kick * 1.2 * mix)
    })
  }

  if (kind === 'code') {
    const N = n(700, 300)
    const pos = new Float32Array(N * 6)
    const speed = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const x = rand(-170, 170), y = rand(GROUND, 90), z = rand(-260, -10), len = rand(1, 4)
      pos.set([x, y, z, x, y - len, z], i * 6)
      speed[i] = rand(20, 60)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    d.group.add(new THREE.LineSegments(geo, lineMat(0.55)))
    d.onUpdate((dt) => {
      for (let i = 0; i < N; i++) {
        const o = i * 6, f = speed[i] * dt
        pos[o + 1] -= f
        pos[o + 4] -= f
        if (pos[o + 4] < GROUND) { const len = pos[o + 1] - pos[o + 4]; pos[o + 1] = 90; pos[o + 4] = 90 - len }
      }
      geo.attributes.position.needsUpdate = true
    })
  }

  if (kind === 'embers') {
    const sparks = risingSparks(ctx, { count: n(260, 110), color, box: { x: [-180, 180], y: [GROUND, 90], z: [-260, -20] } })
    d.group.add(sparks.points)
    d.onUpdate(sparks.update)
    // brass gears on the horizon
    const gearShape = (r, teeth) => {
      const pts = []
      for (let i = 0; i <= teeth * 4; i++) {
        const a = (i / (teeth * 4)) * Math.PI * 2
        const rr = i % 4 < 2 ? r : r * 0.84
        pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0))
      }
      return new THREE.BufferGeometry().setFromPoints(pts)
    }
    const gears = [[-70, 30, 34, 14], [-25, 5, 20, 10], [80, 40, 40, 16]].map(([x, y, r, t]) => {
      const g = new THREE.Line(gearShape(r, t), lineMat(0.55))
      g.material.fog = false
      g.position.set(x, y, -250)
      d.group.add(g)
      return g
    })
    d.onUpdate((dt) => gears.forEach((g, i) => { g.rotation.z += dt * (i % 2 ? -0.3 : 0.2) }))
  }

  return d.api
}
