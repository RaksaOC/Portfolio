<template>
    <!--
        Theme music control (src/core/music.js). Appears once the navbar has slid in; gone entirely while
        "Play music" is switched off in Settings.
        Desktop: lives in the bottom-right corner dock (CornerDock.vue, `docked`); clicking the speaker mutes.
        On hover a separate glass pill floats out to the left of the dock with the volume slider and, under
        it, the song that's playing and its artist (the CC BY attribution for the music, see src/core/music.js).
        Phones: on its own bottom-right, tap to mute, no slider.
    -->
    <Transition name="music-btn">
        <div v-if="visible" ref="rootRef" class="music-ctl" :class="{ open: hover && open, docked }" role="group"
            :aria-label="$t('music.panel')" @pointerenter="enter" @pointerleave="leave" @focusin="enter"
            @focusout="onFocusOut">
            <button type="button" class="music-toggle" :class="{ playing: audible && music.playing }"
                :aria-pressed="!music.muted" :aria-label="label" :title="music.title ? `♪ ${music.title}` : null"
                @click.stop="toggleMuted()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
                    <template v-if="audible">
                        <path class="wave w1" d="M15.5 9.2a4 4 0 0 1 0 5.6" />
                        <path v-if="music.volume > 0.45" class="wave w2" d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
                    </template>
                    <path v-else d="M16 9.5l5 5M21 9.5l-5 5" />
                </svg>
            </button>
            <div v-if="hover" class="music-vol" :aria-hidden="!open" @pointerdown="dragging = true">
                <div class="music-vol-inner">
                    <lg-slider class="vol-slider" min="0" max="100" step="1" :value="Math.round(volume * 100)"
                        :tabindex="open ? 0 : -1" :aria-label="$t('music.volume')" @input="onVolume"></lg-slider>
                    <component :is="credit.href ? 'a' : 'span'" v-if="docked && track" class="music-now"
                        :href="credit.href || undefined" :target="credit.href ? '_blank' : undefined"
                        :rel="credit.href ? 'noopener' : undefined" :tabindex="credit.href && open ? 0 : -1"
                        :title="credit.note || undefined">
                        ♪ {{ track }}<template v-if="credit.artist"> — {{ credit.artist }}</template>
                    </component>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { music, toggleMuted, setVolume, trackFor, creditFor } from '../../core/music';
import { intro, ui, prefs } from '../../core/prefs';

const props = defineProps({ docked: Boolean });
const { t } = useI18n();

// in the dock, the dock decides when it's shown
const visible = computed(() => props.docked || (!intro.running && music.enabled && ui.navShown));
const audible = computed(() => !music.muted && music.volume > 0);
const volume = computed(() => (music.muted ? 0 : music.volume));
const track = computed(() => trackFor(prefs.look).title || '');
const credit = computed(() => creditFor(prefs.look));
const label = computed(() => (music.muted ? t('music.unmute') : t('music.mute')));

// the slider only exists on desktop pointers (phones: no volume)
const mq = typeof matchMedia === 'function' ? matchMedia('(min-width: 1001px) and (hover: hover)') : null;
const hover = ref(!!mq?.matches);
const onMq = (e) => { hover.value = e.matches; };

const rootRef = ref(null);
const open = ref(false);
const dragging = ref(false); // stay open while the slider is dragged past the pill's edge
let closeTimer = 0;
const enter = () => { clearTimeout(closeTimer); open.value = true; };
const leave = () => {
    if (dragging.value) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { open.value = false; }, 300);
};
const onFocusOut = (e) => { if (!rootRef.value?.contains(e.relatedTarget)) leave(); };
const onUp = (e) => {
    if (!dragging.value) return;
    dragging.value = false;
    if (!rootRef.value?.contains(e.target)) leave();
};

const onVolume = (e) => setVolume(Number(e.target.value) / 100);

onMounted(() => {
    mq?.addEventListener?.('change', onMq);
    window.addEventListener('pointerup', onUp);
});
onBeforeUnmount(() => {
    clearTimeout(closeTimer);
    mq?.removeEventListener?.('change', onMq);
    window.removeEventListener('pointerup', onUp);
});
</script>

<style scoped>
/* The glass pill: just the circle when closed, stretches left to fit the slider when open */
.music-ctl {
    position: fixed;
    top: 20px;
    right: 24px;
    z-index: 900;
    display: flex;
    align-items: center;
    height: var(--fab);
    border-radius: calc(var(--fab) / 2);
    color: var(--light);
    /* glass (the themes/shared/base.css glass rule upgrades it to liquid glass) */
    background: color-mix(in srgb, var(--light) 6%, transparent);
    -webkit-backdrop-filter: blur(6px) saturate(160%);
    backdrop-filter: blur(6px) saturate(160%);
    border: 1px solid color-mix(in srgb, white 22%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent), 0 8px 22px rgba(0, 0, 0, 0.25);
    transition: right 0.32s cubic-bezier(0.4, 0, 0.2, 1), scale 0.35s cubic-bezier(0.34, 1.6, 0.5, 1),
        border-color 0.2s ease !important;
}

