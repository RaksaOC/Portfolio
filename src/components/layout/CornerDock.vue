<template>
    <!--
        Desktop corner dock, bottom-right: one button that grows into a single glass capsule on hover / keyboard
        focus, with the other buttons inside it:
          [ ^ ]   back to top     (only once you've scrolled past the hero)
          [ ♪ ]   volume          (hover it: the volume slider slides out to the left; click mutes)
          [ ✦ ]   Raksa AI        (always there, accent background; shrinks a little inside the capsule)
        The hovered button's tooltip comes out to the left of the capsule (one shared bubble that follows it).
        Steps aside while the chat's side-panel drawer is open (it covers this corner).
    -->
    <div v-if="dockDesktop && !intro.running" ref="rootRef" class="corner-dock"
        :class="{ expanded, away: chat.open && chat.view === 'overlay' }"
        @pointerenter="enter" @pointerleave="leave" @focusin="enter" @focusout="onFocusOut">
        <span class="dock-glass" aria-hidden="true"></span>
        <span class="dock-tip" :class="{ on: expanded && !!tip.text }" :style="{ top: `${tip.y}px` }"
            aria-hidden="true">{{ tip.text }}</span>

        <div class="dock-item" :class="{ gone: !pastHero }" style="--i: 2"
            @pointerenter="showTip($event, $t('nav.top'))" @pointerleave="hideTip" @focusin="showTip($event, $t('nav.top'))">
            <button type="button" class="dock-btn"
                :aria-label="$t('nav.top')" :tabindex="expanded && pastHero ? 0 : -1" @click="toTop">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M6 15l6-6 6 6" />
                </svg>
            </button>
        </div>
        <div class="dock-item" :class="{ gone: !showMusic }" style="--i: 1">
            <!-- <MusicToggle v-if="showMusic" docked /> music disabled -->
        </div>

        <button type="button" class="chat-fab" :class="{ open: chat.open }"
            @pointerenter="showTip($event, chat.open ? $t('chat.close') : $t('chat.open'))" @pointerleave="hideTip"
            @focusin="showTip($event, chat.open ? $t('chat.close') : $t('chat.open'))" @focusout="hideTip"
            :aria-label="chat.open ? $t('chat.close') : $t('chat.open')" :aria-expanded="chat.open"
            @click="chat.open = !chat.open">
            <!-- AI star; on hover two smaller stars slip out from behind it and twinkle -->
            <svg v-if="!chat.open" class="stars" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="STAR" class="fill mini mini-a" />
                <path :d="STAR" class="fill mini mini-b" />
                <path :d="STAR" class="fill main" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import MusicToggle from '../media/MusicToggle.vue';
import { chat } from '../../core/chat/chat';
import { music } from '../../core/music';
import { intro, ui } from '../../core/prefs';
import { lenis } from '../../core/lenis';
import { dockDesktop } from '../../core/corner';

// four-point sparkle star, centred on 12,12
const STAR = 'M12 2.5C12.6 7.6 16.4 11.4 21.5 12 16.4 12.6 12.6 16.4 12 21.5 11.4 16.4 7.6 12.6 2.5 12 7.6 11.4 11.4 7.6 12 2.5z';

// const showMusic = computed(() => music.enabled && ui.navShown);
const showMusic = computed(() => false); // music disabled

/* ---------- expand on hover / focus (a short grace period so crossing the gaps doesn't snap it shut) ---------- */
const rootRef = ref(null);
const expanded = ref(false);
let closeTimer = 0;
const enter = () => { clearTimeout(closeTimer); expanded.value = true; };
const leave = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { expanded.value = false; }, 260);
};
const onFocusOut = (e) => { if (!rootRef.value?.contains(e.relatedTarget)) leave(); };

/* ---------- the shared tooltip, level with whichever button is hovered ---------- */
const tip = ref({ text: '', y: 0 });
function showTip(e, text) {
    const el = e.currentTarget;
    // where its centre will be once the capsule has finished opening (items spring open, so measure later too)
    const place = () => { tip.value = { text, y: el.offsetTop + el.offsetHeight / 2 }; };
    place();
    setTimeout(place, 480);
}
const hideTip = () => { tip.value = { ...tip.value, text: '' }; };

/* ---------- back to top ---------- */
const pastHero = ref(false);
const onScroll = () => {
    const y = window.scrollY;
    const hero = document.getElementById('home');
    pastHero.value = y > (hero ? hero.getBoundingClientRect().bottom + y - innerHeight * 0.5 : 600);
};
const toTop = () => lenis.scrollTo(0, { duration: 1.6 });

