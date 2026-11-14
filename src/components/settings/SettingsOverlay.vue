<template>
    <Transition name="settings">
        <div v-if="ui.settingsOpen" id="settings-overlay" class="settings-overlay" role="dialog" aria-modal="true" data-lenis-prevent
            :aria-label="$t('settings.title')" @click.self="close">
            <div class="settings-inner" @click.self="close">
                <header class="s-head">
                    <h2>{{ $t('settings.title') }}</h2>
                    <button ref="closeRef" type="button" class="s-close" :aria-label="$t('settings.close')"
                        @click="close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </header>

                <!-- Switches -->
                <section class="s-section s-rows">
                    <div class="s-row">
                        <span class="s-row-label">{{ $t('settings.language') }}</span>
                        <div class="s-switch-wrap">
                            <span class="s-side" :class="{ on: !isKm }">
                                <!-- United Kingdom -->
                                <svg class="s-flag" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"
                                    aria-hidden="true">
                                    <clipPath id="uk-t">
                                        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                                    </clipPath>
                                    <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
                                    <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-t)" stroke="#C8102E"
                                        stroke-width="4" />
                                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
                                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6" />
                                </svg>
                                EN
                            </span>
                            <!-- Liquid-glass switch (src/vendor/liquidglass): the thumb turns to glass while pressed -->
                            <lg-switch :checked="isKm" :aria-label="$t('settings.language')"
                                @change="setLocale($event.target.checked ? 'km' : 'en')"></lg-switch>
                            <span class="s-side" :class="{ on: isKm }" lang="km">
                                ខ្មែរ
                                <!-- Cambodia -->
                                <svg class="s-flag" viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice"
                                    aria-hidden="true">
                                    <rect width="60" height="40" fill="#032EA1" />
                                    <rect y="10" width="60" height="20" fill="#E00025" />
                                    <g fill="#fff">
                                        <rect x="17" y="26" width="26" height="2.2" />
                                        <rect x="19" y="22" width="22" height="4" />
                                        <path d="M30 12.5 L32.2 17 V22 H27.8 V17 Z" />
                                        <path d="M23.5 16 L25.3 19 V22 H21.7 V19 Z" />
                                        <path d="M36.5 16 L38.3 19 V22 H34.7 V19 Z" />
                                    </g>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div class="s-row">
                        <span class="s-row-label">{{ $t('settings.appearance') }}</span>
                        <div class="s-switch-wrap">
                            <span class="s-side" :class="{ on: theme === 'dark' }">
                                <svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
                                </svg>
                                {{ $t('settings.dark') }}
                            </span>
                            <lg-switch :checked="theme === 'light'" :aria-label="$t('settings.appearance')"
                                @change="setTheme($event.target.checked ? 'light' : 'dark')"></lg-switch>
                            <span class="s-side" :class="{ on: theme === 'light' }">
                                {{ $t('settings.light') }}
                                <svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="4" />
                                    <path
                                        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </section>

                <!-- Theme -->
                <section class="s-section">
                    <h3>{{ $t('settings.look') }}</h3>
                    <!-- two centred groups: the featured scenes on top, the rest below -->
                    <div v-for="g in LOOK_GROUPS" :key="g.key" class="s-look-group" :class="`g-${g.key}`">
                        <h4 class="s-group-label">{{ $t(`settings.${g.key}`) }}</h4>
                        <div class="s-looks">
                            <button v-for="l in g.looks" :key="l.id" type="button" class="s-look"
                                :aria-pressed="prefs.look === l.id" @click="prefs.look = l.id">
                                <span class="s-sw" aria-hidden="true">
                                    <i v-for="(c, i) in l.sw[theme]" :key="i" :style="{ background: c }"></i>
                                </span>
                                <b :style="{ fontFamily: nameFontCss(l, locale) }">{{ lookName(l, locale) }}</b>
                            </button>
                        </div>
                    </div>
                    <div class="s-row s-row-gap">
                        <span class="s-row-label">{{ $t('settings.random') }}</span>
                        <lg-switch :checked="randomLook" :aria-label="$t('settings.random')"
                            @change="setRandomLook($event.target.checked)"></lg-switch>
                    </div>
                    <!-- theme music on/off (src/core/music.js); the only way back once it's switched off -->
                    <div class="s-row s-row-gap">
                        <span class="s-row-label">{{ $t('music.play') }}</span>
                        <lg-switch :checked="music.enabled" :aria-label="$t('music.play')"
                            @change="setEnabled($event.target.checked)"></lg-switch>
                    </div>
                </section>

                <!-- Graphics: 3-step preset, or Advanced for every knob -->
                <section class="s-section">
                    <div class="s-section-head">
                        <h3>{{ $t('settings.graphics') }}</h3>
                        <label class="s-adv">
                            <span>{{ $t('settings.advanced') }}</span>
                            <lg-switch :checked="gfx.advanced" :aria-label="$t('settings.advanced')"
                                @change="setAdvanced($event.target.checked)"></lg-switch>
                        </label>
                    </div>
                    <div class="s-row s-gfx" :class="{ off: gfx.advanced }">
                        <lg-slider class="s-slider" min="0" max="2" step="1" :value="levelIdx"
                            :disabled="gfx.advanced || null" :aria-label="$t('settings.graphics')"
                            @input="gfx.level = LEVELS[Number($event.target.value)]"></lg-slider>
                        <div class="s-levels">
                            <button v-for="lv in LEVELS" :key="lv" type="button" class="s-level"
                                :aria-pressed="!gfx.advanced && gfx.level === lv" :disabled="gfx.advanced"
                                @click="gfx.level = lv">{{ $t(`settings.${lv}`) }}</button>
                        </div>
                    </div>

                    <Transition name="adv">
                        <div v-if="gfx.advanced" class="s-adv-panel">
                            <h4>{{ $t('settings.glass') }}</h4>
                            <div class="s-row" :class="{ off: !canRefract }">
                                <span class="s-row-label">{{ $t('settings.refraction') }}</span>
                                <lg-switch :checked="gfx.custom.refraction && canRefract" :disabled="!canRefract || null"
                                    :aria-label="$t('settings.refraction')"
                                    @change="gfx.custom.refraction = $event.target.checked"></lg-switch>
                            </div>
                            <div v-for="k in GLASS_KNOBS" :key="k.key" class="s-row s-knob"
                                :class="{ off: k.needsRefraction && !(gfx.custom.refraction && canRefract) }">
                                <span class="s-row-label">{{ $t(`settings.${k.key}`) }}</span>
                                <output>{{ k.fmt(gfx.custom[k.key]) }}</output>
                                <lg-slider class="s-slider" :min="k.min" :max="k.max" :step="k.step"
                                    :value="gfx.custom[k.key]" :aria-label="$t(`settings.${k.key}`)"
                                    :disabled="(k.needsRefraction && !(gfx.custom.refraction && canRefract)) || null"
                                    @input="gfx.custom[k.key] = Number($event.target.value)"></lg-slider>
                            </div>

                            <h4>{{ $t('settings.scene') }}</h4>
                            <div class="s-row s-knob">
                                <span class="s-row-label">{{ $t('settings.resolution') }}</span>
                                <output>{{ gfx.custom.resolution }}×</output>
                                <lg-slider class="s-slider" min="0.5" max="2" step="0.25"
                                    :value="gfx.custom.resolution" :aria-label="$t('settings.resolution')"
                                    @input="gfx.custom.resolution = Number($event.target.value)"></lg-slider>
                            </div>
                            <div class="s-row s-knob">
                                <span class="s-row-label">{{ $t('settings.fps') }}</span>
                                <output>{{ gfx.custom.fps || $t('settings.fpsMax') }}</output>
                                <lg-slider class="s-slider" min="0" max="2" step="1" :value="FPS.indexOf(gfx.custom.fps)"
                                    :aria-label="$t('settings.fps')"
                                    @input="gfx.custom.fps = FPS[Number($event.target.value)]"></lg-slider>
                            </div>
                            <div class="s-row">
                                <span class="s-row-label">{{ $t('settings.models') }}</span>
                                <lg-switch :checked="gfx.custom.models" :aria-label="$t('settings.models')"
                                    @change="gfx.custom.models = $event.target.checked"></lg-switch>
                            </div>
                            <div class="s-row">
                                <span class="s-row-label">{{ $t('settings.lite') }}</span>
                                <lg-switch :checked="gfx.custom.lite" :aria-label="$t('settings.lite')"
                                    @change="gfx.custom.lite = $event.target.checked"></lg-switch>
                            </div>
                        </div>
                    </Transition>
                </section>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale } from '../../i18n';
