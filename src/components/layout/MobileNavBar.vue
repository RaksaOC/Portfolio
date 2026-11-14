<template>
  <!--
    Two glass pills (logo + menu). They read as one bar until the visitor scrolls past Home, then split
    apart; tapping the logo pill merges them back (the glass flows together), scrolling on splits again.
    While merged, the logo pill's glass stretches under the menu button (whose own glass hides), so there is
    only ever one glass edge and no seam between the halves.
  -->
  <div class="mobile-nav" :class="{ shown, split, jelly }">
    <div class="mobile-nav-wrapper">
      <a href="#welcome" class="m-pill logo-pill logo-text" :aria-expanded="!split" @click="onLogo">
        <span class="m-glass" aria-hidden="true"></span>
        <span class="m-label">{{ $t('nav.brand') }}</span>
      </a>
      <!-- AI chat (src/components/ChatBot.vue) -->
      <button type="button" class="m-pill chat-pill icon-btn" :class="{ on: chat.open }" :aria-label="$t('chat.open')"
        :aria-expanded="chat.open" @click="chat.open = !chat.open">
        <span class="m-glass" aria-hidden="true"></span>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5C12.6 7.6 16.4 11.4 21.5 12 16.4 12.6 12.6 16.4 12 21.5 11.4 16.4 7.6 12.6 2.5 12 7.6 11.4 11.4 7.6 12 2.5z" />
        </svg>
      </button>
      <button type="button" class="m-pill menu-pill icon-btn menu-btn" :aria-label="$t('nav.menu')"
        aria-controls="mobile-menu" :aria-expanded="open" @click="open = true">
        <span class="m-glass" aria-hidden="true"></span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Full-screen glass menu -->
  <Transition name="menu">
    <div v-if="open" id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" data-lenis-prevent
      :aria-label="$t('nav.menu')">
      <div class="menu-head">
        <a href="#welcome" class="logo-text" @click="open = false">{{ $t('nav.brand') }}</a>
        <div class="menu-actions">
          <SettingsGear class="menu-gear" />
          <button ref="closeRef" type="button" class="icon-btn close-btn" :aria-label="$t('settings.close')"
            @click="open = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
      <ul class="nav-links">
        <li v-for="(l, i) in LINKS" :key="l" :style="{ '--i': i }">
          <a :href="`#${l}`" @click="open = false">{{ $t(`nav.${l}`) }}</a>
        </li>
      </ul>
    </div>
  </Transition>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import SettingsGear from './SettingsGear.vue';
import { lenis } from '../../core/lenis';
import { chat } from '../../core/chat/chat';

const LINKS = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];

const shown = ref(false);
const open = ref(false);
const closeRef = ref(null);

const pastHero = ref(false);
const merged = ref(false); // visitor tapped the logo pill
let mergedAt = 0;
const split = computed(() => pastHero.value && !merged.value);

const onScroll = () => {
  const y = window.scrollY;
  shown.value = y > 200;
  const hero = document.getElementById('home');
  pastHero.value = y > (hero ? hero.getBoundingClientRect().bottom + y : 900) - 100;
  if (merged.value && Math.abs(y - mergedAt) > 220) merged.value = false;
};

const onLogo = (e) => {
  if (split.value) {
    e.preventDefault();
    merged.value = true;
    mergedAt = window.scrollY;
  }
};

// little jelly wobble whenever the pills split / merge
const jelly = ref(false);
let jellyTimer = 0;
watch(split, () => {
  jelly.value = false;
  clearTimeout(jellyTimer);
  requestAnimationFrame(() => {
    jelly.value = true;
    jellyTimer = setTimeout(() => { jelly.value = false; }, 800);
  });
});
const onKey = (e) => { if (e.key === 'Escape') open.value = false; };

watch(open, async (isOpen) => {
  if (isOpen) {
    lenis.stop();
    window.addEventListener('keydown', onKey);
    await nextTick();
    closeRef.value?.focus();
  } else {
    lenis.start();
    window.removeEventListener('keydown', onKey);
  }
});

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('keydown', onKey);
});
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  top: 5px;
  left: 0;
  width: 100%;
  z-index: 999;
  display: none;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50px);
  transition: opacity 0.3s ease, transform 0.3s ease !important;
}

