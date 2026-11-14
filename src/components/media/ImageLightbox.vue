<template>
    <!--
        Full-screen image viewer for project screenshots.
        - opens with a "genie" effect: the image pours out of the thumbnail that was clicked (and back into it)
        - blurred page behind; glass ‹ › buttons at the sides, a gallery strip of the other shots below
        - the project's details sit to the right of every shot (under it on phones), laid out as plain text:
          overview, organisation, role, platform, users, highlights, stack, links, plus the shot's own
          caption when it has one (projects.details.<key>.shots). They pour out of / back into the
          thumbnail with the same genie as the image
        - close: click the backdrop, the × (top right) or Esc; ← / → and swipes navigate
    -->
    <div v-if="mounted" class="lb" :class="{ shown }" role="dialog" aria-modal="true"
        :aria-label="lightbox.title || 'Gallery'" data-lenis-prevent @click.self="close">
        <p class="lb-count" aria-live="polite">
            <span v-if="lightbox.title" class="lb-title">{{ lightbox.title }}</span>
            {{ lightbox.index + 1 }} / {{ lightbox.images.length }}
        </p>

        <button ref="closeRef" type="button" class="lb-btn lb-close" :aria-label="$t('settings.close')" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
            </svg>
        </button>

        <div class="lb-stage" :class="{ 'has-panel': !!project }" @click.self="close">
            <div class="lb-media" @click.self="close" @pointerdown="onSwipeStart" @pointerup="onSwipeEnd">
                <img ref="imgRef" class="lb-img" :src="lightbox.images[lightbox.index]" :alt="imgAlt"
                    draggable="false">
            </div>

            <aside v-if="project" ref="panelRef" class="lb-panel" data-lenis-prevent>
                <header class="lb-head">
                    <h2 class="lb-name">{{ project.title }}</h2>
                    <span v-if="project.year" class="lb-chip">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.year" /></svg>
                        {{ project.year }}
                    </span>
                </header>
                <p v-if="caption" :key="lightbox.index" class="lb-caption">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.image" /></svg>
                    {{ caption }}
                </p>
                <p v-if="detail('summary')" class="lb-summary">{{ detail('summary') }}</p>

                <dl v-if="fields.length" class="lb-fields">
                    <div v-for="f in fields" :key="f.key" class="lb-field">
                        <dt>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS[f.key]" /></svg>
                            {{ $t(`projects.fields.${f.key}`) }}
                        </dt>
                        <dd>{{ f.value }}</dd>
                    </div>
                </dl>

                <section v-if="highlights.length" class="lb-section">
                    <h3>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.highlights" /></svg>
                        {{ $t('projects.fields.highlights') }}
                    </h3>
                    <ul class="lb-list">
                        <li v-for="h in highlights" :key="h">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.check" /></svg>
                            {{ h }}
                        </li>
                    </ul>
                </section>

                <section v-if="project.techStack?.length" class="lb-section">
                    <h3>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.stack" /></svg>
                        {{ $t('projects.fields.stack') }}
                    </h3>
                    <div class="lb-stack">
                        <span v-for="tech in project.techStack" :key="tech">{{ tech }}</span>
                    </div>
                </section>

                <div v-if="project.githubLink || project.ytLink" class="lb-links">
                    <a v-if="project.githubLink" :href="project.githubLink" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.code" /></svg>
                        {{ $t('projects.github') }}
                    </a>
                    <a v-if="project.ytLink" :href="project.ytLink" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.link" /></svg>
                        {{ $t('projects.demo') }}
                    </a>
                </div>
            </aside>
        </div>

        <template v-if="lightbox.images.length > 1">
            <button type="button" class="lb-btn lb-prev" aria-label="Previous image" @click="go(-1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" />
                </svg>
            </button>
            <button type="button" class="lb-btn lb-next" aria-label="Next image" @click="go(1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                </svg>
            </button>

            <div ref="stripRef" class="lb-strip" @click.self="close">
                <button v-for="(src, i) in lightbox.images" :key="src + i" type="button" class="lb-thumb"
                    :class="{ active: i === lightbox.index }" :aria-label="`Image ${i + 1}`"
                    :aria-current="i === lightbox.index" @click="go(i - lightbox.index)">
                    <img :src="src" alt="" loading="lazy" draggable="false">
                </button>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { lightbox } from '../../core/lightbox';
