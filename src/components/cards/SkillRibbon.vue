<template>
    <!--
        Skills "ribbon" scroll style: one continuous loop of flexible glass sheet (WebGL, three.js) with every
        skill group printed on it. Scrolling (progress 0..1) turns the loop group by group; a slow wave and a
        twist travel along the sheet, gently at the front and more at the sides, and scrolling flexes it
        harder before it springs back. The groups are drawn into one texture, so they bend with the glass.
        Dragging left / right turns it (snapping to a group on release); a tap ripples the glass and
        bounces the band. On phones the loop stands upright and spins vertically with the scroll.
        Screen readers get the plain list below.
    -->
    <div class="ribbon-wrap" ref="wrapRef" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp"
        @pointercancel="onCancel">
        <!-- the cards' liquid glass (backdrop-filter, themes/shared/base.css) behind the sheet, clipped to its
             outline every frame, so the 3D background bends through the ribbon like through the cards -->
        <div class="ribbon-refract" ref="refractRef" aria-hidden="true"></div>
        <canvas ref="canvasRef" class="ribbon-canvas" aria-hidden="true"></canvas>
        <ul class="sr-only">
            <li v-for="g in groups" :key="g.key">
                {{ $t(`skills.groups.${g.key}`) }}: {{ g.items.map((s) => s.name).join(', ') }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { useI18n } from 'vue-i18n';
import { onFrame } from '../../core/ticker';

const props = defineProps({
    groups: { type: Array, required: true }, // skillGroups from src/data/skills.js
    progress: { type: Number, required: true }, // 0..1 through the pinned section
});
const emit = defineEmits(['seek', 'unsupported']);
const { t, locale } = useI18n();

const wrapRef = ref(null);
const canvasRef = ref(null);
const refractRef = ref(null);

const N = props.groups.length;
const GROUP_ANGLE = (Math.PI * 2) / N;
const THICKNESS = 12; // px between the sheet's two faces
const isPhone = typeof matchMedia === 'function' && matchMedia('(pointer: coarse) and (max-width: 900px)').matches;
const CAMERA_DIST = 1800; // like a CSS perspective: at the front of the loop 1 unit = 1 CSS px
// rad: seen from slightly above (or, upright on phones, slightly from the side), so the far side shows
const TILT_ACROSS = 0.15;
const TILT_UPRIGHT = 0.1;
let TILT = TILT_ACROSS;
const WHITE_LOGOS = ['Next.js', 'Unity', 'Cursor', 'GitHub Copilot', 'AWS', 'IoT']; // see Skill.vue

const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Two layouts:
//  - across (desktop): the loop lies flat and turns sideways; each group panel is a slice of it, as wide
//    as 1/N of the loop and as tall as the band.
//  - upright (phones, < 700px wide): the same loop flipped 90° so it stands like a drum and spins
//    vertically as the page scrolls; a panel is as wide as the band and as tall as 1/N of the loop.
//    Its artwork is drawn turned a quarter so it reads upright on screen.
// Everything printed on a panel (logos, labels, header) is sized from one factor u (1 = full desktop size).
let R = 640;
let H = 466;
let COLS = 3;
let UPRIGHT = false;
const REF_PANEL = (Math.PI * 2 * 640) / N; // desktop panel width the sizes below are designed at
// across: 3 columns × up to 3 rows; upright panels are wide and short: up to 5 columns × 2 rows
const MAX_ROWS = () => (UPRIGHT ? 2 : 3);
const AMP_UPRIGHT = 0.55; // upright, the sideways wave / twist is calmer, so the band can be wider

// Sizes on one group panel `bw` px wide at scale u
function layout(u, bw) {
    const logo = Math.round(72 * u);
    const label = Math.max(12, 16 * u);
    const lineH = label * 1.2;
    const pad = 20 * u;
    const idx = Math.max(12.5, 17 * u);
    const title = Math.max(16, 25 * u);
    const headY = pad + title * 0.8; // header baseline
    const ruleY = headY + 16 * u; // line under the header
    const top = ruleY + 16 * u; // grid starts
    const rowH = logo + 10 * u + lineH * 2; // logo + up to two lines of label
    const col = (bw - 24 * u) / COLS;
    const height = Math.round(top + MAX_ROWS() * rowH + 14 * u);
    return { u, logo, label, lineH, pad, idx, title, headY, ruleY, top, rowH, col, height };
}

// Across: panel width follows from the loop, the band's height from the panel's content
const metrics = (r) => layout((Math.PI * 2 * r) / N / REF_PANEL, (Math.PI * 2 * r) / N);

// The panel box (CSS px, as seen on screen) and its layout for the current R / H
function panelBox() {
    const along = (Math.PI * 2 * R) / N;
    if (!UPRIGHT) return { bw: along, bh: H, ...metrics(R) };
    // upright: as large as the band's width allows, shrunk until it fits the panel's height
    let u = H / REF_PANEL;
    let m = layout(u, H);
    while (m.height > along && u > 0.3) m = layout((u *= 0.97), H);
    return { bw: H, bh: along, ...m };
}

const MIN_R = 260;
const SLACK = 8 + 6 + 7; // px kept round the sheet: margin + the float animation + the tap ripple's lift
let CX = 0; // canvas position (CSS px) of the loop's axis: the canvas is cropped to what the sheet reaches
let CY = 0;

/* ---------------------------------------------------------------------------------------------- */
/* Shaders                                                                                          */
/* ---------------------------------------------------------------------------------------------- */

// Every vertex is a point (angle, height, radius) on the band; the shader bends it into place, so the
// whole sheet (both faces + the thickness at its edges) flexes as one piece.
const vertexShader = /* glsl */ `
    attribute vec3 aBand;   // x: angle round the loop, y: height, z: radius
    attribute float aKind;  // 0 outer face (carries the groups), 1 inner face, 2 edge (thickness)
    uniform float uRot, uPhase, uFlex, uR;
    uniform float uAmp;     // wave / twist strength (calmer upright)
    uniform vec2 uTap;      // tap ripple centre on the sheet: (angle, height)
    uniform float uTapT;    // seconds since the tap
    varying vec2 vUv;
    varying float vRing;
    varying vec3 vNormal;
    varying vec3 vWorld;
    varying float vKind;
    varying float vFacing;

    void main() {
        float th = aBand.x + uRot;                     // angle as seen from the camera (0 = front)
        float facing = cos(th);
        float side = 1.0 - clamp(facing, 0.0, 1.0);    // 0 at the front, 1 at the sides / back
        float w = 2.0 * aBand.x + uPhase;              // travelling wave along the loop
        float lift = sin(w) * (4.0 + 24.0 * side + uFlex * 1.4) * uAmp;
        float phi = cos(w) * radians(1.5 + 13.0 * side + uFlex * 0.9) * uAmp; // twist of the cross-section

        // tap ripple: a ring spreading over the sheet from the tap point, lifting the glass as it passes
        float dth = mod(aBand.x - uTap.x + 3.14159265, 6.28318531) - 3.14159265;
        float dist = length(vec2(dth * uR, aBand.y - uTap.y));
        float ring = exp(-pow((dist - uTapT * 320.0) / 20.0, 2.0)) * max(0.0, 1.0 - uTapT / 1.1);
        vRing = ring;

        // rotate the cross-section (radial offset, height) by phi around the band's tangent
        float dr = aBand.z - uR + ring * 7.0;
        float y = aBand.y;
        float r = uR + dr * cos(phi) - y * sin(phi);
        float h = dr * sin(phi) + y * cos(phi) + lift;

        vec3 p = vec3(sin(th) * r, h, cos(th) * r);
        vec3 n = vec3(sin(th) * cos(phi), sin(phi), cos(th) * cos(phi));
        if (aKind > 1.5) n = vec3(-sin(th) * sin(phi), cos(phi), -cos(th) * sin(phi)) * sign(aBand.y);
        else if (aKind > 0.5) n = -n;

        vec4 world = modelMatrix * vec4(p, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * n);
        vUv = uv;
        vKind = aKind;
        vFacing = facing;
        gl_Position = projectionMatrix * viewMatrix * world;
    }
`;

const fragmentShader = /* glsl */ `
    uniform sampler2D uMap;
    uniform sampler2D uBump;  // logo height map (white = raised)
    uniform vec2 uTexel;      // one atlas pixel in uv
    uniform vec3 uTint;
    uniform float uLight;   // 1 on light themes: less white sheen, so it doesn't wash out
    uniform float uBack;    // how much of the far side's print shows through
    varying vec2 vUv;
    varying float vRing;
    varying vec3 vNormal;
    varying vec3 vWorld;
    varying float vKind;
    varying float vFacing;

    void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        vec3 v = normalize(cameraPosition - vWorld);
        float ndv = abs(dot(n, v));

        // Clear glass, physically-ish: Schlick fresnel (4% reflective face-on, rising to a mirror at grazing
        // angles) reflecting a soft environment (bright sky above, dark ground below, a hint of the theme's
        // colour), plus one small, tight highlight from a light at the upper left
        vec3 l = normalize(vec3(-0.5, 0.7, 0.6));
        vec3 rf = reflect(-v, n);
        float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
        float sky = smoothstep(-0.3, 0.8, rf.y);
        vec3 env = mix(mix(uTint, vec3(1.0), 0.3) * 0.25, mix(uTint, vec3(1.0), 0.7), sky);
        float spec = pow(max(dot(rf, l), 0.0), 140.0) * (0.5 + 0.5 * F * 4.0);
        float sheenK = mix(1.0, 0.45, uLight);

        vec3 col = env;
        float a = 0.015 + F * (0.25 + 0.45 * sky) * sheenK + min(spec * 0.35, 0.35) * sheenK;

        if (vKind > 1.5) {
            // the sheet's edge: looking through the glass's thickness, a tinted line (glass absorbs along it)
            col = mix(uTint, vec3(1.0), 0.35);
            a = 0.14 + F * 0.2 + spec * 0.2;
        } else if (vKind > 0.5) {
            a *= 0.55; // inner face: fainter, gives the sheet its depth
        }

        col = mix(col, vec3(1.0), clamp(spec * 0.6 * sheenK, 0.0, 1.0));

        // the groups, printed on the outer face. They never vanish: towards the sides they dim a little,
        // and round the far side of the loop you see them through the glass, mirrored and faint.
        if (vKind < 0.5 && gl_FrontFacing) {
            vec4 tex = texture2D(uMap, vUv);
            float vis = clamp(0.4 + vFacing * 0.9, 0.4, 1.0);

            // Logos are sculpted into the glass: the height map tilts the surface normal at their
            // edges, so their bevels catch the light (and move with it as the sheet turns and flexes)
            float hc = texture2D(uBump, vUv).r;
            float hl = texture2D(uBump, vUv - vec2(uTexel.x, 0.0)).r;
            float hr = texture2D(uBump, vUv + vec2(uTexel.x, 0.0)).r;
            float hd = texture2D(uBump, vUv - vec2(0.0, uTexel.y)).r;
            float hu = texture2D(uBump, vUv + vec2(0.0, uTexel.y)).r;
            vec2 slope = vec2(hr - hl, hu - hd);
            vec3 tg = normalize(cross(vec3(0.0, 1.0, 0.0), n)); // along the loop
            vec3 bt = cross(n, tg);                              // up the sheet
            vec3 nb = normalize(n - (slope.x * tg + slope.y * bt) * 3.0);
            float relief = clamp(hc * 1.5 + length(slope) * 6.0, 0.0, 1.0);
            float lit = dot(nb, l) - dot(n, l);                  // + on the lit bevel, - in its shadow
            float glint = pow(max(dot(reflect(-l, nb), v), 0.0), 40.0);

            vec3 logo = tex.rgb * (1.0 + clamp(lit, -0.6, 0.6) * 1.1 * relief);
            logo += vec3(1.0) * glint * 0.22 * relief * sheenK;
            float ta = tex.a * vis;
            col = mix(col, logo, ta);
            // the bevel's glint shows on the glass right round the logo too
            col += vec3(1.0) * glint * 0.08 * relief * vis * (1.0 - ta) * sheenK;
            a = a + ta * (1.0 - a) + glint * 0.07 * relief * vis;
        } else if (vKind < 0.5) {
            // far side, seen from inside the loop: the same print, mirrored, faded and a touch dimmer
            vec4 tex = texture2D(uMap, vUv);
            float ta = tex.a * uBack;
            col = mix(col, tex.rgb * 0.85, ta);
            a = a + ta * (1.0 - a);
        }

        // the ripple's crest catches the light
        col = mix(col, vec3(1.0), clamp(vRing * 0.3 * mix(1.0, 0.6, uLight), 0.0, 1.0));
        a = a + vRing * 0.18 * (1.0 - a);

        gl_FragColor = vec4(col, a);
    }
`;

/* ---------------------------------------------------------------------------------------------- */
/* The same bend on the CPU, for the refraction layer's outline                                     */
/* ---------------------------------------------------------------------------------------------- */

const DEG = Math.PI / 180;

// A point of the outer face at view angle `th` (0 = front) and height y, bent like the vertex shader,
// projected to canvas CSS px
function bandPoint(th, y, rot, phase, flex, w, h) {
    const theta = th - rot;
    const side = 1 - Math.min(1, Math.max(0, Math.cos(th)));
    const wave = 2 * theta + phase;
    const amp = UPRIGHT ? AMP_UPRIGHT : 1;
    const lift = Math.sin(wave) * (4 + 24 * side + flex * 1.4) * amp;
    const phi = Math.cos(wave) * (1.5 + 13 * side + flex * 0.9) * DEG * amp;
    const r = R - y * Math.sin(phi);
    const py = y * Math.cos(phi) + lift;
    const px = Math.sin(th) * r;
    const pz = Math.cos(th) * r;
    // group: rotation.x = TILT, then pushed back by R; camera at CAMERA_DIST looking down -z
    const y2 = py * Math.cos(TILT) - pz * Math.sin(TILT);
    const z2 = py * Math.sin(TILT) + pz * Math.cos(TILT) - R;
    const k = CAMERA_DIST / (CAMERA_DIST - z2);
    // upright: the whole loop turned -90° in the screen plane (x → down, up → right)
    if (UPRIGHT) return [CX + y2 * k, CY + px * k];
    return [CX + px * k, CY - y2 * k];
}

// How far the sheet can reach from the loop's axis on screen (CSS px), at the strongest flex: the tilt
// drops the near edge and lifts the far one, the travelling wave and flex move both
function reach() {
    const e = { up: 0, down: 0, left: 0, right: 0 };
    for (let i = 0; i < 48; i++) {
        const th = (i / 48) * Math.PI * 2;
        for (let p = 0; p < 8; p++) {
            for (const y of [-H / 2, H / 2]) {
                const [x, yy] = bandPoint(th, y, 0, (p / 8) * Math.PI * 2, 16, 0, 0);
                const dx = x - CX;
                const dy = yy - CY;
                e.up = Math.max(e.up, -dy);
                e.down = Math.max(e.down, dy);
                e.left = Math.max(e.left, -dx);
                e.right = Math.max(e.right, dx);
            }
        }
    }
    for (const key in e) e[key] += SLACK;
    return e;
}

// Seen from slightly above, the sheet's outline is the far top edge (right → left) plus the near bottom
// edge (left → right)
function outline(rot, phase, flex, w, h) {
    const pts = [];
    const STEPS = 40;
    for (let i = 0; i <= STEPS; i++) pts.push(bandPoint(Math.PI / 2 + (i / STEPS) * Math.PI, H / 2, rot, phase, flex, w, h));
    for (let i = 0; i <= STEPS; i++) pts.push(bandPoint(-Math.PI / 2 + (i / STEPS) * Math.PI, -H / 2, rot, phase, flex, w, h));
    return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
}

/* ---------------------------------------------------------------------------------------------- */
/* Geometry: outer face, inner face and the two edges of an open band                              */
/* ---------------------------------------------------------------------------------------------- */

function buildBand(R, H) {
    const SEG = isPhone ? 200 : 360; // round the loop
    const ROWS = isPhone ? 12 : 24; // up the sheet
    const band = [];
    const kind = [];
    const uvs = [];
    const index = [];
    const start = -GROUP_ANGLE / 2; // group 0 is centred on angle 0

    // a grid of (angle, a, b) points; `at` maps the grid to (height, radius). `ccw`: the triangles'
    // front faces point outward / up (counter-clockwise seen from there)
    const grid = (k, cols, rows, at, ccw) => {
        const base = band.length / 3;
        for (let j = 0; j <= rows; j++) {
            for (let i = 0; i <= cols; i++) {
                const u = i / cols;
                const [y, r] = at(j / rows);
                band.push(start + u * Math.PI * 2, y, r);
                kind.push(k);
                uvs.push(u, j / rows);
            }
        }
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const a = base + j * (cols + 1) + i;
                const b = a + 1;
                const c = a + cols + 1;
                const d = c + 1;
                if (ccw) index.push(a, b, c, b, d, c);
                else index.push(a, c, b, b, c, d);
            }
        }
    };

    grid(0, SEG, ROWS, (v) => [v * H - H / 2, R], true); // outer face (faces out), v = 0 at the bottom
    grid(1, SEG, ROWS, (v) => [v * H - H / 2, R - THICKNESS], false); // inner face (faces in)
    grid(2, SEG, 1, (v) => [H / 2, R - THICKNESS + v * THICKNESS], false); // top edge (faces up)
    grid(2, SEG, 1, (v) => [-H / 2, R - THICKNESS + v * THICKNESS], true); // bottom edge (faces down)

    const g = new THREE.BufferGeometry();
    g.setAttribute('aBand', new THREE.Float32BufferAttribute(band, 3));
    g.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    // three needs a position attribute; the real positions are computed in the shader
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(band.length), 3));
    g.setIndex(index);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), R + H);
    return g;
}

