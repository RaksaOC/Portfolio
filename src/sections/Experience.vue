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
                        <div class="timeline-line edge-fade"></div>
                        <div v-for="(exp, index) in experiences" :key="index" class="stop"
                            :class="[index % 2 === 0 ? 'up' : 'down', { visible: visible[index] }]"
                            :ref="el => (stopRefs[index] = el)">
                            <div class="card-wrap edge-shell" @pointermove="onCardMove">
                                <ExpCard class="edge-fade" :place="exp.place" :role="exp.role" :desc="exp.desc"
                                    :duration="exp.duration" />
                            </div>
                            <div class="emblem edge-shell"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import SectionIcon from '../components/common/SectionIcon.vue';
import ExpCard from '../components/cards/ExpCard.vue';
import { usePinnedScroll } from '../core/pinScroll';
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

const stopRefs = [];
const visible = reactive(EXPERIENCE_KEYS.map((_, i) => i === 0));

// Reveal cards as they slide into view (positions computed from the new translate,
// since the DOM transform is only applied on the next render)
const reveal = (travelled, rect) => {
    const viewport = viewportRef.value;
    if (!viewport || rect.top > window.innerHeight * 0.6) return;
    const limit = viewport.clientWidth * 0.9;
    stopRefs.forEach((el, i) => {
        if (el && !visible[i] && el.offsetLeft - travelled < limit) visible[i] = true;
    });
};

// The timeline runs the full screen width. Cards are sharp inside the page's 1000px column and turn
// ghostly and soft-focus the further they drift out of it, then fade off at the screen edge.
const { outerRef, stickyRef, viewportRef, trackRef, outerHeight, translate } =
    usePinnedScroll({ onUpdate: reveal, curve: () => false, focus: 1000 });



// Light that follows the cursor across a card (same effect as the project cards)
const onCardMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
};
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
    /* the track runs wider than the page column (full screen width): clip only vertically */
    overflow-x: visible;
    overflow-y: clip;
    /* no mask-image fade here: a mask makes this a "backdrop root", so the cards' liquid glass could only
       see the (empty) inside of this box and lost the 3D background bending through it */
}

.track-viewport {
    position: relative;
    /* full screen width, centred on the page column */
    width: 100vw;
    margin-left: calc(50% - 50vw);
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
    /* first / last card line up with the page column; the rest of the screen width is the soft zone */
    padding: 0 max(20px, calc(50vw - 480px));
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
    /* no backdrop-filter: it would stop the edge-fade mask working (and a 5px blur isn't visible here) */
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
    /* opacity also follows the edge fade (--edge-o) while scrolling, so keep it short; the reveal uses
       `translate`, since `transform` is the edge curve (.edge-shell in global.css) */
    transition: opacity 0.3s ease, translate 0.6s ease !important;
}

.stop.up .card-wrap {
    bottom: calc(50% + 34px);
    translate: 0 -20px;
}

.stop.down .card-wrap {
    top: calc(50% + 34px);
    translate: 0 20px;
}

.stop.visible .card-wrap {
    opacity: var(--edge-o, 1);
    translate: 0 0;
}

.card-wrap :deep(.exp-card) {
    max-width: 100%;
    /* soft focus outside the page column (--edge-blur from src/core/pinScroll.js) */
    filter: blur(var(--edge-blur, 0px));
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
    translate: 0 -50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 3;
    opacity: var(--edge-o, 1);
    transition: background 0.4s ease !important;
}

.stop.visible .emblem {
    background: var(--light);
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
