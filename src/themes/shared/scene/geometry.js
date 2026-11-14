// Terrain and tree geometry reused by several themes (mountain ridges, round trees).

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { rand } from './kit.js'

export function roundTreeGeometry(h) {
  const crown = new THREE.IcosahedronGeometry(h * 0.32, 1)
  const p = crown.attributes.position
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * rand(0.88, 1.12), p.getY(i) * rand(0.8, 1.05), p.getZ(i) * rand(0.88, 1.12))
  crown.translate(0, h * 0.68, 0)
  const crown2 = new THREE.IcosahedronGeometry(h * 0.2, 1)
  crown2.translate(h * 0.18, h * 0.5, h * 0.05)
  const trunk = new THREE.CylinderGeometry(h * 0.04, h * 0.06, h * 0.5, 5)
  trunk.translate(0, h * 0.25, 0)
  return mergeGeometries([crown, crown2, trunk].map((g) => g.toNonIndexed()))
}

// Mountain ridge: a strip of terrain whose height grows toward the back edge
export function ridgeGeometry({ width, depth, height, seed, segX = 90, segZ = 10 }) {
  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ)
  geo.rotateX(-Math.PI / 2)
  const p = geo.attributes.position
  const peaks = Array.from({ length: 7 }, (_, i) => ({
    x: -width / 2 + (i + 0.5) * (width / 7) + rand(-40, 40),
    h: rand(0.55, 1), w: rand(60, 120),
  }))
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i)
    const back = 1 - (z + depth / 2) / depth // 1 at the far edge, 0 at the front
    let y = 0
    peaks.forEach((pk) => { y = Math.max(y, pk.h * Math.exp(-((x - pk.x) ** 2) / (2 * pk.w * pk.w))) })
    y += 0.12 * Math.sin(x * 0.045 + seed) + 0.06 * Math.sin(x * 0.13 + seed * 2)
    p.setY(i, Math.max(0, y) * height * Math.pow(back, 0.8) + rand(0, height * 0.03))
  }
  return geo
}