/* ---------------------------------------------------------------------------------------------- */
/* Texture: every group drawn side by side, one loop's worth wide                                  */
/* ---------------------------------------------------------------------------------------------- */

const images = new Map();
const loadImage = (src) => {
    if (!images.has(src)) {
        images.set(src, new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        }));
    }
    return images.get(src);
};

// Split a label over at most two lines that fit `max` px
function lines(ctx, text, max) {
    if (ctx.measureText(text).width <= max) return [text];
    const words = text.split(' ');
    for (let i = words.length - 1; i > 0; i--) {
        const first = words.slice(0, i).join(' ');
        if (ctx.measureText(first).width <= max) return [first, words.slice(i).join(' ')];
    }
    return [text];
}

// One white silhouette per logo (blurred a little, so the height map has rounded bevels)
const silhouette = (img, size) => {
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(size);
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#fff';
    x.fillRect(0, 0, c.width, c.height);
    return c;
};

async function drawAtlas(canvas, bump, R, H, cols, el, stale) {
    const all = await Promise.all(props.groups.map((g) => Promise.all(g.items.map((s) => loadImage(s.image)))));
    if (stale()) return false;

    const cs = getComputedStyle(el);
    const css = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
    const light = css('--light', '#ffffff');
    const accent = css('--accent', light);
    const font = cs.fontFamily || 'sans-serif';
    const lightTheme = document.documentElement.getAttribute('data-theme') === 'light';

    const panelW = (Math.PI * 2 * R) / N;
    const k = Math.min(Math.min(2, window.devicePixelRatio || 1), 8192 / (panelW * N));
    for (const c of [canvas, bump]) {
        c.width = Math.round(panelW * N * k);
        c.height = Math.round(H * k);
    }
    const ctx = canvas.getContext('2d');
    const bx = bump.getContext('2d');
    ctx.setTransform(k, 0, 0, k, 0, 0);
    bx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, panelW * N, H);
    bx.fillStyle = '#000';
    bx.fillRect(0, 0, panelW * N, H);
    bx.filter = `blur(${1.6 * k}px)`; // ignored where unsupported: sharper bevels, still fine

    const { bw, bh, logo, label, lineH, pad, idx: idxPx, title, headY, ruleY, top, rowH, col, u } = panelBox();

    props.groups.forEach((g, gi) => {
        // each panel is drawn in its own on-screen frame (x right, y down, bw × bh); upright, that frame
        // is turned a quarter onto the loop: screen down = along the loop, screen right = up the band
        const x0 = gi * panelW;
        for (const c of [ctx, bx]) {
            if (UPRIGHT) c.setTransform(0, -k, k, 0, x0 * k, H * k);
            else c.setTransform(k, 0, 0, k, x0 * k, 0);
        }
        const sideX = 18 * u;
        const right = bw - 18 * u;

        // header: index · title
        ctx.textBaseline = 'alphabetic';
        ctx.font = `500 ${idxPx}px ${font}`;
        ctx.fillStyle = accent;
        const idx = String(gi + 1).padStart(2, '0');
        ctx.fillText(idx, sideX, headY);
        const idxW = ctx.measureText(idx).width;
        ctx.font = `500 ${title}px ${font}`;
        ctx.fillStyle = light;
        ctx.fillText(t(`skills.groups.${g.key}`), sideX + idxW + 12 * u, headY, right - sideX - idxW - 12 * u);

        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fillRect(sideX, ruleY, right - sideX, 1);

        // grid, centred in what's left
        // up to 3 rows with as few columns as that allows, items spread evenly (longer rows first) and
        // every row centred: 9 → 3·3·3, 7 → 3·2·2, 6 → 2·2·2, 4 → 2·2, 2 → 1·1
        // (a group can set its own `rows` in src/data/skills.js, e.g. [3, 3])
        // (upright: at most 2 rows, 9 → 5·4, 6 → 3·3)
        const n = g.items.length;
        const maxRows = MAX_ROWS();
        const across = Math.min(cols, Math.ceil(n / maxRows));
        const auto = Math.ceil(n / across);
        const perRow = g.rows?.length && g.rows.length <= maxRows
            ? g.rows
            : Array.from({ length: auto }, (_, r) => Math.floor(n / auto) + (r < n % auto ? 1 : 0));
        const rows = perRow.length;
        const place = [];
        perRow.forEach((count, r) => {
            // upright, a short row spreads out over the width (as if it had 3 columns) instead of bunching up
            const cw = UPRIGHT ? Math.min((bw - 24 * u) / Math.max(3, count), col * 1.7) : col;
            for (let c = 0; c < count; c++) place.push({ r, cw, x: (bw - count * cw) / 2 + c * cw + cw / 2 });
        });
        const gridH = rows * rowH;
        const gy = top + Math.max(0, (bh - pad * 0.7 - top - gridH) / 2);

        g.items.forEach((s, si) => {
            const cx = place[si].x;
            const cy = gy + place[si].r * rowH + logo / 2;
            const img = all[gi][si];
            if (img) {
                // colour, with a soft shadow cast onto the glass
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
                ctx.shadowBlur = 6 * k;
                ctx.shadowOffsetX = 1.5 * k;
                ctx.shadowOffsetY = 3 * k;
                if (lightTheme && WHITE_LOGOS.includes(s.name)) ctx.filter = 'invert(1) hue-rotate(180deg)';
                ctx.drawImage(img, cx - logo / 2, cy - logo / 2, logo, logo);
                ctx.restore();
                // height
                bx.drawImage(silhouette(img, logo * k), cx - logo / 2, cy - logo / 2, logo, logo);
            }

            ctx.font = `${label}px ${font}`;
            ctx.fillStyle = light;
            ctx.textAlign = 'center';
            const cw = place[si].cw;
            lines(ctx, s.name, cw - 4).forEach((line, li) => {
                ctx.fillText(line, cx, cy + logo / 2 + 8 * u + label + li * lineH, cw - 2);
            });
            ctx.textAlign = 'left';
        });
    });
    bx.filter = 'none';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    bx.setTransform(1, 0, 0, 1, 0, 0);
    return true;
}