import { prefs, ui, theme, setTheme, randomLook, setRandomLook } from '../../core/prefs';
import { gfx, LEVELS, setAdvanced, canRefract } from '../../core/gfx';
import { music, setEnabled } from '../../core/music';
import { lenis } from '../../core/lenis';
import { LOOKS, FEATURED_LOOKS, OTHER_LOOKS, lookName } from '../../themes';
import { loadDisplayFonts, loadKhmerDisplayFonts, nameFontCss } from '../../themes/fonts';
const LOOK_GROUPS = [{ key: 'featured', looks: FEATURED_LOOKS }, { key: 'moreThemes', looks: OTHER_LOOKS }];

const { locale } = useI18n();
const isKm = computed(() => locale.value === 'km');
const closeRef = ref(null);

const levelIdx = computed(() => LEVELS.indexOf(gfx.level));
const FPS = [30, 60, 0]; // 0 = the display's own rate
const GLASS_KNOBS = [
    { key: 'strength', min: 0, max: 100, step: 1, needsRefraction: true, fmt: (v) => Math.round(v) },
    { key: 'aberration', min: 0, max: 1, step: 0.05, needsRefraction: true, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'blur', min: 0, max: 12, step: 0.5, fmt: (v) => `${v}px` },
    { key: 'edge', min: 0, max: 0.3, step: 0.01, fmt: (v) => `${Math.round((v / 0.3) * 100)}%` },
];

