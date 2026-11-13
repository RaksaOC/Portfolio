<template>
    <!--
        Reload intro under the big name:
        1. type "Theme Selected:"     2. slot-machine reel of themes (name + palette), slowing down
        (meanwhile the page is a pitch-black night sky with stars, see Background.vue; the intro always runs
        dark so its text reads on black, the visitor's light / dark mode comes back with the reveal)
        3. land on the random theme   4. a ripple bursts out of the winning row and reveals the theme
           (View Transition: the new page grows inside an expanding circle with a glowing rim)
        5. fade out (collapsing its height so the name glides back to centre) and give scrolling back.
    -->
    <div v-if="phase !== 'gone'" ref="rootRef" class="theme-intro" :class="phase" aria-live="polite">
        <p class="ti-label">
            <span>{{ typed }}</span><i class="ti-caret" aria-hidden="true"></i>
        </p>
        <div class="ti-reel" :class="{ show: phase !== 'typing' }">
            <div class="ti-strip" ref="stripRef">
                <div v-for="(l, i) in reel" :key="i" :ref="(el) => (itemEls[i] = el)" class="ti-item" :class="{ won: landed && i === winIndex }"
                    :style="{ '--acc': l.sw[mode][1] }">
                    <span class="ti-sw" aria-hidden="true">
                        <i v-for="(c, j) in l.sw[mode]" :key="j" :style="{ background: c }"></i>
                    </span>
                    <span class="ti-name" :style="{ fontFamily: reelFont(l) }">{{ lookName(l, locale) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { LOOKS, findLook, loadDisplayFonts, lookName, nameFontCss } from '../themes/looks';
import { intro, prefs, theme, KM_FONTS, loadFonts } from '../prefs';
import { applyCursor } from '../cursors';
import { lenis } from '../lenis';

const { t, locale } = useI18n();
const ITEM_H = 40; // px, keep in sync with .ti-item height
const LOOPS = 4;

const phase = ref(intro.running ? 'typing' : 'gone');
const typed = ref('');
const landed = ref(false);
const stripRef = ref(null);
const rootRef = ref(null);
const itemEls = [];
// the intro runs in dark mode (night sky), so the reel shows each theme's dark swatches
const mode = computed(() => (phase.value === 'gone' ? theme.value : 'dark'));
const setMode = (m) => {
    const root = document.documentElement;
    if (root.getAttribute('data-theme') === m) return;
    root.setAttribute('data-theme', m);
    applyCursor();
};

const targetIdx = Math.max(0, LOOKS.findIndex((l) => l.id === intro.target));
// Start the reel on a random theme so every spin looks different, end on the target after a few loops
const startIdx = Math.floor(Math.random() * LOOKS.length);
const reel = [];
for (let i = 0; i < LOOPS * LOOKS.length + targetIdx + 2 - startIdx; i++) reel.push(LOOKS[(startIdx + i) % LOOKS.length]);
const winIndex = reel.length - 2; // second to last, so one item peeks below

// Each row (and the big name above, see Welcome.vue) is set in its theme's own heading font. Loaded as
// one Google Fonts request trimmed (`text=`) to just the letters needed, so it's a few KB; removed
// again when the intro ends.
const reelFont = (l) => nameFontCss(l, locale.value, KM_FONTS);
let reelFontLink = null;
function loadReelFonts() {
    const text = LOOKS.map((l) => l.name).join('') + t('name.last') + t('name.first');
    reelFontLink = loadDisplayFonts(text, 'reel-fonts');
    // Khmer: the name cycles through every theme's Khmer display face too. Loaded whole (no `text=`
    // subsetting, which can break Khmer shaping); only in Khmer and only for the intro.
    if (locale.value === 'km') loadFonts(Object.values(KM_FONTS).map((f) => f.display), 'km-reel-fonts');
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let cancelled = false;

const lock = () => {
    try { history.scrollRestoration = 'manual'; } catch { /* ignore */ }
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });
    lenis.stop();
    document.documentElement.classList.add('intro-lock');
};
const unlock = () => {
    document.documentElement.classList.remove('intro-lock');
    lenis.start();
};

const graphemes = (str) => {
    try { return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(str)].map((s) => s.segment); }
    catch { return [...str]; }
};

async function typeLabel() {
    for (const ch of graphemes(t('intro.label'))) {
        if (cancelled) return;
        typed.value += ch;
        await wait(ch === ' ' ? 40 : 65);
    }
}

// Drum depth: each row gets --d = its distance (in rows) from the payline; CSS tilts, shifts,
// shrinks and shades the off-centre rows from that. Driven every frame while the reel is visible.
let depthRaf = 0;
function paintDepth() {
    const strip = stripRef.value;
    if (strip) {
        const ty = new DOMMatrixReadOnly(getComputedStyle(strip).transform).m42;
        // theme on the payline -> the background and globe take its colours
        const mid = reel[Math.round(-ty / ITEM_H) + 1];
        if (mid && intro.preview !== mid.id) intro.preview = mid.id;
        const first = Math.max(0, Math.floor(-ty / ITEM_H) - 1);
        for (let i = first; i < Math.min(reel.length, first + 5); i++) {
            const el = itemEls[i];
            if (!el) continue;
            const d = (i * ITEM_H + ty) / ITEM_H - 1; // the middle of three rows is the payline
            el.style.setProperty('--d', d.toFixed(3));
            el.style.setProperty('--ad', Math.min(Math.abs(d), 1.6).toFixed(3));
        }
    }
    depthRaf = requestAnimationFrame(paintDepth);
}

async function spin() {
    const strip = stripRef.value;
    if (!strip) return;
    // the window shows three rows; the winner ends in the middle one
    const end = -(winIndex - 1) * ITEM_H;
    const anim = strip.animate(
        [
            { transform: 'translateY(0)', filter: 'blur(0px)' },
            { filter: 'blur(2.5px)', offset: 0.15 },
            { filter: 'blur(1.5px)', offset: 0.6 },
            { transform: `translateY(${end - 10}px)`, filter: 'blur(0px)', offset: 0.93 },
            { transform: `translateY(${end}px)`, filter: 'blur(0px)' },
        ],
        { duration: 3000, easing: 'cubic-bezier(0.12, 0.78, 0.2, 1)', fill: 'forwards' },
    );
    await anim.finished.catch(() => { });
}

// Shrink the block's height to 0 so the centred name slides back down smoothly instead of snapping
async function collapse() {
    const el = rootRef.value;
    if (!el) return;
    const h = el.offsetHeight;
    const anim = el.animate(
        [
            { height: `${h}px`, marginTop: '0px', opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-8px)', offset: 0.45 },
            { height: '0px', marginTop: '0px', opacity: 0, transform: 'translateY(-8px)' },
        ],
        { duration: 1000, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
    );
    await anim.finished.catch(() => { });
}

// Ripple reveal: the new theme grows out of the winning row inside an expanding circle. A glowing rim rides
// the circle's edge with two softer ripples trailing behind it (they're part of the new page, so they only
// show inside the circle).
async function ripple(id) {
    const root = document.documentElement;
    const won = itemEls[winIndex]?.getBoundingClientRect();
    const x = won ? won.left + won.width / 2 : innerWidth / 2;
    const y = won ? won.top + won.height / 2 : innerHeight / 2;
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;
    const DURATION = 1400;
    const EASE = 'cubic-bezier(0.2, 0.75, 0.25, 1)';
    let rings = null;

    const apply = async () => {
        setMode(theme.value);
        prefs.look = id;
        await nextTick();
        rings = document.createElement('div');
        rings.className = 'reveal-rings';
        rings.setAttribute('aria-hidden', 'true');
        Object.assign(rings.style, { left: `${x - R}px`, top: `${y - R}px`, width: `${R * 2}px`, height: `${R * 2}px` });
        document.body.appendChild(rings);
    };
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await apply();
        rings?.remove();
        return;
    }
    root.classList.add('look-reveal');
    const vt = document.startViewTransition(apply);
    try {
        await vt.ready;
        root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
            { duration: DURATION, easing: EASE, pseudoElement: '::view-transition-new(root)' },
        );
        rings?.animate(
            [{ transform: 'scale(0)', opacity: 1 }, { opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 0 }],
            { duration: DURATION, easing: EASE, fill: 'forwards' },
        );
        await vt.finished;
    } catch { /* transition skipped */ }
    rings?.remove();
    root.classList.remove('look-reveal');
}