/* ---------------------------------------------------------------------------------------------- */
/* Scene                                                                                            */
/* ---------------------------------------------------------------------------------------------- */

let renderer, scene, camera, pivot, group, material, texture, atlas, bumpTexture, bumpAtlas;
let meshes = []; // [far / inner side, near side]: same geometry, drawn in that order
let builtFor = '';
let stopFrames = null; // core/ticker.js subscription while animating
let visible = false;
let io, ro, mo;
let flex = 0;
let lastRot = null;
let phase = 0;
let tapT = 9; // seconds since the last tap (large = no ripple)

const rotFor = (p) => -p * (N - 1) * GROUP_ANGLE;

const cssColor = (name, fallback) => {
    const v = getComputedStyle(wrapRef.value).getPropertyValue(name).trim();
    try { return new THREE.Color(v || fallback); } catch { return new THREE.Color(fallback); }
};

function applyTheme() {
    if (!material) return;
    material.uniforms.uTint.value = cssColor('--accent', '#ffffff');
    material.uniforms.uLight.value = document.documentElement.getAttribute('data-theme') === 'light' ? 1 : 0;
}

let drawSeq = 0;
let cssW = 0;
let cssH = 0;
async function redrawAtlas() {
    if (!atlas || !wrapRef.value) return;
    const seq = ++drawSeq;
    const stale = () => seq !== drawSeq || !atlas;
    await document.fonts?.ready;
    if (stale()) return;
    const before = `${atlas.width}x${atlas.height}`;
    if (!(await drawAtlas(atlas, bumpAtlas, R, H, COLS, wrapRef.value, stale))) return;
    // three allocates a texture's storage once: a new size needs a fresh GPU texture
    if (`${atlas.width}x${atlas.height}` !== before) {
        texture.dispose();
        bumpTexture.dispose();
    }
    texture.needsUpdate = true;
    bumpTexture.needsUpdate = true;
    material.uniforms.uTexel.value.set(1 / atlas.width, 1 / atlas.height);
    requestRender();
}