// each theme tile shows its name in that theme's heading font (Khmer face in Khmer)
const loadTileFonts = () => {
    if (locale.value === 'km') loadKhmerDisplayFonts('km-tile-fonts');
    else loadDisplayFonts(LOOKS.map((l) => l.name).join(''), 'tile-fonts');
};
watch(locale, () => { if (ui.settingsOpen) loadTileFonts(); });

const close = () => { ui.settingsOpen = false; };
const onKey = (e) => { if (e.key === 'Escape') close(); };

watch(() => ui.settingsOpen, async (open) => {
    if (open) {
        loadTileFonts();
        lenis.stop();
        document.documentElement.classList.add('settings-open');
        window.addEventListener('keydown', onKey);
        await nextTick();
        closeRef.value?.focus();
    } else {
        lenis.start();
        document.documentElement.classList.remove('settings-open');
        window.removeEventListener('keydown', onKey);
    }
});

onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
/* Full-screen liquid glass: the SVG filter (#liquid-glass, GlassFilter.vue) bends the page behind it */
.settings-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: clamp(24px, 6vh, 72px) 16px 48px;
    background:
        radial-gradient(120% 80% at 15% 0%, color-mix(in srgb, white 10%, transparent), transparent 55%),
        radial-gradient(90% 70% at 100% 100%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%),
        color-mix(in srgb, var(--dark) 42%, transparent);
    /* -webkit- first: Chrome treats it as an alias, so the url() version must come last */
    -webkit-backdrop-filter: blur(14px) saturate(1.6);
    backdrop-filter: var(--lg-url, url(#liquid-glass)) blur(9px) saturate(1.6) brightness(1.05);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, white 14%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 30%, transparent),
        inset 0 0 120px color-mix(in srgb, white 6%, transparent);
    font-family: var(--poppins);
    color: var(--light);
    cursor: var(--cur-auto, default);
}

.settings-overlay * {
    cursor: inherit;
}

.settings-inner {
    width: min(720px, 100%);
}

.s-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.s-head h2 {
    margin: 0;
    font-size: var(--L);
    font-weight: 600;
    color: var(--accent, var(--light));
}

.s-close {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--light) 25%, transparent);
    background: color-mix(in srgb, var(--light) 6%, transparent);
    color: var(--light);
    cursor: pointer;
}

.s-close svg {
    width: 20px;
    height: 20px;
}

.s-close:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.s-section {
    padding: 22px 0;
    border-top: 1px solid color-mix(in srgb, var(--light) 14%, transparent);
}

.s-section h3 {
    margin: 0 0 14px;
    font-size: var(--XS);
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gray-light);
}

/* Glass tiles */
.s-row,
.s-look {
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, white 16%, transparent);
    background: linear-gradient(160deg, color-mix(in srgb, white 9%, transparent), color-mix(in srgb, white 2%, transparent));
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 25%, transparent), 0 8px 24px rgba(0, 0, 0, 0.18);
}

/* Switch rows */
.s-rows {
    display: grid;
    gap: 10px;
}

.s-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
}

.s-row-label {
    font-size: var(--S);
    font-weight: 500;
}

.s-switch-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
}

.s-side {
    white-space: nowrap;
    font-size: var(--XS);
    color: var(--gray-light);
    opacity: 0.6;
    transition: opacity 0.2s ease, color 0.2s ease !important;
}

.s-side.on {
    opacity: 1;
    color: var(--light);
    font-weight: 600;
}

.s-side {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.s-flag {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px color-mix(in srgb, white 50%, transparent);
}

.s-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

/* Theme the liquid-glass switch with the active look */
lg-switch {
    --lg-on: color-mix(in srgb, var(--accent) 80%, var(--dark));
    --lg-track-off: color-mix(in srgb, var(--light) 22%, transparent);
    --lg-surface: transparent;
    --lg-focus: var(--accent);
}

/* Theme tiles in two groups, each centred: Featured (12) in even rows of 4, the rest 5 per row with the
   last row centred */
.s-look-group + .s-look-group {
    margin-top: 22px;
}

.s-group-label {
    margin: 0 0 10px;
    text-align: center;
    font-size: var(--XS);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gray-light);
}

