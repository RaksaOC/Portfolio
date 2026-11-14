// Building blocks shared by every theme's 3D scene: the decor container (group + per-frame updaters +
// cleanup), particles, model loading, a reusable glow texture and the occluder trick for wireframes.
//
// Scene conventions (from components/background/Background.vue): camera at (0, 0, 5..32) looking down -Z,
// fov 90, ground grid at y = GROUND scrolling toward the camera, fog fades everything out by ~300 units.

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export const GROUND = -40
export const rand = (a, b) => a + Math.random() * (b - a)

let loader = null
export function loadModel(url) {
  if (!loader) {
    const draco = new DRACOLoader()
    draco.setDecoderPath('/vendor/draco/')
    loader = new GLTFLoader()
    loader.setDRACOLoader(draco)
  }
  return loader.loadAsync(url)
}

let dotTex = null
export function dotTexture() {
  if (dotTex) return dotTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.6)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  dotTex = new THREE.CanvasTexture(c)
  return dotTex
}

export function useEnvironment(ctx) {
  const pmrem = new THREE.PMREMGenerator(ctx.renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  ctx.scene.environment = env
  pmrem.dispose()
  return () => {
    if (ctx.scene.environment === env) ctx.scene.environment = null
    env.dispose()
  }
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    o.geometry?.dispose?.()
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
    mats.forEach((m) => {
      for (const k in m) if (m[k]?.isTexture && m[k] !== dotTex) m[k].dispose()
      m.dispose()
    })
  })
}

export function makeDecor(ctx) {
  const group = new THREE.Group()
  ctx.scene.add(group)
  const updaters = []
  const cleanups = []
  const mixers = []
  return {
    group,
    onUpdate: (fn) => updaters.push(fn),
    onDispose: (fn) => cleanups.push(fn),
    mixer(root) {
      const m = new THREE.AnimationMixer(root)
      mixers.push(m)
      return m
    },
    api: {
      update(dt, t) {
        mixers.forEach((m) => m.update(dt))
        updaters.forEach((fn) => fn(dt, t))
      },
      dispose() {
        mixers.forEach((m) => m.stopAllAction())
        ctx.scene.remove(group)
        disposeTree(group)
        cleanups.forEach((fn) => fn())
      },
    },
  }
}

// Glowing particles drifting in a box
export function particles(ctx, { count, color, size, box, drift = 0.6, additive = true, opacity = 0.9 }) {
  const pos = new Float32Array(count * 3)
  const base = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    base[i * 3] = rand(box.x[0], box.x[1])
    base[i * 3 + 1] = rand(box.y[0], box.y[1])
    base[i * 3 + 2] = rand(box.z[0], box.z[1])
    phase[i] = Math.random() * Math.PI * 2
  }
  pos.set(base)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color, size, map: dotTexture(), transparent: true, opacity, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  const points = new THREE.Points(geo, mat)
  const update = (dt, t) => {
    for (let i = 0; i < count; i++) {
      const p = phase[i]
      pos[i * 3] = base[i * 3] + Math.sin(t * 0.3 + p) * drift * 3
      pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.7 + p * 2) * drift * 2
    }
    geo.attributes.position.needsUpdate = true
    mat.opacity = opacity * (0.75 + 0.25 * Math.sin(t * 2.1))
  }
  return { points, update }
}

// Sparks / embers rising and wrapping back to the ground
export function risingSparks(ctx, { count, color, size = 1.6, box, speed = [4, 14], sway = 0.05 }) {
  const pos = new Float32Array(count * 3)
  const vel = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos.set([rand(box.x[0], box.x[1]), rand(box.y[0], box.y[1]), rand(box.z[0], box.z[1])], i * 3)
    vel[i] = rand(speed[0], speed[1])
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color, size, map: dotTexture(), transparent: true, depthWrite: false,
    blending: ctx.isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  const update = (dt, t) => {
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += vel[i] * dt
      pos[i * 3] += Math.sin(t + i) * sway
      if (pos[i * 3 + 1] > box.y[1]) pos[i * 3 + 1] = box.y[0]
    }
    geo.attributes.position.needsUpdate = true
  }
  return { points: new THREE.Points(geo, mat), update }
}

export const wireMesh = (geo, color, opacity, fog = false) =>
  new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity, fog }))

// Scroll objects toward the camera with the grid and wrap them to the back
export function scrollWithGrid(d, ctx, objs, wrapAt = 40, span = 340) {
  d.onUpdate((dt) => objs.forEach((o) => {
    o.position.z += ctx.speed() * 60 * dt
    if (o.position.z > wrapAt) o.position.z -= span
  }))
}


// Buildings are wireframes, so the mountains / grid behind would show through them. A depth-only twin
// (draws nothing, writes depth, pushed back a hair so the building's own front lines still pass) makes
// the building hide whatever is behind it - and its own back edges, for a cleaner silhouette.
const occluderMat = new THREE.MeshBasicMaterial({
  colorWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2,
})
export function occlude(group) {
  const meshes = []
  group.traverse((o) => { if (o.isMesh) meshes.push(o) })
  meshes.forEach((m) => {
    const o = new THREE.Mesh(m.geometry, occluderMat)
    o.position.copy(m.position)
    o.rotation.copy(m.rotation)
    o.scale.copy(m.scale)
    o.renderOrder = -1
    m.parent.add(o)
  })
}