function resize() {
    const el = wrapRef.value;
    if (!el || !renderer) return;
    const w = el.clientWidth;
    UPRIGHT = w < 700;
    TILT = UPRIGHT ? TILT_UPRIGHT : TILT_ACROSS;
    COLS = UPRIGHT ? 5 : 3;
    // room the section has: the sticky panel (100svh, so it doesn't jump with a phone's toolbars) less its padding
    const sticky = el.closest('.pin-sticky');
    const availH = sticky
        ? sticky.clientHeight - (parseFloat(getComputedStyle(sticky).paddingTop) || 0) - 12
        : window.innerHeight - 100;
    const availW = w - 8;
    CX = CY = 0;
    let ext;
    if (UPRIGHT) {
        // the band nearly as wide as the screen, the loop just big enough for a panel's content, then
        // shrunk until the whole drum fits the screen both ways
        H = Math.round(Math.min(440, w * 0.88));
        R = (layout(H / REF_PANEL, H).height * N) / (Math.PI * 2);
        for (let i = 0; i < 60; i++) {
            ext = reach();
            const tall = ext.up + ext.down > availH && R > MIN_R;
            const wide = ext.left + ext.right > availW && H > 200;
            if (!tall && !wide) break;
            if (tall) R = Math.max(MIN_R, R * 0.96);
            if (wide) H = Math.round(H * 0.96);
        }
    } else {
        // across: desktop size, shrunk until band + flex fit the screen's height
        R = 640;
        H = metrics(R).height;
        ext = reach();
        while (ext.up + ext.down > availH && R > MIN_R) {
            R = Math.max(MIN_R, R * 0.95);
            H = metrics(R).height;
            ext = reach();
        }
    }
    R = Math.round(R);
    if (!UPRIGHT) H = metrics(R).height;
    ext = reach();
    const h = Math.ceil(ext.up + ext.down);
    CY = ext.up;
    CX = UPRIGHT ? (w + ext.left - ext.right) / 2 : w / 2; // upright: the drum's outline centred
    el.style.height = `${h}px`;
    el.classList.toggle('upright', UPRIGHT);
    cssW = w;
    cssH = h;
    renderer.setSize(w, h, false);
    // a symmetric frustum round the loop's axis, cropped to the canvas
    const fullW = 2 * Math.max(CX, w - CX);
    const fullH = 2 * Math.max(CY, h - CY);
    camera.aspect = fullW / fullH;
    camera.fov = (2 * Math.atan(fullH / 2 / CAMERA_DIST) * 180) / Math.PI;
    camera.setViewOffset(fullW, fullH, fullW / 2 - CX, fullH / 2 - CY, w, h);
    camera.updateProjectionMatrix();
    pivot.rotation.z = UPRIGHT ? -Math.PI / 2 : 0;
    material.uniforms.uAmp.value = UPRIGHT ? AMP_UPRIGHT : 1;
    // upright, the far side sits right behind the front panel instead of above it: keep it fainter
    material.uniforms.uBack.value = UPRIGHT ? 0.12 : 0.3;
    group.rotation.x = TILT;
    group.position.z = -R;
    material.uniforms.uR.value = R;
    if (builtFor !== `${R}x${H}x${COLS}x${UPRIGHT}`) {
        builtFor = `${R}x${H}x${COLS}x${UPRIGHT}`;
        meshes[0].geometry.dispose();
        const geometry = buildBand(R, H);
        meshes.forEach((m) => { m.geometry = geometry; });
        redrawAtlas();
    }
    requestRender();
}