.g-featured .s-looks {
    --cols: 4;
}

.s-looks {
    --cols: 5;
    --gap: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--gap);
}

.s-looks .s-look {
    flex: 0 0 calc((100% - (var(--cols) - 1) * var(--gap)) / var(--cols));
    min-width: 0;
}

.s-row-gap {
    margin-top: 14px;
}

/* Graphics */
.s-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}

.s-section-head h3 {
    margin: 0;
}

.s-adv {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: var(--XS);
    color: var(--gray-light);
    cursor: pointer;
}

.s-gfx {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 16px 18px 12px;
    transition: opacity 0.3s ease !important;
}

.s-gfx.off,
.s-knob.off,
.s-row.off {
    opacity: 0.4;
}

lg-slider.s-slider {
    width: 100%;
    --lg-accent: var(--accent, var(--light));
    --lg-track: color-mix(in srgb, var(--light) 18%, transparent);
    --lg-focus: var(--accent);
}

lg-slider[disabled] {
    pointer-events: none;
}

.s-levels {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.s-level {
    padding: 4px 0;
    border: 0;
    background: none;
    color: var(--gray-light);
    font: inherit;
    font-size: var(--XS);
    cursor: pointer;
    border-radius: 8px;
}

.s-level:nth-child(1) {
    text-align: left;
}

.s-level:nth-child(3) {
    text-align: right;
}

.s-level[aria-pressed="true"] {
    color: var(--accent, var(--light));
    font-weight: 600;
}

.s-level:disabled {
    cursor: default;
}

.s-adv-panel {
    display: grid;
    gap: 10px;
    margin-top: 10px;
}

.s-adv-panel h4 {
    margin: 10px 0 0;
    font-size: var(--XS);
    font-weight: 500;
    color: var(--gray-light);
}

.s-knob {
    display: grid;
    grid-template-columns: 1fr auto;
    row-gap: 2px;
    transition: opacity 0.3s ease !important;
}

.s-knob lg-slider {
    grid-column: 1 / -1;
}

.s-knob output {
    font-size: var(--XS);
    font-variant-numeric: tabular-nums;
    color: var(--accent, var(--light));
}

.adv-enter-active,
.adv-leave-active {
    transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.3, 0.5, 1) !important;
}

.adv-enter-from,
.adv-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.s-look {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 18px 12px;
    color: var(--light);
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease !important;
}

.s-look:hover {
    transform: translateY(-2px);
    background: linear-gradient(160deg, color-mix(in srgb, white 14%, transparent), color-mix(in srgb, white 4%, transparent));
}

.s-look[aria-pressed="true"] {
    border-color: var(--accent);
    background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 24%, transparent), color-mix(in srgb, var(--accent) 6%, transparent));
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 25%, transparent), var(--glow, none), 0 8px 24px rgba(0, 0, 0, 0.18);
}

.s-look b {
    font-size: var(--S);
    font-weight: 600;
    font-synthesis: none; /* single-weight faces stay crisp, not faux-bold */
}

.s-sw {
    display: flex;
    justify-content: center;
}

.s-sw i {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--light) 35%, transparent);
    margin-left: -6px;
}

.s-sw i:first-child {
    margin-left: 0;
}

/* Open / close transition */
.settings-enter-active,
.settings-leave-active {
    transition: opacity 0.3s ease !important;
}

.settings-enter-active .settings-inner,
.settings-leave-active .settings-inner {
    transition: transform 0.3s ease, opacity 0.3s ease !important;
}

.settings-enter-from,
.settings-leave-to {
    opacity: 0;
}

.settings-enter-from .settings-inner,
.settings-leave-to .settings-inner {
    transform: translateY(16px) scale(0.98);
    opacity: 0;
}

@media screen and (max-width: 760px) {
    .s-looks,
    .g-featured .s-looks {
        --cols: 3;
    }
}

/* Phone: same spot as the mobile menu behind it, so the X sits exactly over the menu's X */
@media screen and (max-width: 1000px) {
    .settings-overlay {
        padding: 22px 22px 48px;
    }

    .settings-inner {
        width: 100%;
    }

    .s-head {
        padding-left: 6px;
    }

    .s-close {
        width: 40px;
        height: 40px;
    }
}

@media screen and (max-width: 638px) {
    .s-head h2 {
        font-size: var(--M);
        line-height: 40px;
    }

    .s-row {
        padding: 12px 14px;
    }

    .s-looks {
        --gap: 8px;
    }

    .s-look {
        padding: 14px 6px;
        gap: 8px;
    }

    .s-look b {
        font-size: var(--XS);
    }
}
</style>
