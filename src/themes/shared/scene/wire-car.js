// Neon wireframe car shared by Futuristic (flying traffic) and Retro (racing down the grid).

import * as THREE from 'three'
import { dotTexture } from './kit.js'

// Low-poly neon car outline (side profile extruded across its width), nose toward +z
export function wireCar(color, dark) {
  const profile = new THREE.Shape([
    [-2.3, 0.35], [-2.3, 0.85], [-1.2, 1.05], [-0.6, 1.6], [0.9, 1.6], [1.5, 1.05], [2.4, 0.9], [2.4, 0.35],
  ].map(([x, y]) => new THREE.Vector2(x, y)))
  const body = new THREE.ExtrudeGeometry(profile, { depth: 2, bevelEnabled: false })
  body.translate(0, 0, -1)
  body.rotateY(-Math.PI / 2) // length along z, nose (+x) → +z
  const group = new THREE.Group()
  const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 })
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(body, 20), lineMat))
  group.add(new THREE.Mesh(body, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: dark ? 0.12 : 0.2, depthWrite: false })))
  const wheels = []
  ;[[-1.05, 1.5], [1.05, 1.5], [-1.05, -1.4], [1.05, -1.4]].forEach(([x, z]) => {
    const w = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10).rotateZ(Math.PI / 2)), lineMat)
    w.position.set(x, 0.45, z)
    group.add(w)
    wheels.push(w)
  })
  // Headlights
  const lights = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.7, 0.7, 2.35), new THREE.Vector3(0.7, 0.7, 2.35)]),
    new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  group.add(lights)
  group.scale.setScalar(5.5)
  return [group, wheels]
}