import { lenis } from '../../core/lenis';

const mounted = ref(false); // in the DOM (stays during the closing animation)
const shown = ref(false); // backdrop / chrome visible
const imgRef = ref(null);
const stripRef = ref(null);
const closeRef = ref(null);
const panelRef = ref(null);
let busy = false;
const { t, te } = useI18n();

/* ---------- Details panel ---------- */
// 24px stroke icons (one path each)
const ICONS = {
    org: 'M3 21h18M5 21V9l7-5 7 5v12M9.5 21v-5h5v5M9 12h.01M15 12h.01',
    company: 'M4 21V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14M4 21h16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-3h4v3',
    role: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
    platform: 'M3 5h12v9H3zM6.5 18h5M9 14v4M17 8h4v12h-4zM19 17h.01',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M17.5 14.2a6.5 6.5 0 0 1 4 5.8',
    year: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
    highlights: 'M12 3l2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4z',
    check: 'M5 12.5l4.2 4.2L19 7',
    stack: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
    code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
    link: 'M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 2.5-2.5L20 17M15.5 9.5h.01',
};
const FIELDS = ['org', 'company', 'role', 'platform', 'users'];

const project = computed(() => lightbox.project);
const base = computed(() => (project.value?.key ? `projects.details.${project.value.key}` : null));
const detail = (k) => (base.value && te(`${base.value}.${k}`) ? t(`${base.value}.${k}`) : '');
const fields = computed(() => FIELDS.map((key) => ({ key, value: detail(key) })).filter((f) => f.value));
const highlights = computed(() => {
    const out = [];
    for (let i = 0; base.value && te(`${base.value}.highlights.${i}`); i++) out.push(t(`${base.value}.highlights.${i}`));
    return out;
});
const caption = computed(() => {
    const src = lightbox.images[lightbox.index] || '';
    const file = src.split('/').pop();
    // keys with a dot need the list form in vue-i18n paths
    const key = base.value && `${base.value}.shots['${file}']`;
    return key && te(key) ? t(key) : '';
});
const imgAlt = computed(() => caption.value || (lightbox.title ? `${lightbox.title} ${lightbox.index + 1}` : ''));

const reduce = (() => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
})();

/* ---------- Genie ----------
   The image is laid out at its final size; a transform carries it from the thumbnail to there, while a
   clip-path funnel (narrow at the edge nearest the thumbnail, opening up away from it) makes it look
   like it pours out. Same number of polygon points in every frame so the browser can interpolate. */
const N = 10;
function funnel(pinch, edge) {
    // pinch 0..1: how much the edge facing the thumbnail is squeezed (0 = plain rectangle)
    const left = [];
    const right = [];
    for (let i = 0; i <= N; i++) {
        const f = i / N; // 0 at the far edge, 1 at the thumbnail edge
        const inset = (pinch * 46 * f * f * (3 - 2 * f)).toFixed(2); // smoothstep curve
        const pos = (edge === 'top' ? (1 - f) : f) * 100;
        left.push(`${inset}% ${pos}%`);
        right.push(`${(100 - inset).toFixed(2)}% ${pos}%`);
    }
    return `polygon(${[...left, ...right.reverse()].join(', ')})`;
}

function genieFrames(from, to) {
    // origin below the image -> squeeze the bottom edge, otherwise the top
    const edge = from.top + from.height / 2 > to.top + to.height / 2 ? 'bottom' : 'top';
    const at = (k, sx, sy) => {
        const x = from.left - to.left;
        const y = from.top + (edge === 'bottom' ? from.height : 0) - (to.top + (edge === 'bottom' ? to.height : 0));
        return `translate(${x * k}px, ${y * k}px) scale(${sx}, ${sy})`;
    };
    const sx0 = Math.max(0.02, from.width / to.width);
    const sy0 = Math.max(0.02, from.height / to.height);
    const lerp = (a, b, k) => a + (b - a) * k;
    return {
        edge,
        frames: [
            { transform: at(1, sx0, sy0), clipPath: funnel(0, edge), opacity: 0.6, offset: 0 },
            // stretches along the pour first while still narrow where it leaves the thumbnail
            { transform: at(0.55, lerp(sx0, 1, 0.45), lerp(sy0, 1, 0.8)), clipPath: funnel(0.9, edge), opacity: 1, offset: 0.4 },
            { transform: at(0.15, lerp(sx0, 1, 0.88), 1.02), clipPath: funnel(0.35, edge), offset: 0.72 },
            { transform: 'translate(0px, 0px) scale(1, 1)', clipPath: funnel(0, edge), offset: 1 },
        ],
    };
}

