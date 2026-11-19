<template>
    <div class="section-icon" ref="wrapRef" data-aos="zoom-in-up" data-aos-delay="200">
        <canvas ref="canvasRef" class="icon-canvas" :aria-label="title || icon" role="img"></canvas>
        <h2 v-if="title" class="section-label">{{ title }}</h2>
    </div>
</template>

<script setup>
// Section header: a small three.js "icon" (extruded shape, accent-coloured edges + translucent fill)
// that floats, follows the pointer and can be spun by dragging. Re-colours itself when the theme /
// look changes and only renders while on screen.
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import { onFrame } from '../../core/ticker';

const props = defineProps({
    icon: { type: String, required: true }, // about | skills | projects | experience | contact
    title: { type: String, default: '' },
    image: { type: [String, Array], default: '' }, // about: photo(s) on the card; several take turns
});

const wrapRef = ref(null);
const canvasRef = ref(null);
let cleanup = () => { };

/* ---------- 2D shape helpers ---------- */

// Thick polyline → closed polygon (miter joins)
function stroke(pts, w) {
    const v = pts.map(([x, y]) => new THREE.Vector2(x, y));
    const left = [], right = [];
    v.forEach((p, i) => {
        const prev = v[i - 1], next = v[i + 1];
        const nOf = (a, b) => { const d = b.clone().sub(a).normalize(); return new THREE.Vector2(-d.y, d.x); };
        let n, len = w / 2;
        if (!prev) n = nOf(p, next);
        else if (!next) n = nOf(prev, p);
        else {
            const n1 = nOf(prev, p), n2 = nOf(p, next);
            n = n1.clone().add(n2).normalize();
            len = (w / 2) / Math.max(0.3, n.dot(n1));
        }
        left.push(p.clone().addScaledVector(n, len));
        right.push(p.clone().addScaledVector(n, -len));
    });
    return new THREE.Shape([...left, ...right.reverse()]);
}

function roundedRect(path, x, y, w, h, r) {
    path.moveTo(x + r, y);
    path.lineTo(x + w - r, y);
    path.quadraticCurveTo(x + w, y, x + w, y + r);
    path.lineTo(x + w, y + h - r);
    path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    path.lineTo(x + r, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - r);
    path.lineTo(x, y + r);
    path.quadraticCurveTo(x, y, x + r, y);
    return path;
}

function gearShape(teeth, rRoot, rTip, rHole) {
    const s = new THREE.Shape();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
        const a = i * step;
        const pts = [[a, rRoot], [a + step * 0.18, rTip], [a + step * 0.5, rTip], [a + step * 0.68, rRoot]];
        pts.forEach(([ang, r], j) => {
            const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
            if (i === 0 && j === 0) s.moveTo(x, y); else s.lineTo(x, y);
        });
    }
    s.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, rHole, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return s;
}

const extrude = (shape, depth = 0.45, bevel = 0.06) => {
    const g = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 24,
    });
    g.center();
    return g;
};

/* ---------- Icon builders: each returns { group, update(t) } ---------- */

function makeParts(mats) {
    // Mesh with translucent fill + crisp edge lines
    return (geom, edgeAngle = 30) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(geom, mats.fill));
        g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom, edgeAngle), mats.edge));
        return g;
    };
}

