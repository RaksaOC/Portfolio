<template>
    <!--
        Desktop navbar.
        - hidden on the welcome screen
        - full bar while the hero is on screen
        - past the hero it shrinks to a "ChanRaksa" pill at the top-left; clicking the pill grows it back to the
          full bar with a jelly wobble (collapses again after more scrolling, a link click or a click elsewhere)
        - every tap on the bar ripples from the tap point
        - settings: hover the bottom-middle of the full bar and the glass "drips" out a little drop holding the gear
    -->
    <nav class="nav-bar" ref="navRef" :class="{ shown, compact: isCompact, jelly, dripping: dripLined }"
        :aria-label="$t('nav.home')" @click="onNavClick" @pointerenter="navHover = true" @pointerleave="navHover = false">
        <span v-for="r in ripples" :key="r.id" class="ripple" :style="{ left: `${r.x}px`, top: `${r.y}px` }"
            aria-hidden="true"></span>
        <a href="#welcome" ref="logoRef" class="logo-text" :aria-expanded="!isCompact" @click="onLogo">{{ $t('nav.brand') }}</a>
        <div class="nav-rest" :aria-hidden="isCompact">
            <div class="nav-rest-inner">
                <div class="links" ref="linksRef">
                    <a v-for="l in LINKS" :key="l" :href="`#${l}`" class="nav-link" :tabindex="isCompact ? -1 : 0"
                        @click="collapseSoon">{{ $t(`nav.${l}`) }}</a>
                </div>
            </div>
        </div>
    </nav>
    <!-- The drip: a separate glass drop (glass can't show through from inside the bar). Its outline and its
         glass share one shape that starts as a flat line lying exactly on the bar's bottom edge: on hover the
         bar hands that stretch of its border over to the drip's line, which then bends down into the drop. -->
    <div class="drip-zone" :class="{ live: dripLive, lined: dripLined, out: dripLevel > 0, open: dripShown }"
        :style="{ top: `${dripTop}px` }" @pointerenter="dripOpen = true" @pointerleave="dripOpen = false"
        @focusin="dripOpen = true" @focusout="dripOpen = false">
        <div class="nav-drip" :style="{ clipPath: `path('${dripPath} Z')` }">
            <SettingsGear class="drip-gear" :tabindex="dripLive ? 0 : -1" />
        </div>
        <svg class="drip-edge" width="84" height="56" viewBox="0 0 84 56" aria-hidden="true">
            <path :d="dripPath" :style="{ d: `path('${dripPath}')` }" />
        </svg>
    </div>
    <MobileNavBar />
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import MobileNavBar from './MobileNavBar.vue';
import SettingsGear from './SettingsGear.vue';
import { ui } from '../../core/prefs';
import { chat } from '../../core/chat/chat';

const LINKS = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];

const navRef = ref(null);
const navHover = ref(false);
const dripOpen = ref(false);
const dripTop = ref(0);
const shown = ref(false);      // past the welcome screen
const pastHero = ref(false);   // scrolled beyond the hero section
const expanded = ref(false);   // user opened the pill
let expandedAt = 0;

// cramped: the full bar wouldn't fit beside the docked chat (or in a narrow window), so it stays a pill
// until there's room again (clicking the pill still opens it)
const cramped = ref(false);
const isCompact = computed(() => (pastHero.value || cramped.value) && !expanded.value);
// the settings drip only hangs off the full bar
const dripLive = computed(() => shown.value && !isCompact.value);
const dripShown = computed(() => dripLive.value && dripOpen.value);

// How far the drop hangs: 0 = flat on the bar's edge, a little bead while the bar is hovered, full drop
// when the bottom-middle is hovered. One path drives both the outline and the glass clip, so they match.
const dripLevel = computed(() => (!dripLive.value ? 0 : dripOpen.value ? 1 : navHover.value ? 0.2 : 0));
const dripPath = computed(() => {
    const k = dripLevel.value;
    const y = (v) => (0.5 + v * k).toFixed(2); // 0.5 = centre of the bar's 1px bottom border
    // concave shoulder, round bowl, concave shoulder (cubic quarter-circles: r 14, 28, 14)
    return `M0 ${y(0)} C7.73 ${y(0)} 14 ${y(6.27)} 14 ${y(14)} C14 ${y(29.46)} 26.54 ${y(42)} 42 ${y(42)} `
        + `C57.46 ${y(42)} 70 ${y(29.46)} 70 ${y(14)} C70 ${y(6.27)} 76.27 ${y(0)} 84 ${y(0)}`;
});
// The bar's own border opens under the drip (and the drip's line shows) while the drip is out, and closes
// again only once the line has sprung back flat, so the swap is invisible.
const dripLined = ref(false);
let lineTimer = 0;
watch(dripLevel, (k) => {
    clearTimeout(lineTimer);
    if (k > 0) dripLined.value = true;
    else lineTimer = setTimeout(() => { dripLined.value = false; }, 420);
});
watch(isCompact, (v) => { ui.navCompact = v; }, { immediate: true });
watch(shown, (v) => { ui.navShown = v; }, { immediate: true });
// the settings drip hanging out under the bar: the sticky project tabs step down out of its way
watch(dripShown, (v) => { ui.navDrip = v; }, { immediate: true });

