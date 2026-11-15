<template>
  <div class="skills" id="skills">
    <SectionIcon icon="skills" :title="$t('nav.skills')" />

    <!-- Pinned scroll (same mechanics as Experience). Settings → Scroll style (src/core/scrollStyle.js):
         flat / curved = a sideways track of glass panels; ribbon = a flexing 3D glass loop that turns. -->
    <div class="pin-outer" ref="outerRef" :style="{ height: outerHeight + 'px' }">
      <div class="pin-sticky" ref="stickyRef" :class="{ 'is-ribbon': ribbon }">

        <!-- Ribbon: one continuous loop of flexible glass with the groups printed on it (WebGL, see
             SkillRibbon.vue). Falls back to the flat track where WebGL isn't available. -->
        <div v-if="ribbon" class="ribbon-stage" ref="viewportRef">
          <div ref="trackRef">
            <SkillRibbon :groups="skillGroups" :progress="progress" @seek="seek" @unsupported="noWebGL = true" />
          </div>
        </div>

        <!-- Flat / curved -->
        <div v-else class="track-viewport" ref="viewportRef">
          <div class="track" ref="trackRef" :style="{ transform: `translate3d(${-translate}px, 0, 0)` }">
            <section v-for="(group, index) in skillGroups" :key="group.key" class="group skill-card edge-shell"
              :class="{ visible: visible[index] }" :ref="el => (groupRefs[index] = el)" @pointermove="onPanelMove">
              <div class="group-body edge-fade">
                <SkillGroup :group="group" :index="index" />
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import SkillGroup from '../components/cards/SkillGroup.vue';
import SkillRibbon from '../components/cards/SkillRibbon.vue';
import SectionIcon from '../components/common/SectionIcon.vue';
import { usePinnedScroll } from '../core/pinScroll';
import { scrollStyle } from '../core/scrollStyle';
import { skillGroups } from '../data/skills';

// the list lives in src/data/skills.js, group titles in src/i18n/*.js → skills.groups

const N = skillGroups.length;
const noWebGL = ref(false);
const ribbon = computed(() => scrollStyle.value === 'ribbon' && !noWebGL.value);
const STEP = 420; // ribbon: px of scrolling per group

/* ---------- Flat / curved: panels fade in as they arrive ---------- */
const groupRefs = [];
const visible = reactive(skillGroups.map((_, i) => i === 0));

const reveal = (travelled, rect) => {
  if (ribbon.value) return;
  const viewport = viewportRef.value;
  if (!viewport) return;
  if (rect.top > window.innerHeight * 0.6) return;
  const limit = viewport.clientWidth * 0.95;
  groupRefs.forEach((el, i) => {
    if (el && !visible[i] && el.offsetLeft - travelled < limit) visible[i] = true;
  });
};

const { outerRef, stickyRef, viewportRef, trackRef, outerHeight, translate, progress, seek, measure } =
  usePinnedScroll({
    onUpdate: reveal,
    curve: () => scrollStyle.value === 'curved',
    getDistance: () => (ribbon.value ? (N - 1) * STEP : null),
  });

watch(ribbon, () => measure());

// Light that follows the cursor across a panel (same as the experience / project cards)
const onPanelMove = (e) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
  el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
};
</script>

<style scoped>
.skills {
  width: 100%;
  font-family: var(--poppins);
  color: var(--light);
  position: relative;
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
  gap: 28px;
  padding-top: 20px;
  overflow: hidden;
}

/* ================= Flat / curved ================= */

.track-viewport {
  position: relative;
  width: 100%;
  contain: inline-size;
  overflow-x: clip;
  overflow-y: visible;
}

.track {
  display: flex;
  align-items: stretch;
  gap: 28px;
  padding: 12px 32px;
  width: max-content;
  will-change: transform;
}

/* One glass panel per group. .skill-card is listed with the other cards in src/themes, so every look
   restyles it (liquid glass, cyberpunk ribbons + chamfers, HUD corners, …) and src/core/glassTap.js gives
   it the tap ripple + bounce. This is the plain fallback, same as the experience cards. */
.group {
  position: relative;
  display: flex;
  padding: 22px 26px 26px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  opacity: 0;
  /* reveal uses `translate`: `transform` is the edge curve (.edge-shell in global.css) */
  translate: 0 24px;
  /* opacity also follows the edge fade (--edge-o) while scrolling, so keep it short */
  transition: opacity 0.3s ease, translate 0.6s ease !important;
}

.group.visible {
  opacity: var(--edge-o, 1);
  translate: 0 0;
}

.group-body {
  flex: 1;
}

.group::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.1), transparent 40%);
  opacity: 0;
  transition: opacity 0.5s ease !important;
}

.group:hover::before {
  opacity: 1;
}

/* ================= Ribbon ================= */

/* the ribbon's canvas is wider than the content column: don't clip it */
.pin-sticky.is-ribbon {
  overflow: visible;
  gap: 0;
}

.ribbon-stage {
  position: relative;
  width: 100%;
}


@media screen and (max-width: 1000px) {
  .pin-sticky {
    padding-top: 80px;
  }
}

/* phones: the ribbon stands upright (SkillRibbon.vue) and gets the whole screen height; the drum's ends
   pass under the floating nav */
@media screen and (max-width: 699px) {
  .pin-sticky.is-ribbon {
    padding-top: 0;
  }
}

@media screen and (max-width: 768px) {
  .pin-sticky {
    gap: 16px;
  }

  .track {
    gap: 16px;
    padding: 12px 16px;
  }

  .group {
    padding: 18px 18px 20px;
  }

}

</style>