const BUILDERS = {
    skills(part) {
        const group = new THREE.Group();
        const big = part(extrude(gearShape(10, 1.15, 1.5, 0.5), 0.45));
        const small = part(extrude(gearShape(8, 0.62, 0.88, 0.28), 0.4));
        big.position.set(-0.55, 0.25, 0);
        small.position.set(1.2, -0.95, 0.15);
        small.rotation.z = 0.2;
        group.add(big, small);
        return {
            group,
            update(t) {
                big.rotation.z = t * 0.5;
                small.rotation.z = -t * 0.5 * (10 / 8) + 0.2;
            },
        };
    },

    projects(part) {
        const group = new THREE.Group();
        const w = 0.34;
        const lt = part(extrude(stroke([[-0.7, 1], [-1.65, 0], [-0.7, -1]], w)));
        const gt = part(extrude(stroke([[0.7, 1], [1.65, 0], [0.7, -1]], w)));
        const sl = part(extrude(stroke([[0.38, 1.25], [-0.38, -1.25]], w)));
        lt.position.x = -1.15;
        gt.position.x = 1.15;
        group.add(lt, gt, sl);
        return {
            group,
            update(t) {
                const k = Math.sin(t * 1.4) * 0.12;
                lt.position.x = -1.15 - k;
                gt.position.x = 1.15 + k;
                sl.rotation.y = t * 0.8;
            },
        };
    },

    experience(part) {
        const group = new THREE.Group();
        const body = part(extrude(roundedRect(new THREE.Shape(), -1.6, -1.05, 3.2, 2.1, 0.28), 0.8, 0.08));
        const handle = part(extrude(stroke([[-0.5, 0], [-0.5, 0.45], [0.5, 0.45], [0.5, 0]], 0.2), 0.3));
        handle.position.set(0, 1.3, 0);
        const band = part(new THREE.BoxGeometry(3.25, 0.14, 0.95));
        band.position.y = 0.15;
        const clasp = part(extrude(roundedRect(new THREE.Shape(), -0.25, -0.18, 0.5, 0.36, 0.08), 0.12, 0.03));
        clasp.position.set(0, 0.15, 0.5);
        group.add(body, handle, band, clasp);
        return {
            group,
            update(t) {
                handle.rotation.x = Math.sin(t * 1.2) * 0.12;
            },
        };
    },

    contact(part, mats) {
        const group = new THREE.Group();
        // Folded paper plane (nose along +x)
        const N = [1.9, 0, 0], C = [-1.1, 0, 0], L = [-1.4, 0.05, 1.3], R = [-1.4, 0.05, -1.3], K = [-1.25, -0.55, 0];
        const tri = [N, C, L, N, R, C, N, C, K].flat();
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3));
        geom.computeVertexNormals();
        const plane = part(geom, 1);
        plane.rotation.set(-0.35, -0.5, 0.35);

        // Dashed flight trail behind it
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-4.2, -1.7, -0.5), new THREE.Vector3(-3.0, -0.4, 0),
            new THREE.Vector3(-2.2, -1.3, 0.2), new THREE.Vector3(-1.2, -0.45, 0),
        ]);
        const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), mats.dash);
        trail.computeLineDistances();

        const flyer = new THREE.Group();
        flyer.add(plane);
        group.add(flyer, trail);
        return {
            group,
            update(t) {
                flyer.position.set(Math.sin(t * 0.9) * 0.15, Math.sin(t * 1.3) * 0.2, 0);
                plane.rotation.x = -0.35 + Math.sin(t * 1.3) * 0.12;
                mats.dash.dashOffset = -t * 0.8;
            },
        };
    },

    about(part, mats, img) {
        const group = new THREE.Group();
        // Photo card
        const shape = roundedRect(new THREE.Shape(), -1.3, -1.3, 2.6, 2.6, 0.32);
        const geom = new THREE.ShapeGeometry(shape, 16);
        const uv = geom.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 1.3) / 2.6, (uv.getY(i) + 1.3) / 2.6);
        const photo = new THREE.Mesh(geom, mats.photo);
        // The photo is a cut-out (transparent background): it's composited onto a studio-style backdrop painted
        // in the active theme's colours (repainted when the theme / look changes, see paint() below): the
        // theme's background tinted with its accent, a soft light behind the head and shoulders, a vignette,
        // and a soft shadow under the portrait to lift it off the backdrop.
        // Several photos: every SWAP_EVERY seconds (while on screen) the card turns edge-on, swaps to a random
        // different one and turns back. Only the current and the next picture are ever loaded.
        const list = [].concat(img || []).filter(Boolean);
        let swap = null; // () => true once the next picture is shown, false while it's still loading
        let nextReady = () => false;
        if (list.length) {
            const S = 768;
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = S;
            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            const load = (src) => {
                const im = new Image();
                im.decoding = 'async';
                im.src = src;
                return im;
            };
            // a random index other than i
            const other = (i) => (list.length < 2 ? i : (i + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length);
            let idx = Math.floor(Math.random() * list.length);
            let pic = load(list[idx]);
            let nextIdx = other(idx);
            let nextPic = null;
            let colors = null;
            const rgba = (c, a) => `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${a})`;
            const draw = () => {
                if (!colors || !pic.naturalWidth) return;
                const g = canvas.getContext('2d');
                const { accent, dark: bg } = colors;
                const white = new THREE.Color(1, 1, 1);
                const lum = 0.2126 * bg.r + 0.7152 * bg.g + 0.0722 * bg.b;
                const night = lum < 0.5;
                // backdrop: the page background, tinted by the accent, a touch lighter toward the top
                const base = g.createLinearGradient(0, 0, 0, S);
                base.addColorStop(0, rgba(bg.clone().lerp(accent, night ? 0.34 : 0.1), 1));
                base.addColorStop(1, rgba(bg.clone().lerp(accent, night ? 0.1 : 0.2).lerp(new THREE.Color(0.5, 0.5, 0.5), night ? 0 : 0.18), 1));
                g.fillStyle = base;
                g.fillRect(0, 0, S, S);
                // studio light behind the head and shoulders
                const glow = g.createRadialGradient(S * 0.5, S * 0.34, 0, S * 0.5, S * 0.42, S * 0.6);
                const lamp = accent.clone().lerp(white, night ? 0.55 : 0.9);
                glow.addColorStop(0, rgba(lamp, night ? 0.5 : 0.75));
                glow.addColorStop(0.55, rgba(lamp, night ? 0.14 : 0.25));
                glow.addColorStop(1, rgba(lamp, 0));
                g.fillStyle = glow;
                g.fillRect(0, 0, S, S);
                // vignette
                const vig = g.createRadialGradient(S * 0.5, S * 0.45, S * 0.35, S * 0.5, S * 0.5, S * 0.78);
                vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
                vig.addColorStop(1, `rgba(0, 0, 0, ${night ? 0.38 : 0.14})`);
                g.fillStyle = vig;
                g.fillRect(0, 0, S, S);
                // the portrait, square-cropped (portraits keep the upper part: face, shoulders, crossed arms)
                const w = pic.naturalWidth, h = pic.naturalHeight;
                const side = Math.min(w, h);
                const sx = (w - side) / 2;
                const sy = h > w ? (h - side) * 0.28 : 0;
                g.save();
                g.shadowColor = `rgba(0, 0, 0, ${night ? 0.45 : 0.25})`;
                g.shadowBlur = S * 0.035;
                g.shadowOffsetY = S * 0.012;
                g.drawImage(pic, sx, sy, side, side, 0, 0, S, S);
                g.restore();
                tex.needsUpdate = true;
            };
            pic.onload = () => {
                mats.photo.map = tex;
                mats.photo.needsUpdate = true;
                draw();
                if (list.length > 1) nextPic = load(list[nextIdx]);
            };
            nextReady = () => !!nextPic?.complete && nextPic.naturalWidth > 0;
            swap = () => {
                if (!nextReady()) return false;
                pic = nextPic;
                idx = nextIdx;
                draw();
                nextIdx = other(idx);
                nextPic = load(list[nextIdx]);
                return true;
            };
            mats.photoPaint = (c) => { colors = c; draw(); };
        }
        const frame = part(extrude(roundedRect(new THREE.Shape(), -1.45, -1.45, 2.9, 2.9, 0.4), 0.12, 0.04), 25);
        frame.position.z = -0.12;
        frame.children[0].material = mats.back;
        const card = new THREE.Group();
        card.add(frame, photo);
        photo.position.z = 0.02;

        // Two tilted orbits with a bead each
        const orbits = [0, 1].map((i) => {
            const pts = new THREE.EllipseCurve(0, 0, 2.3 + i * 0.35, 2.3 + i * 0.35).getPoints(96);
            const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mats.edge);
            const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), mats.solid);
            const o = new THREE.Group();
            o.add(ring, bead);
            o.rotation.set(i ? 1.15 : 1.35, i ? -0.5 : 0.45, 0);
            o.userData.bead = bead;
            o.userData.r = 2.3 + i * 0.35;
            return o;
        });
        group.add(card, ...orbits);
        const SWAP_EVERY = 10; // s
        const PHOTO_OPACITY = mats.photo.opacity;
        const FLIP = 0.9; // s for the whole turn
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let lastSwap = null;
        let flipAt = null;
        let swapped = false;
        return {
            group,
            update(t) {
                // real time for the photo timer (t runs slower with reduced motion)
                const now = performance.now() / 1000;
                if (lastSwap === null) lastSwap = now;
                const sway = Math.sin(t * 0.6) * 0.35;
                let turn = sway;
                if (swap && flipAt === null && now - lastSwap >= SWAP_EVERY && nextReady()) {
                    if (reduce) {
                        swap();
                        lastSwap = now;
                    } else {
                        flipAt = now;
                        swapped = false;
                    }
                }
                if (flipAt !== null) {
                    // turn to exactly edge-on (±90°), swap the photo there, come back round from the other side;
                    // the photo fades softly out as it turns away and back in with the new one
                    const p = Math.min(1, (now - flipAt) / FLIP);
                    let fade;
                    if (p < 0.5) {
                        const e = (p * 2) ** 2;
                        turn = sway + (Math.PI / 2 - sway) * e;
                        fade = 1 - 0.75 * e;
                    } else {
                        if (!swapped) swapped = swap() || true;
                        const e = 1 - (1 - (p - 0.5) * 2) ** 2;
                        turn = -Math.PI / 2 + (sway + Math.PI / 2) * e;
                        fade = 0.25 + 0.75 * e;
                    }
                    if (p >= 1) {
                        flipAt = null;
                        lastSwap = now;
                        fade = 1;
                    }
                    mats.photo.opacity = PHOTO_OPACITY * fade;
                }
                card.rotation.y = turn;
                orbits.forEach((o, i) => {
                    const a = t * (0.8 + i * 0.35) + i * 2;
                    o.userData.bead.position.set(Math.cos(a) * o.userData.r, Math.sin(a) * o.userData.r, 0);
                });
            },
        };
    },
};

