<template>
    <!--
        SVG filter used by `backdrop-filter: url(#liquid-glass)` (settings overlay, and UI panels in dev builds).
        Turbulence-based displacement bends whatever is behind the element (Chromium browsers; others fall
        back to the plain blur). Red / green / blue are displaced by slightly different amounts for a touch
        of chromatic aberration.
    -->
    <svg class="glass-filter" aria-hidden="true" focusable="false" width="0" height="0">
        <filter id="liquid-glass" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="11" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" :scale="scales[0]" xChannelSelector="R" yChannelSelector="G"
                result="dispR" />
            <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feDisplacementMap in="SourceGraphic" in2="map" :scale="scales[1]" xChannelSelector="R" yChannelSelector="G"
                result="dispG" />
            <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feDisplacementMap in="SourceGraphic" in2="map" :scale="scales[2]" xChannelSelector="R" yChannelSelector="G"
                result="dispB" />
            <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feBlend in="r" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b" mode="screen" result="glass" />
            <!-- Near the viewport edge the displacement samples pixels that don't exist (transparent), which showed
                 up as a dark wavy band. Lay the bent image over the untouched backdrop so those gaps fill in. -->
            <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="glass" />
            </feMerge>
        </filter>
    </svg>
</template>

<script setup>
import { computed } from 'vue';
import { gfxActive } from '../../core/gfx';

// Graphics settings: `strength` is the green channel's displacement, red / blue are pulled apart by
// `aberration` for the colour fringing.
const scales = computed(() => {
    const { strength, aberration } = gfxActive.value;
    const spread = aberration * 10;
    return [strength - spread, strength, strength + spread].map((v) => Math.max(0, Math.round(v)));
});
</script>

<style scoped>
.glass-filter {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
}
</style>