async function measure() {
    const img = imgRef.value;
    if (!img) return null;
    try { await img.decode(); } catch { /* cached thumbnail, or decode not supported */ }
    return img.getBoundingClientRect();
}

const EASE_OUT = 'cubic-bezier(0.3, 0.7, 0.2, 1)';
const EASE_IN = 'cubic-bezier(0.6, 0, 0.8, 0.4)';

// pour `el` out of the thumbnail
function pourOut(el, from, delay = 0) {
    const { frames, edge } = genieFrames(from, el.getBoundingClientRect());
    el.style.transformOrigin = edge === 'bottom' ? '0 100%' : '0 0';
    return el.animate(frames, { duration: 620, delay, easing: EASE_OUT, fill: 'backwards' }).finished.catch(() => { });
}

// ...and back into it: the opening frames played backwards
function pourIn(el, from, delay = 0) {
    const { frames, edge } = genieFrames(from, el.getBoundingClientRect());
    el.style.transformOrigin = edge === 'bottom' ? '0 100%' : '0 0';
    const back = frames.slice().reverse().map((f) => ({ ...f, offset: 1 - f.offset, opacity: 1 }));
    back[back.length - 1].opacity = 0;
    return el.animate(back, { duration: 480, delay, easing: EASE_IN, fill: 'both' }).finished.catch(() => { });
}

async function openFx() {
    mounted.value = true;
    lenis.stop();
    window.addEventListener('keydown', onKey);
    await nextTick();
    const img = imgRef.value;
    const panelEl = panelRef.value;
    img.style.opacity = '0';
    if (panelEl) panelEl.style.opacity = '0';
    await measure();
    requestAnimationFrame(() => { shown.value = true; });
    scrollThumb();
    closeRef.value?.focus({ preventScroll: true });
    const from = lightbox.origin;
    img.style.opacity = '';
    if (panelEl) panelEl.style.opacity = '';
    if (!from || reduce) return;
    busy = true;
    // the details follow the image out a beat later
    await Promise.all([pourOut(img, from), panelEl && pourOut(panelEl, from, 90)]);
    busy = false;
}

async function close() {
    if (busy || !mounted.value) return;
    const img = imgRef.value;
    const panelEl = panelRef.value;
    const from = lightbox.origin;
    shown.value = false;
    if (img && from && !reduce) {
        busy = true;
        // the details go first, the image follows them in
        await Promise.all([panelEl && pourIn(panelEl, from), pourIn(img, from, panelEl ? 70 : 0)]);
        busy = false;
    } else {
        await new Promise((r) => setTimeout(r, 250));
    }
    mounted.value = false;
    lightbox.open = false;
    lenis.start();
    window.removeEventListener('keydown', onKey);
}

/* ---------- Navigation ---------- */
async function go(step) {
    const n = lightbox.images.length;
    if (!step || n < 2 || busy) return;
    lightbox.index = (lightbox.index + step + n) % n;
    scrollThumb();
    await nextTick();
    if (reduce) return;
    const dir = step > 0 ? 1 : -1;
    imgRef.value?.animate(
        [{ opacity: 0, transform: `translateX(${dir * 60}px) scale(0.97)` }, { opacity: 1, transform: 'none' }],
        { duration: 380, easing: 'cubic-bezier(0.34, 1.3, 0.5, 1)' },
    );
}

function scrollThumb() {
    nextTick(() => {
        const strip = stripRef.value;
        const active = strip?.querySelector('.lb-thumb.active');
        if (!strip || !active) return;
        strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
    });
}

const onKey = (e) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
};