/* ---------- Component ---------- */

onMounted(() => {
    const wrap = wrapRef.value;
    const canvas = canvasRef.value;
    const build = BUILDERS[props.icon];
    if (!wrap || !canvas || !build) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 4, 6);
    scene.add(key);

    const mats = {
        fill: new THREE.MeshStandardMaterial({
            transparent: true, opacity: 0.22, metalness: 0.2, roughness: 0.35, depthWrite: false, side: THREE.DoubleSide,
        }),
        edge: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.95 }),
        dash: new THREE.LineDashedMaterial({ dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0.7 }),
        solid: new THREE.MeshBasicMaterial(),
        photo: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
        back: new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5, metalness: 0.3, roughness: 0.4 }),
    };
    const part = makeParts(mats);
    const icon = build(part, mats, props.image);
    const pivot = new THREE.Group();
    pivot.add(icon.group);
    scene.add(pivot);

    // Sparkles around the icon
    const N = 70;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        const r = 2.6 + Math.random() * 1.6, a = Math.random() * Math.PI * 2;
        pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 3.6, Math.sin(a) * r * 0.6 - 0.5], i * 3);
    }
    const sparkGeom = new THREE.BufferGeometry();
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sparkMat = new THREE.PointsMaterial({ size: 0.05, transparent: true, opacity: 0.7, depthWrite: false });
    const sparks = new THREE.Points(sparkGeom, sparkMat);
    scene.add(sparks);

    // Colours from the active theme / look
    const css = (name, fallback) => {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        try { return new THREE.Color().setStyle(v || fallback); } catch { return new THREE.Color(fallback); }
    };
    const paint = () => {
        const accent = css('--accent', '#ffffff');
        const light = css('--light', '#ffffff');
        const dark = css('--dark', '#000000');
        mats.fill.color.copy(accent);
        mats.fill.emissive = accent.clone().multiplyScalar(0.25);
        mats.edge.color.copy(accent);
        mats.dash.color.copy(accent);
        mats.solid.color.copy(accent);
        mats.back.color.copy(dark).lerp(accent, 0.25);
        sparkMat.color.copy(light).lerp(accent, 0.6);
        mats.photoPaint?.({ accent, light, dark });
        dirty = true;
    };
    let dirty = true;
    paint();
    const themeObs = new MutationObserver(() => requestAnimationFrame(paint));
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-look', 'style'] });

    // Size to the element
    const resize = () => {
        const w = wrap.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // keep the icon the same apparent size on narrow screens
        camera.position.z = w / h < 1.2 ? 11 * (1.2 / (w / h)) ** 0.6 : 11;
        camera.updateProjectionMatrix();
        dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // Pointer tilt + drag to spin (with inertia)
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    let spin = 0, spinVel = 0, dragging = false, lastX = 0;
    const onMove = (e) => {
        const r = canvas.getBoundingClientRect();
        tilt.tx = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
        tilt.ty = ((e.clientX - r.left) / r.width - 0.5) * 0.7;
        if (dragging) {
            spinVel = (e.clientX - lastX) * 0.01;
            spin += spinVel;
            lastX = e.clientX;
        }
    };
    const onDown = (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture?.(e.pointerId); };
    const onUp = () => { dragging = false; };
    const onLeave = () => { if (!dragging) { tilt.tx = 0; tilt.ty = 0; } };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);

    // Only animate while visible
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // (core/ticker.js: drawn on the same frames as the 3D background, under the Graphics fps cap)
    let stopFrames = null, t = 0;
    const loop = (step) => {
        const dt = Math.min(0.05, step);
        t += reduce ? dt * 0.25 : dt;
        tilt.x += (tilt.tx - tilt.x) * 0.08;
        tilt.y += (tilt.ty - tilt.y) * 0.08;
        if (!dragging) { spin += spinVel; spinVel *= 0.94; spin *= 0.97; }
        pivot.rotation.set(tilt.x + Math.sin(t * 0.7) * 0.06, tilt.y + spin + Math.sin(t * 0.5) * 0.18, 0);
        pivot.position.y = Math.sin(t * 1.1) * 0.12;
        sparks.rotation.y = t * 0.08;
        icon.update(t);
        renderer.render(scene, camera);
        dirty = false;
    };
    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) stopFrames ??= onFrame(loop);
        else { stopFrames?.(); stopFrames = null; }
    }, { rootMargin: '100px' });
    io.observe(wrap);

    cleanup = () => {
        stopFrames?.();
        io.disconnect();
        ro.disconnect();
        themeObs.disconnect();
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('pointerleave', onLeave);
        scene.traverse((o) => { o.geometry?.dispose(); });
        Object.values(mats).forEach((m) => { m.map?.dispose(); m.dispose(); });
        sparkMat.dispose();
        renderer.dispose();
    };
});

onBeforeUnmount(() => cleanup());
</script>

<style scoped>
.section-icon {
    width: min(1100px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 80px auto 30px;
}

.icon-canvas {
    display: block;
    width: 100%;
    height: clamp(220px, 34vh, 360px);
    cursor: grab;
    touch-action: pan-y;
}

.icon-canvas:active {
    cursor: grabbing;
}

.section-label {
    margin: 4px 0 0;
    font-family: var(--poppins);
    font-size: var(--XL);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--light);
    text-shadow: var(--glow, none);
}

:root[data-look] .section-label {
    color: var(--accent);
}

@media screen and (max-width: 638px) {
    .section-icon {
        margin-top: 50px;
    }

    .section-label {
        font-size: var(--L);
    }
}
</style>