// drawn through core/ticker.js: on the same frames as the 3D background, under the Graphics fps cap
function frame(step) {
    const dt = Math.min(0.05, step);
    if (!reduceMotion) phase += dt * 0.55;
    flex *= Math.pow(0.12, dt); // springs back in about a second
    if (flex < 0.02) flex = 0;
    tapT += dt;

    const u = material.uniforms;
    u.uRot.value = rotFor(props.progress);
    u.uPhase.value = phase;
    u.uFlex.value = flex;
    u.uTapT.value = tapT;
    renderer.render(scene, camera);
    if (refractRef.value && cssW) refractRef.value.style.clipPath = outline(u.uRot.value, phase, flex, cssW, cssH);

    // keep animating while on screen (the wave), otherwise only when something changes
    if (!(visible && (!reduceMotion || flex > 0 || tapT < 1.2))) { stopFrames?.(); stopFrames = null; }
}

function requestRender() {
    if (renderer) stopFrames ??= onFrame(frame);
}

watch(() => props.progress, (p) => {
    const r = rotFor(p);
    if (lastRot !== null) {
        const d = Math.abs(r - lastRot);
        if (d < GROUP_ANGLE * 3) flex = Math.min(14, flex + d * 30); // scroll flexes the sheet
    }
    lastRot = r;
    requestRender();
});