onMounted(async () => {
    if (!intro.running) return;
    loadReelFonts();
    lock();
    setMode('dark');
    await wait(1100); // let the name slide in first
    await typeLabel();
    if (cancelled) return;
    await wait(250);
    phase.value = 'spinning';
    await nextTick();
    paintDepth();
    await spin();
    if (cancelled) return;
    landed.value = true;
    await wait(550);
    await ripple(findLook(intro.target).id);
    await wait(700);
    phase.value = 'leaving';
    await collapse();
    cancelAnimationFrame(depthRaf);
    intro.running = false;
    phase.value = 'gone';
    reelFontLink?.remove();
    document.getElementById('km-reel-fonts')?.remove();
    unlock();
});

onBeforeUnmount(() => {
    cancelled = true;
    setMode(theme.value);
    cancelAnimationFrame(depthRaf);
    unlock();
});
</script>

<style scoped>
.theme-intro {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: var(--poppins);
    color: var(--light);
    overflow: hidden;
}

.ti-label {
    margin: 0;
    white-space: nowrap;
    min-height: 1.6em;
    font-size: var(--XS);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gray-light);
}

.ti-caret {
    display: inline-block;
    width: 2px;
    height: 1.1em;
    margin-left: 4px;
    vertical-align: -0.15em;
    background: currentColor;
    animation: caret 0.9s steps(1) infinite;
}