// Jelly wobble whenever the bar changes shape, plus a ripple from where it was clicked
const jelly = ref(false);
const ripples = ref([]);
let rippleId = 0;
let jellyTimer = 0;
watch(isCompact, () => {
    jelly.value = false;
    clearTimeout(jellyTimer);
    requestAnimationFrame(() => {
        jelly.value = true;
        jellyTimer = setTimeout(() => { jelly.value = false; }, 900);
    });
});
const addRipple = (e) => {
    if (!navRef.value) return;
    const r = navRef.value.getBoundingClientRect();
    const id = ++rippleId;
    ripples.value.push({ id, x: e.clientX - r.left, y: e.clientY - r.top });
    setTimeout(() => { ripples.value = ripples.value.filter((x) => x.id !== id); }, 900);
};

const onScroll = () => {
    const y = window.scrollY;
    shown.value = y > 200;
    const hero = document.getElementById('home');
    const heroEnd = hero ? hero.getBoundingClientRect().bottom + y : 900;
    pastHero.value = y > heroEnd - 120;
    // collapse again once the visitor keeps scrolling
    if (expanded.value && Math.abs(y - expandedAt) > 260) expanded.value = false;
};

// the whole compact pill (not just the name) grows the bar back
const onNavClick = (e) => {
    addRipple(e);
    if (isCompact.value) {
        e.preventDefault();
        expanded.value = true;
        expandedAt = window.scrollY;
    }
};

const onLogo = (e) => {
    if (isCompact.value) {
        e.preventDefault();
        expanded.value = true;
        expandedAt = window.scrollY;
    }
};

const collapseSoon = () => { setTimeout(() => { expanded.value = false; }, 600); };

const onDocClick = (e) => {
    if (expanded.value && navRef.value && !navRef.value.contains(e.target)) expanded.value = false;
};

// keep the drip's hover zone hugging the bar's bottom edge (bar top is 20px)
let ro = null;
const placeDrip = () => { if (navRef.value) dripTop.value = 20 + navRef.value.offsetHeight - 16; };

// does the full bar fit? logo + gap to the links (smaller while docked, see CSS) + links + padding + margins
const logoRef = ref(null);
const linksRef = ref(null);
const docked = computed(() => chat.open && chat.view === 'dock');
const measureFit = () => {
    if (!logoRef.value || !linksRef.value) return;
    const gap = docked.value ? 40 : 200;
    const full = logoRef.value.offsetWidth + gap + linksRef.value.scrollWidth + 62;
    const room = window.innerWidth - (docked.value ? chat.dockWidth : 0) - 40;
    cramped.value = full > room;
};
watch(() => [docked.value, chat.dockWidth], measureFit);

onMounted(() => {
    placeDrip();
    ro = new ResizeObserver(() => { placeDrip(); measureFit(); });
    ro.observe(navRef.value);
    ro.observe(linksRef.value); // link labels change width with the language
    window.addEventListener('resize', measureFit);
    measureFit();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onDocClick);
});

onBeforeUnmount(() => {
    ro?.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measureFit);
    document.removeEventListener('click', onDocClick);
});
</script>

<style scoped>
.nav-bar {
    --spring: cubic-bezier(0.34, 1.45, 0.45, 1);
    position: fixed;
    top: 20px;
    left: 50%;
    z-index: 100;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    /* fixed + left:50% would otherwise shrink-wrap to half the viewport and clip the links */
    width: max-content;
    max-width: calc(100vw - 40px);
    padding: 30px;
    border-radius: 60px;
    overflow: hidden;
    font-family: var(--poppins);
    opacity: 0;
    pointer-events: none;
    translate: -50% -50px;
    background: rgba(255, 255, 255, 0.1);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition:
        opacity 0.3s ease,
        left 0.7s var(--spring),
        translate 0.7s var(--spring),
        scale 0.3s var(--spring),
        grid-template-columns 0.7s var(--spring),
        padding 0.7s var(--spring) !important;
}

.nav-bar.shown {
    opacity: 1;
    pointer-events: auto;
    translate: -50% 0;
}

/* Shrunk to the logo pill, parked top-left */
.nav-bar.compact {
    grid-template-columns: auto 0fr;
    padding: 16px 28px;
    left: 24px;
    translate: 0 0;
}

.nav-bar.compact {
    cursor: pointer;
}

.nav-bar.compact:hover {
    scale: 1.05;
}

.nav-bar.compact:active {
    scale: 0.96;
}

/* Rubber-band wobble when the bar grows / shrinks */
.nav-bar.jelly {
    animation: nav-jelly 0.85s var(--spring) both;
}

@keyframes nav-jelly {
    0% { scale: 1 1; }
    22% { scale: 1.06 0.9; }
    40% { scale: 0.96 1.07; }
    58% { scale: 1.025 0.97; }
    76% { scale: 0.99 1.015; }
    100% { scale: 1 1; }
}

