<template>
  <div class="projects" data-aos-delay="500">
    <SectionIcon icon="projects" :title="$t('nav.projects')" />

    <!-- Tab Navigation -->
    <!-- AOS lives on the inner pill: Vue re-renders this element's classes and would wipe AOS's "aos-animate".
         Hovering the pill (tapping it on touch screens) makes its glass drip out a drop holding the list / grid
         view switch. The drop is a sibling of the pill: glass inside the pill's backdrop-filter couldn't see the
         page. The pill's bottom border opens where the drop hangs, and the drop's outline (one path shared by
         its clip and its SVG stroke) stretches out of that stretch of border. -->
    <div class="tab-container" ref="tabsRef" :class="{ raised: ui.navCompact, nudged: ui.navDrip && !ui.navCompact, dripping: dripLined }" @focusin="openDrip"
      @focusout="onTabsBlur">
      <div class="tab-wrapper" data-aos="zoom-in-down" @pointerenter="onEnter"
        @pointerleave="onLeave" @pointerdown="onTouch">
        <div class="tab-indicator" :style="tabIndicatorStyle"></div>
        <button class="tab-button" :class="{ active: activeTab === 'featured' }" @click="setTab('featured')">
          {{ $t('projects.featured') }}
        </button>
        <button class="tab-button" :class="{ active: activeTab === 'all' }" @click="setTab('all')">
          {{ $t('projects.all') }}
        </button>
      </div>
      <div class="tab-drip-zone" :class="{ out: dripOpen, lined: dripLined }">
        <div class="tab-drip" :style="{ clipPath: `path('${dripPath} Z')` }" @pointerenter="onEnter"
          @pointerleave="onLeave">
          <button v-for="v in VIEWS" :key="v" type="button" class="view-btn" :class="{ active: view === v }"
            :aria-label="$t(`projects.${v}View`)" :aria-pressed="view === v" :tabindex="dripOpen ? 0 : -1"
            @click="setView(v)">
            <svg v-if="v === 'list'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" aria-hidden="true">
              <path d="M9 6h11M9 12h11M9 18h11" />
              <circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"
              aria-hidden="true">
              <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
              <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
              <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
              <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
            </svg>
          </button>
        </div>
        <svg class="tab-drip-edge" :width="DRIP_W" height="56" :viewBox="`0 0 ${DRIP_W} 56`" aria-hidden="true">
          <path :d="dripPath" :style="{ d: `path('${dripPath}')` }" />
        </svg>
      </div>
    </div>

    <div class="projects-wrapper" :class="{ grid: view === 'grid' }" id="projects">
      <!-- Switching tabs (or list / grid) replays a staggered entrance on every card (alternating two identical
           keyframes restarts the animation without remounting the cards, so their scroll animations keep working) -->
      <div v-for="(project, index) in displayedProjects" :key="project.number" class="card-slot"
        :style="{ '--i': Math.min(index, 8), animationName: tabSwitches ? (tabSwitches % 2 ? 'card-in-a' : 'card-in-b') : 'none' }">
        <ProjectCard :project="project" :displayNumber="index + 1" :grid="view === 'grid'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import AOS from 'aos';
import SectionIcon from '../components/common/SectionIcon.vue';
import ProjectCard from '../components/cards/ProjectCard.vue';
import { ui } from '../core/prefs';
import { projects, descKeys, featuredProjectNumbers } from '../data/projects';

const activeTab = ref('featured');
const tabSwitches = ref(0);
const setTab = (tab) => {
  if (tab === activeTab.value) return;
  activeTab.value = tab;
  tabSwitches.value++;
};
const { t } = useI18n();

/* ---------- List / grid view (remembered per visitor) ---------- */
const VIEWS = ['list', 'grid'];
const readView = () => { try { return localStorage.getItem('projectsView') === 'grid' ? 'grid' : 'list'; } catch { return 'list'; } };
const view = ref(readView());
const setView = (v) => {
  if (v === view.value) return;
  view.value = v;
  tabSwitches.value++;
  try { localStorage.setItem('projectsView', v); } catch { /* storage blocked */ }
  // cards moved: let the scroll animations re-measure where they are
  nextTick(() => AOS.refresh());
};

