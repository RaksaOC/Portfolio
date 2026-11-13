<template>
    <div class="experience" id="experience">
        <SectionIcon icon="experience" :title="$t('nav.experience')" />

        <!--
            Pinned horizontal timeline.
            The outer element is as tall as the horizontal distance to travel. While it is on screen,
            the inner panel sticks to the viewport and vertical scrolling is converted into horizontal
            movement of the track. Once the last card is reached, normal vertical scrolling resumes.
        -->
        <div class="pin-outer" ref="outerRef" :style="{ height: outerHeight + 'px' }">
            <div class="pin-sticky" ref="stickyRef">
                <div class="track-viewport" ref="viewportRef">
                    <div class="track" ref="trackRef" :style="{ transform: `translate3d(${-translate}px, 0, 0)` }">
                        <div class="timeline-line"></div>
                        <div v-for="(exp, index) in experiences" :key="index" class="stop"
                            :class="[index % 2 === 0 ? 'up' : 'down', { visible: visible[index] }]"
                            :ref="el => (stopRefs[index] = el)">
                            <div class="card-wrap" @pointermove="onCardMove">
                                <ExpCard :place="exp.place" :role="exp.role" :desc="exp.desc"
                                    :duration="exp.duration" />
                            </div>
                            <div class="emblem"></div>
                        </div>
                    </div>
                </div>

                <!-- Glass progress pill: tap ripples (like the navbar); tap or drag along the track to scrub -->
                <div class="pin-footer" ref="footerRef" @pointerdown="onFooterDown" @pointermove="onFooterMove"
                    @pointerup="onFooterUp" @pointercancel="onFooterUp">
                    <span v-for="r in ripples" :key="r.id" class="ripple" :style="{ left: `${r.x}px`, top: `${r.y}px` }"
                        aria-hidden="true"></span>
                    <p class="pin-count">{{ String(current).padStart(2, '0') }} / {{ String(EXPERIENCE_KEYS.length).padStart(2, '0') }}</p>
                    <div class="tl-progress" ref="progressRef">
                        <div class="tl-progress-fill" :style="{ transform: `scaleX(${progress})` }"></div>
                    </div>
                    <p class="pin-hint" :class="{ hidden: progress > 0.98 }">{{ $t('experience.scroll') }} &rarr;</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { lenis } from '../lenis';
import SectionIcon from '../components/SectionIcon.vue';
import ExpCard from '../components/ExpCard.vue';
import { useI18n } from 'vue-i18n';

// Content lives in src/i18n/*.js → experience.items.<key>
// oldest → newest, so the timeline reads left to right through time
const EXPERIENCE_KEYS = ['cadtStudent', 'freelance', 'cadtTrainer', 'quicknews', 'camcyber'];
const { t } = useI18n();
const experiences = computed(() => EXPERIENCE_KEYS.map((key) => ({
    place: t(`experience.items.${key}.place`),
    role: t(`experience.items.${key}.role`),
    desc: t(`experience.items.${key}.desc`),
    duration: t(`experience.items.${key}.duration`),
})));

const outerRef = ref(null);
const stickyRef = ref(null);
const viewportRef = ref(null);
const trackRef = ref(null);
const stopRefs = [];

const outerHeight = ref(0);
const translate = ref(0);
const progress = ref(0);
const visible = reactive(EXPERIENCE_KEYS.map((_, i) => i === 0));

const current = computed(() => 1 + Math.round(progress.value * (EXPERIENCE_KEYS.length - 1)));

let distance = 0; // horizontal distance the track has to travel

// Light that follows the cursor across a card (same effect as the project cards)
const onCardMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
};

// Progress pill: ripple from the tap point; tap the track to glide there, or drag along it to scrub
const footerRef = ref(null);
const progressRef = ref(null);
const ripples = ref([]);
let rippleId = 0;
let dragging = false;

const seek = (clientX, immediate) => {
    if (!outerRef.value) return;
    const bar = progressRef.value.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - bar.left) / bar.width));
    const top = outerRef.value.getBoundingClientRect().top + window.scrollY + f * distance;
    lenis.scrollTo(top, immediate ? { immediate: true } : { duration: 1.1 });
};

const onFooterDown = (e) => {
    const box = footerRef.value.getBoundingClientRect();
    const id = ++rippleId;
    ripples.value.push({ id, x: e.clientX - box.left, y: e.clientY - box.top });
    setTimeout(() => { ripples.value = ripples.value.filter((r) => r.id !== id); }, 800);
    const bar = progressRef.value.getBoundingClientRect();
    if (e.clientX >= bar.left - 12 && e.clientX <= bar.right + 12) {
        dragging = true;
        footerRef.value.setPointerCapture?.(e.pointerId);
        seek(e.clientX, false);
    }
};
const onFooterMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    seek(e.clientX, true);
};
const onFooterUp = (e) => {
    if (!dragging) return;
    dragging = false;
    footerRef.value.releasePointerCapture?.(e.pointerId);
};
let rafId = null;

const measure = () => {
    const viewport = viewportRef.value;
    const track = trackRef.value;
    const sticky = stickyRef.value;
    if (!viewport || !track || !sticky) return;
    distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    // Vertical room needed = the panel itself + one pixel of scroll per pixel of horizontal travel
    outerHeight.value = sticky.offsetHeight + distance;
    update();
};

const update = () => {
    const outer = outerRef.value;
    if (!outer) return;
    const rect = outer.getBoundingClientRect();
    const travelled = Math.min(Math.max(-rect.top, 0), distance);
    translate.value = travelled;
    progress.value = distance > 0 ? travelled / distance : 1;

    // Reveal cards as they slide into view (positions computed from the new translate,
    // since the DOM transform is only applied on the next render)
    const viewport = viewportRef.value;
    if (!viewport || rect.top > window.innerHeight * 0.6) return;
    const limit = viewport.clientWidth * 0.9;
    stopRefs.forEach((el, i) => {
        if (el && !visible[i] && el.offsetLeft - travelled < limit) visible[i] = true;
    });
};