/* inside the corner dock: no fixed position of its own; the speaker stays put in the dock and the slider
   is a detached glass pill floating out to the left of the dock (with the song under it) */
.music-ctl.docked {
    position: relative;
    top: auto;
    right: auto;
    z-index: auto;
}

.music-ctl.docked .music-vol {
    position: absolute;
    right: calc(100% + 7px + 14px); /* past the capsule's padding, then a gap */
    top: 50%;
    display: block;
    overflow: visible;
    padding: 12px 24px 9px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--light) 6%, transparent);
    -webkit-backdrop-filter: blur(8px) saturate(170%);
    backdrop-filter: var(--lg-url, url(#liquid-glass)) blur(8px) saturate(170%) brightness(1.06);
    border: 1px solid color-mix(in srgb, var(--accent, white) 40%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent), 0 12px 30px rgba(0, 0, 0, 0.3);
    opacity: 0;
    translate: 16px -50%;
    scale: 0.9;
    transform-origin: 100% 50%;
    pointer-events: none;
    transition: opacity 0.15s ease, translate 0.3s ease, scale 0.3s ease !important;
}

.music-ctl.docked.open .music-vol {
    opacity: 1;
    translate: 0 -50%;
    scale: 1;
    pointer-events: auto;
    transition: opacity 0.25s ease, translate 0.5s cubic-bezier(0.34, 1.5, 0.5, 1), scale 0.5s cubic-bezier(0.34, 1.5, 0.5, 1) !important;
}

.music-ctl.docked .music-vol-inner,
.music-ctl.docked.open .music-vol-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 0;
    opacity: 1;
    transform: none;
}

.music-now {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--poppins);
    font-size: 0.6875rem;
    line-height: 1.3;
    color: var(--light);
    opacity: 0.7;
    text-decoration: none;
}

a.music-now:hover {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 2px;
}

.music-ctl:not(.open):hover {
    scale: 1.05;
}

/* :root bumps it past the theme's glass border rule */
:root .music-ctl:hover,
:root .music-ctl.open {
    border-color: color-mix(in srgb, var(--accent, white) 55%, transparent) !important;
}

/* slider area: width springs open from 0 (same trick as the navbar's links) */
.music-vol {
    display: grid;
    grid-template-columns: 0fr;
    min-width: 0;
    overflow: hidden;
    transition: grid-template-columns 0.55s var(--spring, cubic-bezier(0.34, 1.4, 0.5, 1)) !important;
}

.music-ctl.open .music-vol {
    grid-template-columns: 1fr;
}

.music-vol-inner {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 0;
    opacity: 0;
    transform: translateX(-10px);
    transition: opacity 0.15s ease, transform 0.3s ease, padding-right 0.55s ease !important;
}

.music-ctl.open .music-vol-inner {
    padding-right: 26px;
    opacity: 1;
    transform: none;
    transition: opacity 0.3s ease 0.12s, transform 0.5s cubic-bezier(0.34, 1.4, 0.5, 1) 0.08s, padding-right 0.55s ease !important;
}

lg-slider.vol-slider {
    width: 160px;
    flex-shrink: 0;
    --lg-accent: var(--accent, var(--light));
    --lg-track: color-mix(in srgb, var(--light) 18%, transparent);
    --lg-focus: var(--accent);
}

.music-toggle {
    flex-shrink: 0;
    width: calc(var(--fab) - 2px);
    height: calc(var(--fab) - 2px);
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: scale 0.3s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.music-toggle:active {
    scale: 0.9;
}

.music-toggle:focus-visible {
    outline: 2px solid var(--accent, white);
    outline-offset: -4px;
}

.music-toggle svg {
    width: 26px;
    height: 26px;
    overflow: visible;
}

.wave {
    transform-box: view-box;
    transform-origin: 12px 12px;
}

.playing .w1 {
    animation: wave 1.6s ease-in-out infinite;
}

.playing .w2 {
    animation: wave 1.6s ease-in-out 0.25s infinite;
}

/* not playing yet (waiting for the first click): waves dimmed */
.music-toggle:not(.playing) .wave {
    opacity: 0.45;
}

@keyframes wave {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

/* ---------- appear / disappear ---------- */
.music-btn-enter-active {
    transition: opacity 0.3s ease, scale 0.6s cubic-bezier(0.34, 1.6, 0.5, 1), translate 0.6s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.music-btn-leave-active {
    transition: opacity 0.2s ease, scale 0.25s ease, translate 0.25s ease !important;
}

.music-btn-enter-from,
.music-btn-leave-to {
    opacity: 0;
    scale: 0.5;
    translate: 0 -12px;
}

@media (prefers-reduced-motion: reduce) {
    .playing .wave { animation: none; }
}

@media screen and (max-width: 1000px) {
    .music-ctl {
        top: auto;
        right: 18px;
        bottom: 18px;
        height: 48px;
        border-radius: 24px;
    }

    .music-toggle {
        width: 46px;
        height: 46px;
    }

    .music-toggle svg {
        width: 22px;
        height: 22px;
    }

    .music-btn-enter-from,
    .music-btn-leave-to {
        translate: 0 12px;
    }
}
</style>