let swipeX = null;
const onSwipeStart = (e) => { swipeX = e.clientX; };
const onSwipeEnd = (e) => {
    if (swipeX == null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
};

watch(() => lightbox.open, (open) => { if (open && !mounted.value) openFx(); });
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
.lb {
    position: fixed;
    inset: 0;
    z-index: 10001;
    display: grid;
    /* minmax(0, 1fr): the stage row never grows past the viewport, however tall the image is */
    grid-template-rows: auto minmax(0, 1fr) auto;
    padding: 20px 20px 18px;
    color: var(--light);
    font-family: var(--poppins);
    /* blurred page behind */
    background: color-mix(in srgb, var(--dark) 0%, transparent);
    -webkit-backdrop-filter: blur(0px);
    backdrop-filter: blur(0px);
    transition: background 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease !important;
}

.lb.shown {
    background: color-mix(in srgb, var(--dark) 55%, transparent);
    -webkit-backdrop-filter: blur(18px) saturate(1.2);
    backdrop-filter: blur(18px) saturate(1.2);
}

/* chrome fades in after the image starts pouring */
.lb-count,
.lb-btn,
.lb-strip {
    opacity: 0;
    transition: opacity 0.25s ease, translate 0.45s cubic-bezier(0.34, 1.5, 0.5, 1) !important;
}

.lb.shown :is(.lb-count, .lb-btn, .lb-strip) {
    opacity: 1;
    transition-delay: 0.2s !important;
}

.lb-count {
    margin: 0;
    justify-self: start;
    align-self: center;
    font-size: var(--XS);
    color: var(--gray-light);
    font-variant-numeric: tabular-nums;
    padding-right: 64px;
}

.lb-title {
    color: var(--light);
    font-weight: 600;
    margin-right: 10px;
}

.lb-stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    min-height: 0;
    padding: 10px 80px;
}

/* the image's box fills whatever the details panel (pinned far right) leaves; the image is centred in it,
   whether the shot is tall or wide */
.lb-media {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: pan-y;
}

/* ---------- Details / caption panel ---------- */
.lb-panel {
    flex: 0 0 360px;
    max-height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 4px 6px 4px 0;
    text-align: left;
    color: var(--light);
    scrollbar-width: thin;
    will-change: transform, clip-path;
}

/* sections keep their size; the panel scrolls instead */
.lb-panel > * {
    flex-shrink: 0;
}

/* a thin divider above each section after the intro (name, caption, overview) */
.lb-panel > :is(.lb-fields, .lb-section, .lb-links) {
    padding-top: 18px;
    border-top: 1px solid color-mix(in srgb, var(--light) 14%, transparent);
}


.lb-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.lb-name {
    margin: 0;
    font-family: var(--look-display, var(--poppins));
    font-size: var(--M);
    line-height: 1.25;
    color: var(--light);
}

.lb-chip {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: var(--XS);
    color: var(--accent, var(--light));
    border: 1px solid color-mix(in srgb, var(--accent, white) 45%, transparent);
    background: color-mix(in srgb, var(--accent, white) 10%, transparent);
}

.lb-panel svg {
    flex: none;
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.lb-summary {
    margin: 0;
    font-size: var(--S);
    line-height: 1.6;
    color: color-mix(in srgb, var(--light) 88%, transparent);
}

.lb-caption {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: -6px 0 0;
    font-size: var(--XS);
    line-height: 1.55;
    color: var(--accent, var(--light));
    animation: lb-fade 0.35s ease both;
}

.lb-caption svg {
    margin-top: 2px;
}

@keyframes lb-fade {
    from {
        opacity: 0;
        translate: 0 6px;
    }
}

.lb-fields {
    display: grid;
    gap: 14px;
    margin: 0;
}

.lb-field {
    display: grid;
    gap: 3px;
}

.lb-field dt {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--XXS);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gray-light);
}

.lb-field dt svg {
    color: var(--accent, var(--light));
}

.lb-field dd {
    margin: 0 0 0 24px;
    font-size: var(--XS);
    line-height: 1.5;
}

.lb-section {
    display: grid;
    gap: 10px;
}

.lb-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: var(--XS);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gray-light);
}

.lb-section h3 svg {
    color: var(--accent, var(--light));
}

.lb-list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.lb-list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: var(--XS);
    line-height: 1.5;
}

.lb-list li svg {
    margin-top: 2px;
    color: var(--accent, var(--light));
    stroke-width: 2.4;
}

.lb-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.lb-stack span {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: var(--XXS);
    border: 1px solid color-mix(in srgb, var(--accent, white) 40%, transparent);
}