.spinning .ti-caret,
.leaving .ti-caret {
    display: none;
}

@keyframes caret {
    50% {
        opacity: 0;
    }
}

/* Slot reel to the right of the label: three rows, the middle one is the result.
   It grows from 0 width once typing is done, pushing the label left. */
.ti-reel {
    position: relative;
    height: calc(40px * 3);
    width: 0;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.35s ease, width 0.5s cubic-bezier(0.34, 1.3, 0.5, 1) !important;
    -webkit-mask-image: linear-gradient(transparent, #000 30%, #000 70%, transparent);
    mask-image: linear-gradient(transparent, #000 30%, #000 70%, transparent);
}

.ti-reel.show {
    width: 200px;
    opacity: 1;
}

.ti-strip {
    will-change: transform;
}

/* --d: signed distance from the payline in rows (set per frame), --ad: its absolute value.
   Off-centre rows tip back like a drum, drift right, shrink and fall into shadow. */
.ti-item {
    --d: 0;
    --ad: 0;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    font-size: 1.15rem;
    font-weight: 600;
    white-space: nowrap;
    transform-origin: 0 50%;
    transform:
        perspective(260px)
        translateX(calc(var(--ad) * 14px))
        rotateX(calc(var(--d) * -38deg))
        scale(calc(1 - var(--ad) * 0.14));
    filter: brightness(calc(1 - var(--ad) * 0.45));
    text-shadow: 0 calc(var(--d) * 4px) calc(var(--ad) * 6px) rgba(0, 0, 0, 0.75);
    transition: none !important;
}

.ti-sw {
    display: flex;
    filter: drop-shadow(0 calc(var(--d) * 3px) calc(var(--ad) * 3px) rgba(0, 0, 0, 0.7));
}

.ti-name {
    display: inline-block;
    /* single-weight display faces (Bebas Neue, Marcellus SC, ...) stay crisp instead of faux-bold */
    font-synthesis: none;
}

.ti-sw i {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--light) 40%, transparent);
    margin-left: -5px;
}

.ti-sw i:first-child {
    margin-left: 0;
}

/* winner pops in its own accent colour */
.ti-item.won .ti-name {
    color: var(--acc);
    text-shadow: 0 0 16px color-mix(in srgb, var(--acc) 60%, transparent);
    animation: win-pop 0.5s cubic-bezier(0.34, 1.7, 0.5, 1);
}

@keyframes win-pop {
    0% {
        scale: 1;
    }

    40% {
        scale: 1.15;
    }

    100% {
        scale: 1;
    }
}

/* Khmer theme names run longer */
:root[lang="km"] .ti-reel.show {
    width: 250px;
}

@media screen and (max-width: 638px) {
    :root[lang="km"] .ti-reel.show {
        width: 185px;
    }

    .theme-intro {
        gap: 8px;
    }

    .ti-label {
        font-size: 0.75rem;
        letter-spacing: 0.08em;
    }

    .ti-item {
        font-size: var(--S);
        gap: 8px;
    }

    .ti-reel.show {
        width: 150px;
    }
}
</style>