watch(locale, () => redrawAtlas());

// Tap bounce, like the glass cards (src/core/glassTap.js): the band squashes and stretches, and the
// sheet itself flexes and springs back
function bounce() {
    if (reduceMotion) return;
    flex = Math.min(16, flex + 11);
    requestRender();
    const a = 0.035;
    // squash across the band, stretch along it (upright: the band runs across the screen)
    const sq = (along, across) => (UPRIGHT ? `${across} ${along}` : `${along} ${across}`);
    wrapRef.value?.animate(
        [
            { scale: '1 1' },
            { scale: sq(1 + a, 1 - a * 1.4), offset: 0.22 },
            { scale: sq(1 - a * 0.6, 1 + a * 0.9), offset: 0.42 },
            { scale: sq(1 + a * 0.3, 1 - a * 0.3), offset: 0.62 },
            { scale: '1 1' },
        ],
        { duration: 750, easing: 'ease-out' },
    );
}

// Tap: find where the ray meets the (unbent) loop, ripple the glass from there and bounce
const raycaster = new THREE.Raycaster();
function onTap(e) {
    if (!renderer || !meshes.length) return;
    const rect = canvasRef.value.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
    const ray = raycaster.ray.clone().applyMatrix4(inv);
    // intersect with the cylinder x² + z² = R² (nearest hit in front)
    const { origin: o, direction: d } = ray;
    const a = d.x * d.x + d.z * d.z;
    const b = 2 * (o.x * d.x + o.z * d.z);
    const c = o.x * o.x + o.z * o.z - R * R;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return;
    const tHit = (-b - Math.sqrt(disc)) / (2 * a);
    const p = o.clone().addScaledVector(d, tHit);
    if (Math.abs(p.y) > H / 2 + 40) return; // tapped the empty space around the band
    const angle = Math.atan2(p.x, p.z) - rotFor(props.progress); // back to the band's own angle
    if (!reduceMotion) {
        material.uniforms.uTap.value.set(angle, Math.max(-H / 2, Math.min(H / 2, p.y)));
        tapT = 0;
    }
    bounce();
}

