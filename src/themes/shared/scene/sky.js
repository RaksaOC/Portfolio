// Sky helpers for the daylight scenes (Japan, Desert): horizon glow, sun / moon discs, clouds, flowers.

import * as THREE from 'three'
import { GROUND, rand, dotTexture } from './kit.js'

// A wide plane with a vertical colour fade, standing behind everything: a glow along the horizon
export function skyGlow(stops, { width = 1600, height = 320, y = GROUND + 110, z = -440, opacity = 1, additive = false } = {}) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, 0, 256)
  stops.forEach(([at, col]) => grd.addColorStop(at, col))
  g.fillStyle = grd
  g.fillRect(0, 0, 4, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity, depthWrite: false, fog: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    }),
  )
  m.position.set(0, y, z)
  m.renderOrder = -2
  return m
}

// A flat disc in the sky (sun / moon) with a soft halo
export function skyDisc({ r, color, halo, opacity, x, y, z, additive }) {
  const g = new THREE.Group()
  const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, fog: false, depthWrite: false, blending,
  }))
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: dotTexture(), color: halo, transparent: true, opacity: opacity * 0.7, fog: false, depthWrite: false, blending,
  }))
  glow.scale.setScalar(r * 5)
  g.add(glow, disc)
  g.position.set(x, y, z)
  g.renderOrder = -1
  return g
}

// Puffy cumulus clouds: soft sprite clusters drifting slowly across the far sky
export function puffyClouds(d, { count, color, opacity, blend, y = [140, 230], z = -440 }) {
  const mat = new THREE.SpriteMaterial({ map: dotTexture(), color, transparent: true, opacity, depthWrite: false, fog: false, blending: blend })
  const clouds = []
  for (let c = 0; c < count; c++) {
    const g = new THREE.Group()
    const w = rand(60, 110)
    for (let i = 0; i < 11; i++) {
      const s = new THREE.Sprite(mat)
      const u = (i / 10) * 2 - 1
      const size = (1 - Math.abs(u) * 0.55) * rand(38, 58)
      s.position.set(u * w * 0.5 + rand(-6, 6), size * 0.28 + rand(-3, 6), rand(-4, 4))
      s.scale.setScalar(size)
      g.add(s)
    }
    g.position.set(rand(-420, 420), GROUND + rand(y[0], y[1]), z + c * 3)
    g.userData.v = rand(1.2, 3)
    d.group.add(g)
    clouds.push(g)
  }
  d.onUpdate((dt) => clouds.forEach((g) => { g.position.x += g.userData.v * dt; if (g.position.x > 520) g.position.x = -520 }))
}

// A small five-petal sakura flower with crisp edges (white, so vertex colours tint it), for blossom points
let flowerTex = null
export function flowerTexture() {
  if (flowerTex) return flowerTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  g.translate(32, 32)
  g.fillStyle = '#ffffff'
  for (let i = 0; i < 5; i++) {
    g.save()
    g.rotate((i / 5) * Math.PI * 2)
    g.beginPath()
    g.moveTo(0, 0)
    g.bezierCurveTo(-15, -8, -13, -26, -4, -29)
    g.lineTo(0, -24) // notched tip
    g.lineTo(4, -29)
    g.bezierCurveTo(13, -26, 15, -8, 0, 0)
    g.fill()
    g.restore()
  }
  g.globalCompositeOperation = 'destination-out' // a tiny hole so the centre reads as darker
  g.globalAlpha = 0.35
  g.beginPath()
  g.arc(0, 0, 5, 0, Math.PI * 2)
  g.fill()
  flowerTex = new THREE.CanvasTexture(c)
  flowerTex.colorSpace = THREE.SRGBColorSpace
  return flowerTex
}