.lb-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 2px;
}

.lb-links a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 30px;
    font-size: var(--XS);
    color: var(--light);
    text-decoration: none;
    cursor: pointer;
    border: 1px solid color-mix(in srgb, white 22%, transparent);
    background: color-mix(in srgb, var(--light) 6%, transparent);
    transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease !important;
}

.lb-links a:hover {
    color: var(--accent, var(--light));
    border-color: color-mix(in srgb, var(--accent, white) 60%, transparent);
    background: color-mix(in srgb, var(--accent, white) 10%, transparent);
}

.lb-img {
    display: block;
    min-width: 0;
    min-height: 0;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 14px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
    user-select: none;
    will-change: transform, clip-path;
}

/* glass buttons */
.lb-btn {
    position: absolute;
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    padding: 0;
    border-radius: 50%;
    color: var(--light);
    cursor: pointer;
    background:
        radial-gradient(120% 90% at 30% 15%, color-mix(in srgb, white 22%, transparent), transparent 55%),
        color-mix(in srgb, var(--light) 8%, transparent);
    -webkit-backdrop-filter: blur(10px) saturate(1.6);
    backdrop-filter: blur(10px) saturate(1.6);
    border: 1px solid color-mix(in srgb, white 24%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 35%, transparent), 0 10px 26px rgba(0, 0, 0, 0.3);
}

.lb-btn svg {
    width: 22px;
    height: 22px;
}

.lb-btn:hover {
    border-color: color-mix(in srgb, var(--accent, white) 60%, transparent);
    color: var(--accent, var(--light));
}

.lb-btn:focus-visible {
    outline: 2px solid var(--accent, white);
    outline-offset: 3px;
}

.lb-close {
    top: 16px;
    right: 18px;
    width: 46px;
    height: 46px;
}

.lb-prev,
.lb-next {
    top: 50%;
    margin-top: -60px; /* centred on the stage, above the strip */
}

.lb-prev {
    left: 18px;
}

.lb-next {
    right: 18px;
}

.lb-prev:hover {
    translate: -3px 0;
}

.lb-next:hover {
    translate: 3px 0;
}

/* gallery strip */
.lb-strip {
    display: flex;
    gap: 10px;
    justify-content: safe center;
    overflow-x: auto;
    padding: 12px 4px 4px;
    scrollbar-width: none;
    translate: 0 16px;
}

.lb.shown .lb-strip {
    translate: 0 0;
}

.lb-strip::-webkit-scrollbar {
    display: none;
}

.lb-thumb {
    flex: 0 0 auto;
    width: 84px;
    height: 60px;
    padding: 0;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid color-mix(in srgb, white 14%, transparent);
    background: color-mix(in srgb, var(--light) 6%, transparent);
    opacity: 0.55;
    transition: opacity 0.2s ease, border-color 0.2s ease, translate 0.35s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.lb-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
}

.lb-thumb:hover {
    opacity: 0.85;
    translate: 0 -3px;
}

.lb-thumb.active {
    opacity: 1;
    border-color: var(--accent, var(--light));
    translate: 0 -4px;
}

/* tablets / phones: the panel goes under the image */
@media screen and (max-width: 900px) {
    .lb-stage {
        flex-direction: column;
        gap: 14px;
        padding: 10px 64px;
    }

    .lb-media {
        justify-content: center;
        width: 100%;
        height: auto;
        flex: 1 1 0;
        min-height: 0;
    }

    .lb-panel {
        flex: 0 1 auto;
        align-self: stretch;
        max-height: 50%;
        padding: 4px 6px;
        gap: 14px;
    }
}

@media screen and (max-width: 638px) {
    .lb {
        padding: 14px 10px 14px;
    }

    .lb-stage {
        padding: 10px 0;
    }

    .lb-stage.has-panel ~ :is(.lb-prev, .lb-next) {
        top: 27%;
    }

    .lb-prev,
    .lb-next {
        width: 42px;
        height: 42px;
    }

    .lb-prev {
        left: 8px;
    }

    .lb-next {
        right: 8px;
    }

    .lb-close {
        top: 10px;
        right: 10px;
        width: 42px;
        height: 42px;
    }

    .lb-thumb {
        width: 64px;
        height: 46px;
    }
}
</style>