/* ---------- The drip under the tab pill ---------- */
// Same drop as the navbar's settings drip, widened to hold two buttons: concave shoulders (r 14), then a
// rounded bowl (corner r 28) with a flat bottom. Only y changes with k, so the CSS path() transitions.
const DRIP_W = 124;
const dripOpen = ref(false);
const dripPath = computed(() => {
  const k = dripOpen.value ? 1 : 0;
  const y = (v) => (0.5 + v * k).toFixed(2); // 0.5 = centre of the pill's 1px bottom border
  const W = DRIP_W;
  return `M0 ${y(0)} C7.73 ${y(0)} 14 ${y(6.27)} 14 ${y(14)} C14 ${y(29.46)} 26.54 ${y(42)} 42 ${y(42)} `
    + `L${W - 42} ${y(42)} C${W - 26.54} ${y(42)} ${W - 14} ${y(29.46)} ${W - 14} ${y(14)} `
    + `C${W - 14} ${y(6.27)} ${W - 7.73} ${y(0)} ${W} ${y(0)}`;
});
// the pill's border opens under the drop while it's out, and closes once the line has sprung back flat
const dripLined = ref(false);
let lineTimer = 0;
watch(dripOpen, (open) => {
  clearTimeout(lineTimer);
  if (open) dripLined.value = true;
  else lineTimer = setTimeout(() => { dripLined.value = false; }, 420);
});

let closeTimer = 0;
const openDrip = () => { clearTimeout(closeTimer); dripOpen.value = true; };
const closeDrip = (delay = 160) => {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => { dripOpen.value = false; }, delay);
};
// mouse / pen: hover. Touch has no hover (and fires pointerleave on lift), so a tap opens it and a tap
// anywhere else closes it.
const onEnter = (e) => { if (e.pointerType !== 'touch') openDrip(); };
const onLeave = (e) => { if (e.pointerType !== 'touch') closeDrip(); };
const onTouch = (e) => { if (e.pointerType === 'touch') openDrip(); };
const tabsRef = ref(null);
const onTabsBlur = (e) => { if (!tabsRef.value?.contains(e.relatedTarget)) closeDrip(0); };
const onDocDown = (e) => { if (dripOpen.value && !tabsRef.value?.contains(e.target)) closeDrip(0); };
onMounted(() => document.addEventListener('pointerdown', onDocDown, true));
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocDown, true);
  clearTimeout(closeTimer);
  clearTimeout(lineTimer);
});





const displayedProjects = computed(() => {
  const list = activeTab.value === 'featured'
    ? featuredProjectNumbers.map(n => projects.find(project => project.number === n)).filter(Boolean)
    : projects;
  return list.map(project => ({ ...project, key: descKeys[project.number], description: t(`projects.items.${descKeys[project.number]}`) }));
});

const tabIndicatorStyle = computed(() => ({
  transform: activeTab.value === 'featured' ? 'translateX(0)' : 'translateX(calc(100% + 4px))',
}));

</script>


<style>
.projects {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  scroll-margin-top: -800px;
  position: relative;
}

.tab-container {
  /* Sticky only within the Projects section (unsticks when Projects ends) */
  position: sticky;
  /* sits just below the fixed navbar (desktop bar ends at 118px, mobile bar at ~75px); when the navbar
     shrinks to its pill it rises into the free space at the top, and when the bar's settings drip grows out
     (it hangs to 172px) it steps down out of the way (.nudged) */
  top: 132px;
  z-index: 100;
  transition: top 0.7s cubic-bezier(0.34, 1.45, 0.45, 1) !important;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* room for the view drip that hangs ~43px under the pill, so it never covers the first cards */
  margin-bottom: 58px;
  margin-top: 20px;
}

@media screen and (min-width: 1001px) {
  .tab-container.raised {
    top: 26px;
  }

  .tab-container.nudged {
    top: 184px;
  }
}

@media screen and (max-width: 1000px) {
  .tab-container {
    top: 88px;
  }
}

.tab-wrapper {
  position: relative;
  /* the border is drawn by ::after (below) so it can open a gap where the drip hangs */
  border-color: transparent !important;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  padding: 4px;
  display: flex;
  gap: 4px;
  overflow: hidden;
}

/* glass rule (themes/shared/base.css) adds an inset bottom line; the border layer below replaces it */
:root[data-glass][data-theme] .tab-wrapper {
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white calc(var(--glass-edge, 0.12) * 500%), transparent),
    inset 0 0 24px color-mix(in srgb, white calc(var(--glass-edge, 0.12) * 60%), transparent),
    0 10px 30px rgba(0, 0, 0, 0.25) !important;
}

.tab-wrapper::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  border: 1px solid var(--tab-edge);
  pointer-events: none;
}

.tab-container {
  --tab-edge: color-mix(in srgb, white calc(var(--glass-edge, 0.12) * 220%), transparent);
  --drip-w: 124px;
}