/* Click ripple */
.ripple {
    position: absolute;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0 40%, transparent 70%);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.22);
    animation: nav-ripple 0.85s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}

@keyframes nav-ripple {
    from { transform: scale(0); opacity: 0.6; }
    to { transform: scale(30); opacity: 0; }
}

.nav-bar.compact .logo-text {
    cursor: pointer;
}

.logo-text {
    color: var(--light);
    font-size: var(--M);
    text-decoration: none;
    white-space: nowrap;
}

/* The rest of the bar: animates its width from 0 to its natural size */
.nav-rest {
    min-width: 0;
    overflow: hidden;
}

.nav-rest-inner {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-left: 200px;
    white-space: nowrap;
    opacity: 1;
    transform: none;
    transition: opacity 0.35s ease 0.2s, transform 0.6s var(--spring) 0.1s, padding-left 0.7s var(--spring) !important;
}

/* docked chat: less air between the logo and the links, so the full bar fits beside the panel more often */
:global(html.chat-docked) .nav-bar:not(.compact) .nav-rest-inner {
    padding-left: 40px;
}

.nav-bar.compact .nav-rest-inner {
    padding-left: 0;
    opacity: 0;
    transform: translateX(-16px);
    pointer-events: none;
    transition: opacity 0.15s ease, transform 0.3s ease, padding-left 0.7s var(--spring) !important;
}

.links {
    display: flex;
    gap: 30px;
}

.links a {
    color: var(--light);
    text-decoration: none;
    font-size: var(--S);
    position: relative;
}

.links a::before {
    content: "";
    position: absolute;
    bottom: -5px;
    height: 2px;
    width: 100%;
    background: var(--gray-light);
    border-radius: 50px;
    transform: scaleX(0);
    transition: transform 0.2s linear;
}

.links a:hover::before {
    transform: scaleX(1);
}

/* The bar's border is drawn by this layer (the glass rule's own border is made transparent in themes/shared/base.css)
   so it can open a gap where the drip hangs */
.nav-bar::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1px solid color-mix(in srgb, white calc(var(--glass-edge, 0.12) * 220%), transparent);
    pointer-events: none;
}

.nav-bar.dripping::after {
    -webkit-mask: linear-gradient(#000, #000) top / 100% calc(100% - 3px) no-repeat,
        linear-gradient(90deg, #000 calc(50% - 42px), transparent 0 calc(50% + 42px), #000 0) bottom / 100% 3px no-repeat;
    mask: linear-gradient(#000, #000) top / 100% calc(100% - 3px) no-repeat,
        linear-gradient(90deg, #000 calc(50% - 42px), transparent 0 calc(50% + 42px), #000 0) bottom / 100% 3px no-repeat;
}

/* ---------- Settings drip ---------- */
.drip-zone {
    position: fixed;
    left: 50%;
    translate: -50% 0;
    z-index: 101;
    width: 220px;
    height: 60px; /* 16px over the bar's bottom padding + the drop */
    pointer-events: none;
}

.drip-zone.live {
    pointer-events: auto;
}

/* top: 14px puts y = 0.5 of the drip on the centre of the bar's 1px bottom border */
.nav-drip,
.drip-edge {
    position: absolute;
    top: 14px;
    left: calc(50% - 42px);
    width: 84px;
    height: 56px; /* room for the spring to overshoot */
}

/* the drop morphs out with a springy overshoot; on the way back it eases straight to flat (no overshoot,
   so it never bulges up into the bar) */
.nav-drip {
    transition: clip-path 0.38s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.drip-edge path {
    transition: d 0.38s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.drip-zone.out .nav-drip {
    transition: clip-path 0.75s cubic-bezier(0.3, 1.7, 0.45, 1) !important;
}

.drip-zone.out .drip-edge path {
    transition: d 0.75s cubic-bezier(0.3, 1.7, 0.45, 1) !important;
}

.drip-edge {
    overflow: visible;
    pointer-events: none;
    opacity: 0;
}

.drip-zone.lined .drip-edge {
    opacity: 1;
}

/* same colour and 1px weight as the bar's border (.nav-bar::after) */
.drip-edge path {
    fill: none;
    stroke: color-mix(in srgb, white calc(var(--glass-edge, 0.12) * 220%), transparent);
    stroke-width: 1;
}

.drip-gear {
    position: absolute;
    left: 50%;
    top: 5px;
    translate: -50% 0;
    width: 32px !important;
    height: 32px !important;
    opacity: 0;
    transition: opacity 0.15s ease !important;
}

.drip-zone.open .drip-gear {
    opacity: 1;
    transition: opacity 0.25s ease 0.15s !important;
}

@media screen and (max-width: 1200px) {
    .nav-rest-inner {
        padding-left: 80px;
    }
}

@media screen and (max-width: 1000px) {

    .nav-bar,
    .drip-zone {
        display: none;
    }
}
</style>