onMounted(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => {
    clearTimeout(closeTimer);
    window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.corner-dock {
    --pad: 7px;
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1501;
    /* fixed width: the capsule never widens; the volume pill overflows out of it to the left */
    width: var(--fab);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    transition: opacity 0.25s ease, right 0.32s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* the chat's side drawer covers this corner and has its own close tab */
.corner-dock.away {
    opacity: 0;
    pointer-events: none;
}

/* stacked buttons: folded away (no height, shrunk into the AI button) until the dock expands */
.dock-item {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    height: 0;
    margin-bottom: 0;
    opacity: 0;
    scale: 0.5;
    translate: 0 calc(var(--fab) * 0.6);
    transform-origin: calc(100% - var(--fab) / 2) 100%;
    pointer-events: none;
    transition:
        height 0.3s ease,
        margin-bottom 0.3s ease,
        opacity 0.15s ease,
        scale 0.25s ease,
        translate 0.25s ease !important;
}

.expanded .dock-item:not(.gone) {
    height: var(--fab);
    margin-bottom: 2px;
    opacity: 1;
    scale: 1;
    translate: 0 0;
    pointer-events: auto;
    /* springs open, the one nearest the AI button first */
    transition:
        height 0.45s cubic-bezier(0.34, 1.3, 0.5, 1) calc(var(--i) * 0.04s),
        margin-bottom 0.45s cubic-bezier(0.34, 1.3, 0.5, 1) calc(var(--i) * 0.04s),
        opacity 0.25s ease calc((var(--i) - 1) * 0.07s),
        scale 0.5s cubic-bezier(0.34, 1.6, 0.5, 1) calc((var(--i) - 1) * 0.07s),
        translate 0.5s cubic-bezier(0.34, 1.6, 0.5, 1) calc((var(--i) - 1) * 0.07s) !important;
}

/* ---------- the capsule: one glass shape behind everything, hugging the AI button until it opens ---------- */
.dock-glass {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: calc(var(--fab) / 2 + var(--pad));
    background: color-mix(in srgb, var(--light) 6%, transparent);
    -webkit-backdrop-filter: blur(8px) saturate(170%);
    backdrop-filter: var(--lg-url, url(#liquid-glass)) blur(8px) saturate(170%) brightness(1.06);
    border: 1px solid color-mix(in srgb, white 24%, transparent);
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 32%, transparent),
        inset 0 0 24px color-mix(in srgb, white 6%, transparent),
        0 12px 30px rgba(0, 0, 0, 0.3);
    opacity: 0;
    scale: 0.8;
    transition: inset 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease, scale 0.4s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.expanded .dock-glass {
    inset: calc(var(--pad) * -1);
    opacity: 1;
    scale: 1;
    transition: inset 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease, scale 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

/* the tooltip bubble, out to the left of the capsule */
.dock-tip {
    position: absolute;
    right: calc(100% + var(--pad) + 14px);
    padding: 6px 14px;
    border-radius: 999px;
    white-space: nowrap;
    font-family: var(--poppins);
    font-size: var(--XS);
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--light);
    background: color-mix(in srgb, var(--dark) 55%, transparent);
    -webkit-backdrop-filter: blur(10px) saturate(1.6);
    backdrop-filter: blur(10px) saturate(1.6);
    border: 1px solid color-mix(in srgb, var(--accent, white) 45%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 25%, transparent), 0 8px 20px rgba(0, 0, 0, 0.3), var(--glow, 0 0 0 transparent);
    pointer-events: none;
    opacity: 0;
    translate: 8px -50%;
    scale: 0.85;
    transform-origin: 100% 50%;
    transition: opacity 0.15s ease, translate 0.4s cubic-bezier(0.34, 1.6, 0.5, 1), scale 0.4s cubic-bezier(0.34, 1.6, 0.5, 1),
        top 0.35s cubic-bezier(0.34, 1.3, 0.5, 1) !important;
}

.dock-tip::after {
    content: "";
    position: absolute;
    right: -6px;
    top: 50%;
    width: 10px;
    height: 10px;
    margin-top: -5px;
    background: inherit;
    border-right: 1px solid color-mix(in srgb, var(--accent, white) 45%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--accent, white) 45%, transparent);
    rotate: 45deg;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
}

.dock-tip.on {
    opacity: 1;
    translate: 0 -50%;
    scale: 1;
}

/* buttons inside the capsule: just the icon, with a soft round highlight on hover */
.dock-btn {
    width: var(--fab);
    height: var(--fab);
    flex-shrink: 0;
    display: grid;
    place-items: center;
    padding: 6px;
    border: 0;
    border-radius: 50%;
    color: var(--light);
    cursor: pointer;
    background: transparent;
    background-clip: content-box;
    transition: scale 0.35s cubic-bezier(0.34, 1.6, 0.5, 1), background-color 0.2s ease !important;
}

.dock-btn:hover {
    background-color: color-mix(in srgb, var(--light) 10%, transparent);
}

.dock-btn:focus-visible {
    outline: 2px solid var(--accent, white);
    outline-offset: 3px;
}

.dock-btn svg {
    width: 28px;
    height: 28px;
    transition: translate 0.3s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.dock-btn:hover svg {
    translate: 0 -2px;
}

/* ---------- Raksa AI: the primary button ---------- */
.chat-fab {
    width: var(--fab);
    height: var(--fab);
    flex-shrink: 0;
    display: grid;
    place-items: center;
    padding: 0;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, white 30%, transparent);
    color: var(--dark);
    background:
        radial-gradient(120% 90% at 30% 15%, color-mix(in srgb, white 35%, transparent), transparent 55%),
        var(--accent, var(--light));
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35), var(--glow, 0 0 0 transparent);
    cursor: pointer;
    /* backwards, not both: a finished entrance must not keep holding `scale`, or the hover / capsule
       shrink below would jump instead of easing */
    animation: chat-fab-in 0.6s cubic-bezier(0.34, 1.6, 0.5, 1) backwards;
    /* one soft ease-out for every size change (hover, shrinking into the capsule, growing back) and the
       open / close turn, so the button glides instead of bouncing */
    transition: scale 0.5s cubic-bezier(0.22, 1, 0.36, 1), rotate 0.5s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.chat-fab:hover {
    scale: 1.06;
}

/* inside the open capsule the AI button shrinks a little, so the glass shows around it */
.expanded .chat-fab {
    scale: 0.8;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28), var(--glow, 0 0 0 transparent);
}

.expanded .chat-fab:hover {
    scale: 0.86;
}

.chat-fab:focus-visible {
    outline: 2px solid var(--light);
    outline-offset: 3px;
}

.chat-fab.open {
    rotate: 90deg;
}

.chat-fab svg {
    width: 30px;
    height: 30px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.chat-fab.open svg {
    rotate: -90deg;
}

svg .fill {
    fill: currentColor;
    stroke: none;
}

.chat-fab .stars {
    width: 34px;
    height: 34px;
    overflow: visible;
}

.stars path {
    transform-box: fill-box;
    transform-origin: center;
}

.stars .main {
    transition: scale 0.45s cubic-bezier(0.34, 1.6, 0.5, 1), rotate 0.6s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

/* the two little stars hide behind the big one */
.stars .mini {
    opacity: 0;
    scale: 0.2;
    translate: 0 0;
    transition: opacity 0.2s ease, scale 0.45s cubic-bezier(0.34, 1.6, 0.5, 1), translate 0.45s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.chat-fab:hover .stars .main,
.chat-fab:focus-visible .stars .main {
    scale: 0.82;
    rotate: 90deg;
}

.chat-fab:hover .stars .mini,
.chat-fab:focus-visible .stars .mini {
    opacity: 0.85;
}

.chat-fab:hover .stars .mini-a,
.chat-fab:focus-visible .stars .mini-a {
    scale: 0.42;
    translate: -8px -7px;
    animation: star-twinkle 1.4s ease-in-out 0.35s infinite;
}

.chat-fab:hover .stars .mini-b,
.chat-fab:focus-visible .stars .mini-b {
    scale: 0.32;
    translate: 8px 7px;
    animation: star-twinkle 1.4s ease-in-out 0.8s infinite;
}

@keyframes star-twinkle {
    0%, 100% { opacity: 0.85; rotate: 0deg; }
    50% { opacity: 0.35; rotate: 45deg; }
}

@keyframes chat-fab-in {
    from {
        opacity: 0;
        scale: 0.4;
    }
}

@media (prefers-reduced-motion: reduce) {
    .chat-fab:hover .stars .mini { animation: none !important; }
    .chat-fab:hover .stars .main { rotate: 0deg; }
    .dock-item { translate: none !important; }
}
</style>

<style>
/* The docked volume control sits flat inside the capsule (beats the theme glass rule in themes/shared/base.css); its
   slider floats out to the left in its own glass pill (MusicToggle.vue). */
:root[data-glass] .corner-dock .music-ctl.docked {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}
:root[data-glass] .corner-dock .music-ctl.docked .music-toggle:hover {
    background: color-mix(in srgb, var(--light) 10%, transparent);
}
:root .corner-dock .music-ctl.docked {
    flex-shrink: 0;
}
</style>