const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
    });
};

let resizeObserver = null;

onMounted(async () => {
    await nextTick();
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(trackRef.value);
    }
    // Fonts/images can change card sizes after first paint
    window.addEventListener('load', measure);
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measure);
    window.removeEventListener('load', measure);
    if (resizeObserver) resizeObserver.disconnect();
    if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.experience {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    padding: 50px 0 0;
}

.pin-outer {
    position: relative;
    width: 100%;
}

.pin-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 24px;
    /* Past the hero the desktop navbar is only a small pill in the corner, so the timeline can sit
       centred, right under the section heading (phones/tablets clear their top bar below) */
    padding-top: 20px;
    overflow: hidden;
    /* no mask-image fade here: a mask makes this a "backdrop root", so the cards' liquid glass could only
       see the (empty) inside of this box and lost the 3D background bending through it */
}

.pin-footer {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0 32px;
    padding: 12px 22px;
    border-radius: 999px;
    overflow: hidden;
    cursor: pointer;
    touch-action: pan-y; /* horizontal drags scrub the bar instead of being eaten by the browser */
    user-select: none;
    font-family: var(--poppins);
    /* glass pill */
    background: linear-gradient(160deg, color-mix(in srgb, white 10%, transparent), color-mix(in srgb, white 3%, transparent));
    -webkit-backdrop-filter: blur(10px) saturate(1.6);
    backdrop-filter: blur(10px) saturate(1.6);
    border: 1px solid color-mix(in srgb, white 18%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent), inset 0 -1px 0 color-mix(in srgb, white 8%, transparent), 0 8px 24px rgba(0, 0, 0, 0.2);
    transition: scale 0.4s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.pin-footer:active {
    scale: 0.985;
}

.pin-footer > * {
    position: relative;
    margin: 0;
    pointer-events: none;
}

.ripple {
    position: absolute !important;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px !important;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0 40%, transparent 70%);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.22);
    animation: footer-ripple 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}

@keyframes footer-ripple {
    from { transform: scale(0); opacity: 0.6; }
    to { transform: scale(16); opacity: 0; }
}

.pin-count {
    font-size: var(--XS);
    color: var(--light);
    font-variant-numeric: tabular-nums;
}

.pin-hint {
    font-size: var(--XS);
    white-space: nowrap;
    color: var(--gray-light);
    transition: opacity 0.4s ease;
}

.pin-hint.hidden {
    opacity: 0;
}

.track-viewport {
    position: relative;
    width: 100%;
    /* don't let the long track widen the page; clip sideways only so tall cards are never cut */
    contain: inline-size;
    overflow-x: clip;
    overflow-y: visible;
}

.track {
    position: relative;
    display: flex;
    align-items: stretch;
    gap: 40px;
    padding: 0 20px;
    width: max-content;
    will-change: transform;
    /* Cards sit above / below the line, so the track is 2x card height */
    height: min(760px, calc(100svh - 190px));
}

.timeline-line {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 5px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

.stop {
    position: relative;
    width: 440px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    z-index: 2;
}

.card-wrap {
    position: absolute;
    left: 0;
    right: 0;
    padding: 20px;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.6s ease, transform 0.6s ease !important;
}

.stop.up .card-wrap {
    bottom: calc(50% + 34px);
    transform: translateY(-20px);
}

.stop.down .card-wrap {
    top: calc(50% + 34px);
    transform: translateY(20px);
}

.stop.visible .card-wrap {
    opacity: 1;
    transform: translateY(0);
}

.card-wrap :deep(.exp-card) {
    max-width: 100%;
}

/* cursor light, as on the project cards */
.card-wrap::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    pointer-events: none;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.1), transparent 40%);
    opacity: 0;
    transition: opacity 0.5s ease !important;
}

.card-wrap:hover::before {
    opacity: 1;
}

.emblem {
    position: absolute;
    left: 20px;
    top: 50%;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 3;
    transition: background 0.4s ease !important;
}

.stop.visible .emblem {
    background: var(--light);
}

.tl-progress {
    flex: 1;
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--light) 12%, transparent);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.35);
    overflow: hidden;
}

.tl-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, color-mix(in srgb, var(--accent, var(--light)) 70%, transparent), var(--accent, var(--light)));
    box-shadow: 0 0 10px color-mix(in srgb, var(--accent, var(--light)) 60%, transparent), inset 0 1px 0 color-mix(in srgb, white 45%, transparent);
    transform-origin: left center;
    transition: none !important;
}

/* Phones / tablets: clear the mobile top bar */
@media screen and (max-width: 1000px) {
    .pin-sticky {
        padding-top: 80px;
    }
}

/* Tablet */
@media screen and (max-width: 968px) {
    .stop {
        width: 340px;
    }
}

/* Mobile: one card per screen, all cards below the line */
@media screen and (max-width: 768px) {
    .pin-sticky {
        gap: 16px;
        padding-top: 80px;
    }

    .pin-footer {
        margin: 0 16px;
        padding: 10px 16px;
    }

    .track {
        gap: 24px;
        height: min(520px, calc(100svh - 150px));
    }

    .timeline-line {
        top: 40px;
    }

    .stop {
        width: 80vw;
    }

    .emblem {
        top: 40px;
    }

    .stop.up .card-wrap,
    .stop.down .card-wrap {
        top: 74px;
        bottom: auto;
    }

    .card-wrap {
        padding: 16px;
    }
}

</style>