.tab-container.dripping .tab-wrapper::after {
  -webkit-mask: linear-gradient(#000, #000) top / 100% calc(100% - 3px) no-repeat,
    linear-gradient(90deg, #000 calc(50% - var(--drip-w) / 2), transparent 0 calc(50% + var(--drip-w) / 2), #000 0) bottom / 100% 3px no-repeat;
  mask: linear-gradient(#000, #000) top / 100% calc(100% - 3px) no-repeat,
    linear-gradient(90deg, #000 calc(50% - var(--drip-w) / 2), transparent 0 calc(50% + var(--drip-w) / 2), #000 0) bottom / 100% 3px no-repeat;
}

/* ---------- The view drip ----------
   The zone's top sits 16px above the pill's bottom edge; at top: 14px, y = 0.5 of the path lands on the
   centre of the pill's border line. Only the drop itself takes the pointer (clip-path limits hit testing),
   so the bottom of the tab buttons stays clickable. */
.tab-drip-zone {
  position: absolute;
  top: calc(100% - 16px);
  left: 50%;
  translate: -50% 0;
  width: var(--drip-w);
  height: 72px;
  pointer-events: none;
}

.tab-drip,
.tab-drip-edge {
  position: absolute;
  top: 14px;
  left: 0;
  width: var(--drip-w);
  height: 56px;
}

.tab-drip {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding-top: 5px;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.1);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  /* eases straight back to flat on close (no overshoot up into the pill) */
  transition: clip-path 0.38s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.tab-drip-zone.out .tab-drip {
  pointer-events: auto;
  transition: clip-path 0.75s cubic-bezier(0.3, 1.7, 0.45, 1) !important;
}

:root[data-glass][data-theme] .tab-drip {
  border: 0 !important;
  box-shadow: none !important;
}

.tab-drip-edge {
  overflow: visible;
  pointer-events: none;
  opacity: 0;
}

.tab-drip-zone.lined .tab-drip-edge {
  opacity: 1;
}

.tab-drip-edge path {
  fill: none;
  stroke: var(--tab-edge);
  stroke-width: 1;
  transition: d 0.38s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.tab-drip-zone.out .tab-drip-edge path {
  transition: d 0.75s cubic-bezier(0.3, 1.7, 0.45, 1) !important;
}

.view-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  color: var(--light);
  cursor: pointer;
  opacity: 0;
  scale: 0.6;
  transition: opacity 0.15s ease, scale 0.2s ease, color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease !important;
}

.tab-drip-zone.out .view-btn {
  opacity: 0.6;
  scale: 1;
  transition: opacity 0.25s ease 0.15s, scale 0.5s cubic-bezier(0.34, 1.6, 0.5, 1) 0.1s, color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease !important;
}

.tab-drip-zone.out .view-btn:hover {
  opacity: 1;
}

.tab-drip-zone.out .view-btn.active {
  opacity: 1;
  color: var(--accent, var(--light));
  background: color-mix(in srgb, var(--accent, white) 18%, transparent);
  border-color: color-mix(in srgb, var(--accent, white) 55%, transparent);
}

.view-btn svg {
  width: 18px;
  height: 18px;
  pointer-events: none;
}

.view-btn:focus-visible {
  outline: 2px solid var(--accent, white);
  outline-offset: 1px;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 6px);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  transition: transform 0.25s ease;
  z-index: 0;
}

.tab-button {
  min-width: 180px;
  padding: 10px 30px;
  border: none;
  background: transparent;
  color: var(--light);
  font-family: var(--poppins);
  font-size: var(--S);
  cursor: pointer;
  transition: opacity 0.3s ease;
  border-radius: 50px;
  position: relative;
  z-index: 1;
  flex: 1;
}

.tab-button:not(.active) {
  opacity: 0.7;
}

.tab-button:hover {
  opacity: 1;
}

.card-slot {
  width: 100%;
  display: flex;
  justify-content: center;
  animation-duration: 0.55s;
  animation-timing-function: cubic-bezier(0.34, 1.4, 0.5, 1);
  animation-fill-mode: both;
  animation-delay: calc(var(--i) * 55ms);
}

@keyframes card-in-a {
  from {
    opacity: 0;
    translate: 0 22px;
    scale: 0.97;
  }
}

@keyframes card-in-b {
  from {
    opacity: 0;
    translate: 0 22px;
    scale: 0.97;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-slot {
    animation: none !important;
  }
}

/* Grid view: two columns of image-led tiles (ProjectCard's .grid styles) */
.projects-wrapper.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.projects-wrapper.grid .card-slot {
  height: 100%;
}

@media screen and (max-width: 638px) {
  .projects-wrapper.grid {
    gap: 12px;
  }
}

.projects-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  scroll-margin-top: 200px;
  overflow-x: visible;
}

@media screen and (max-width: 1000px) {
  .projects-wrapper {
    width: 90vw;
  }

  .tab-button {
    padding: 8px 20px;
    font-size: var(--XS);
    min-width: 140px;
  }
}
</style>