// Drag left / right to turn the loop: the sheet follows the pointer at the front, then snaps to the
// nearest group. Turning means scrolling the pinned section, so the page scroll stays in sync.
const clamp01 = (v) => Math.min(1, Math.max(0, v));
let drag = null;
function onDown(e) {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, start: props.progress, moved: false };
}
function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    // upright, the page scroll already spins the drum: any movement is a scroll, not a tap or a drag
    if (UPRIGHT) {
        if (Math.abs(dx) > 6 || Math.abs(e.clientY - drag.y) > 6) drag = null;
        return;
    }
    if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        drag.moved = true;
        wrapRef.value.setPointerCapture?.(e.pointerId);
        wrapRef.value.classList.add('dragging');
    }
    // dx px at the front of the loop = dx / R radians; one group = GROUP_ANGLE
    emit('seek', clamp01(drag.start - dx / R / GROUP_ANGLE / (N - 1)), true);
}
function endDrag(e) {
    const d = drag;
    drag = null;
    wrapRef.value?.classList.remove('dragging');
    wrapRef.value?.releasePointerCapture?.(e.pointerId);
    return d;
}
function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = endDrag(e);
    if (d.moved) emit('seek', Math.round(props.progress * (N - 1)) / (N - 1), false);
    else onTap(e);
}
function onCancel(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (endDrag(e).moved) emit('seek', Math.round(props.progress * (N - 1)) / (N - 1), false);
}

