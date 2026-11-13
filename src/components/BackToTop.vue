<template>
    <!--
        Glass "back to top" circle, bottom left. Only past the hero; it springs away while the visitor
        scrolls up and pops back once scrolling pauses. Hidden while the Experience timeline is pinned
        (its progress bar sits along the bottom).
    -->
    <button type="button" class="to-top" :class="{ shown }" :aria-label="$t('nav.top')" :data-tip="$t('nav.top')"
        data-tip-side="right" :tabindex="shown ? 0 : -1"
        @click="toTop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="M6 15l6-6 6 6" />
        </svg>
    </button>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { lenis } from '../lenis';

const pastHero = ref(false);
const goingUp = ref(false);
const inPin = ref(false);
const shown = computed(() => pastHero.value && !goingUp.value && !inPin.value);

let lastY = 0;
let idle = 0;
const onScroll = () => {
    const y = window.scrollY;
    const hero = document.getElementById('home');
    pastHero.value = y > (hero ? hero.getBoundingClientRect().bottom + y : 900);
    // hide while moving up; back once the upward scroll has paused (smooth-scroll's tiny tail doesn't count)
    if (y < lastY - 2) {
        goingUp.value = true;
        clearTimeout(idle);
        idle = setTimeout(() => { goingUp.value = false; }, 350);
    }
    lastY = y;
    const pin = document.querySelector('.pin-outer')?.getBoundingClientRect();
    inPin.value = !!pin && pin.top <= 1 && pin.bottom >= window.innerHeight - 1;
};

const toTop = () => lenis.scrollTo(0, { duration: 1.6 });

onMounted(() => {
    lastY = window.scrollY;
    onScroll();
    goingUp.value = false;
    window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => {
    clearTimeout(idle);
    window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.to-top {
    position: fixed;
    left: 24px;
    bottom: 24px;
    z-index: 900;
    width: var(--fab);
    height: var(--fab);
    display: grid;
    place-items: center;
    padding: 0;
    border-radius: 50%;
    color: var(--light);
    cursor: pointer;
    /* glass (the looks.css glass rule upgrades it to liquid glass) */
    background: color-mix(in srgb, var(--light) 6%, transparent);
    -webkit-backdrop-filter: blur(6px) saturate(160%);
    backdrop-filter: blur(6px) saturate(160%);
    border: 1px solid color-mix(in srgb, white 22%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent), 0 8px 22px rgba(0, 0, 0, 0.25);
    /* hidden: sunk a little and shrunk */
    opacity: 0;
    pointer-events: none;
    translate: 0 24px;
    scale: 0.6;
    transition: opacity 0.25s ease, translate 0.35s ease, scale 0.35s ease !important;
}

.to-top.shown {
    opacity: 1;
    pointer-events: auto;
    translate: 0 0;
    scale: 1;
    /* springy pop back in */
    transition: opacity 0.3s ease, translate 0.6s cubic-bezier(0.34, 1.6, 0.5, 1), scale 0.6s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.to-top svg {
    width: 28px;
    height: 28px;
    transition: translate 0.3s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.to-top:hover svg {
    translate: 0 -2px;
}

.to-top:hover {
    border-color: color-mix(in srgb, var(--accent, white) 55%, transparent);
}

.to-top:focus-visible {
    outline: 2px solid var(--accent, white);
    outline-offset: 3px;
}

@media screen and (max-width: 638px) {
    .to-top {
        left: 18px;
        bottom: 18px;
        width: 48px;
        height: 48px;
    }
}
</style>