.mobile-nav.shown {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.mobile-nav-wrapper {
  --spring: cubic-bezier(0.34, 1.45, 0.45, 1);
  position: relative;
  flex: 1;
  display: flex;
  align-items: stretch;
  margin: 10px 20px;
  gap: 0;
  transition: gap 0.6s var(--spring) !important;
}

.m-pill {
  position: relative;
  display: flex;
  align-items: center;
  height: 58px;
  border: 0;
  background: transparent;
  transition: flex-grow 0.6s var(--spring), border-radius 0.6s var(--spring) !important;
}

/* The glass itself lives on .m-glass layers (styled by the glass rule in themes/shared/base.css) so it can cross-fade */
.m-glass {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: rgba(119, 118, 118, 0.1);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.m-label,
.m-pill svg {
  position: relative;
}

.logo-pill {
  flex: 1 1 auto;
  padding: 0 22px;
  border-radius: 40px 0 0 40px;
}

.chat-pill {
  flex: 0 0 52px;
  width: 52px !important;
  height: 58px !important;
  border-radius: 0 !important;
  display: grid !important;
  color: var(--accent, var(--light)) !important;
}

.chat-pill > .m-glass {
  opacity: 0;
  border-radius: 50%;
  transition: opacity 0.15s ease !important;
}

.split .chat-pill {
  flex-basis: 58px;
  width: 58px !important;
  margin-left: auto;
  border-radius: 50% !important;
}

.split .chat-pill > .m-glass {
  opacity: 1;
  transition: opacity 0.25s ease 0.12s !important;
}

.menu-pill {
  flex: 0 0 58px;
  width: 58px !important;
  height: 58px !important;
  border-radius: 0 40px 40px 0 !important;
  display: grid !important;
}

/* Merged: the logo pill's glass reaches across the menu button (58px), the menu's own glass fades out.
   Split: it springs back to the logo pill and the menu button gets its own glass circle again. */
.logo-pill > .m-glass {
  right: -110px; /* across the chat (52px) and menu (58px) buttons */
  border-radius: 40px;
  transition: right 0.6s var(--spring) !important;
}

.menu-pill > .m-glass {
  opacity: 0;
  border-radius: 50%;
  transition: opacity 0.15s ease !important;
}

.split .logo-pill > .m-glass {
  right: 0;
}

.split .menu-pill > .m-glass {
  opacity: 1;
  transition: opacity 0.25s ease 0.12s !important;
}

.split .mobile-nav-wrapper {
  gap: 10px;
  justify-content: space-between;
}

.split .logo-pill {
  flex-grow: 0;
  border-radius: 40px;
}

.split .menu-pill {
  border-radius: 50% !important;
}

.jelly .m-pill {
  animation: pill-jelly 0.75s var(--spring) both;
}

@keyframes pill-jelly {
  0% { scale: 1 1; }
  25% { scale: 1.06 0.9; }
  45% { scale: 0.96 1.06; }
  65% { scale: 1.02 0.98; }
  100% { scale: 1 1; }
}

.logo-text {
  font-family: var(--poppins);
  font-size: var(--M);
  margin: 0;
  color: var(--light);
  text-decoration: none;
  white-space: nowrap;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid transparent;
  background: transparent;
  color: var(--light);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease !important;
}

.icon-btn svg {
  width: 24px;
  height: 24px;
  pointer-events: none;
}

/* no hover fill on the bar's menu button: it showed the seam between the pills */
.icon-btn:not(.m-pill):hover,
.icon-btn:not(.m-pill):focus-visible {
  border-color: color-mix(in srgb, var(--light) 25%, transparent);
  background: color-mix(in srgb, var(--light) 8%, transparent);
}

/* ---------- Full-screen menu: liquid glass, tinted by the theme ---------- */
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 32px;
  overflow-y: auto;
  overscroll-behavior: contain;
  color: var(--light);
  font-family: var(--poppins);
  background:
    radial-gradient(120% 70% at 10% 0%, color-mix(in srgb, white 10%, transparent), transparent 55%),
    radial-gradient(100% 70% at 100% 100%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%),
    color-mix(in srgb, var(--dark) 45%, transparent);
  /* -webkit- first: Chrome treats it as an alias, so the url() version must come last */
  -webkit-backdrop-filter: blur(14px) saturate(1.6);
  backdrop-filter: var(--lg-url, url(#liquid-glass)) blur(9px) saturate(1.6) brightness(1.05);
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent),
    inset 0 0 120px color-mix(in srgb, white 6%, transparent);
}

.menu-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 2px 2px 8px;
}

.menu-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* settings + close: a matching pair of round glass buttons */
.menu-actions .menu-gear,
.close-btn {
  width: 40px;
  height: 40px;
  border: 1px solid color-mix(in srgb, var(--light) 25%, transparent);
  background: color-mix(in srgb, var(--light) 6%, transparent);
  -webkit-backdrop-filter: blur(10px) saturate(1.6);
  backdrop-filter: blur(10px) saturate(1.6);
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 22%, transparent);
  transition: background 0.2s ease, border-color 0.2s ease !important;
}

.menu-actions .menu-gear:hover,
.menu-actions .menu-gear:focus-visible {
  border-color: color-mix(in srgb, var(--accent, var(--light)) 55%, transparent);
  background: color-mix(in srgb, var(--accent, var(--light)) 12%, transparent);
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  margin: 0;
  padding: 24px 8px;
  list-style: none;
}

.nav-links li {
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, white 14%, transparent);
  background: linear-gradient(160deg, color-mix(in srgb, white 9%, transparent), color-mix(in srgb, white 2%, transparent));
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 22%, transparent);
}

.nav-links a {
  display: block;
  padding: 16px 22px;
  color: var(--light);
  font-size: var(--M);
  text-decoration: none;
  text-align: center;
}

.nav-links a:active {
  color: var(--accent);
}

/* open / close */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.3s ease !important;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

.menu-enter-active .nav-links li {
  animation: menu-item 0.45s cubic-bezier(0.34, 1.3, 0.5, 1) both;
  animation-delay: calc(var(--i) * 45ms + 60ms);
}

@keyframes menu-item {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
}

@media screen and (max-width: 1000px) {
  .mobile-nav {
    display: flex;
  }
}
</style>