onMounted(() => {
    const canvas = canvasRef.value;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isPhone, powerPreference: 'low-power' });
    } catch {
        emit('unsupported');
        return;
    }
    // phones: lower resolution (their GPUs also run the 3D background)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isPhone ? 1.5 : 2));
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // colours pass through as drawn
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
    camera.position.set(0, 0, CAMERA_DIST);
    // pivot: turns the whole loop in the screen plane (upright on phones); group: tilt + pushed back by R
    pivot = new THREE.Group();
    group = new THREE.Group();
    group.rotation.x = TILT;
    pivot.add(group);
    scene.add(pivot);

    atlas = document.createElement('canvas');
    texture = new THREE.CanvasTexture(atlas);
    texture.colorSpace = THREE.NoColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    texture.wrapS = THREE.RepeatWrapping;
    bumpAtlas = document.createElement('canvas');
    bumpTexture = new THREE.CanvasTexture(bumpAtlas);
    bumpTexture.colorSpace = THREE.NoColorSpace;
    bumpTexture.wrapS = THREE.RepeatWrapping;

    material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        uniforms: {
            uMap: { value: texture },
            uBump: { value: bumpTexture },
            uTexel: { value: new THREE.Vector2(1 / 4096, 1 / 512) },
            uTint: { value: new THREE.Color('#ffffff') },
            uLight: { value: 0 },
            uAmp: { value: 1 },
            uBack: { value: 0.3 },
            uRot: { value: rotFor(props.progress) },
            uPhase: { value: 0 },
            uFlex: { value: 0 },
            uTap: { value: new THREE.Vector2() },
            uTapT: { value: 9 },
            uR: { value: R },
        },
    });
    // see-through object: draw the far / inner side first, then the near side over it
    const front = material.clone();
    front.side = THREE.FrontSide;
    front.uniforms = material.uniforms;

    const empty = new THREE.BufferGeometry();
    meshes = [material, front].map((m, i) => {
        const mesh = new THREE.Mesh(empty, m);
        mesh.frustumCulled = false; // positions only exist in the shader
        mesh.renderOrder = i;
        group.add(mesh);
        return mesh;
    });

    applyTheme();
    resize();

    io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        wrapRef.value?.classList.toggle('offscreen', !visible); // pauses the float (it moves glass)
        if (visible) requestRender();
    });
    io.observe(wrapRef.value);
    ro = new ResizeObserver(() => resize());
    ro.observe(wrapRef.value);
    window.addEventListener('resize', resize); // desktop sizes also follow the window's height
    // theme switch: new colours, font and (light mode) logo inversion
    mo = new MutationObserver(() => {
        applyTheme();
        redrawAtlas();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-look', 'data-theme'] });
});

onBeforeUnmount(() => {
    stopFrames?.();
    io?.disconnect();
    ro?.disconnect();
    window.removeEventListener('resize', resize);
    mo?.disconnect();
    meshes[0]?.geometry?.dispose();
    meshes.forEach((m) => m.material.dispose());
    texture?.dispose();
    bumpTexture?.dispose();
    renderer?.dispose();
});
</script>

<style scoped>
.ribbon-wrap {
    /* full viewport width (wider than the page's 1000px content column), so the flexing sheet never
       gets clipped; html's overflow-x: clip keeps it from adding a sideways scroll */
    --w: 100vw; /* .content and #app let it out of the column in ribbon mode: global.css */
    position: relative;
    left: 50%;
    width: var(--w);
    margin-left: calc(var(--w) / -2);
    cursor: grab;
    touch-action: pan-y; /* sideways drags turn the ribbon, vertical swipes still scroll the page */
    user-select: none;
    -webkit-user-select: none;
    /* the whole band floats a little */
    animation: ribbon-float 7s ease-in-out infinite;
}

.ribbon-wrap.offscreen {
    animation-play-state: paused;
}

@keyframes ribbon-float {
    0%, 100% { translate: 0 -6px; }
    50% { translate: 0 6px; }
}

/* same glass as the cards (themes/shared/base.css): --lg-url is the liquid-glass distortion when
   refraction is on (Graphics settings), a no-op otherwise; Safari / Firefox get the blur only */
.ribbon-refract {
    position: absolute;
    inset: 0;
    pointer-events: none;
    clip-path: polygon(0 0, 0 0, 0 0);
    -webkit-backdrop-filter: blur(var(--glass-blur, 2px)) saturate(170%);
    backdrop-filter: var(--lg-url, url(#liquid-glass)) blur(var(--glass-blur, 2px)) saturate(170%) brightness(1.06);
}

.ribbon-wrap.upright {
    cursor: pointer; /* spins with the page scroll; tap only */
}

.ribbon-wrap.dragging {
    cursor: grabbing;
}

.ribbon-canvas {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
    .ribbon-wrap {
        animation: none;
    }
}
</style>
