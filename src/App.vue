<script setup>
import { provide, watchEffect } from 'vue'
import Background from './components/background/Background.vue'
import Welcome from './sections/Welcome.vue'
import NavBar from './components/layout/NavBar.vue'
import Hero from './sections/Hero.vue'
import About from './sections/About.vue'
import Skills from './sections/Skills.vue'
import Projects from './sections/Projects.vue'
import Experience from './sections/Experience.vue'
import Contact from './sections/Contact.vue'
import Footer from './sections/Footer.vue'
import SettingsOverlay from './components/settings/SettingsOverlay.vue'
import BackToTop from './components/layout/BackToTop.vue'
import ImageLightbox from './components/media/ImageLightbox.vue'
import ChatBot from './components/chat/ChatBot.vue'
import MusicToggle from './components/media/MusicToggle.vue'
import CornerDock from './components/layout/CornerDock.vue'
import GlassFilter from './components/background/GlassFilter.vue'
import './core/lenis.js' // smooth scrolling
import './core/music.js' // theme music
import { theme, setTheme, prefs } from './core/prefs'
import { findLook } from './themes'
import { applyKmFont } from './themes/fonts'
import { dockDesktop } from './core/corner'

// Light / dark mode lives in prefs.js (toggled from Settings)
provide('theme', theme);
provide('toggleTheme', () => setTheme(theme.value === 'dark' ? 'light' : 'dark'));

// Khmer fonts follow the active theme
watchEffect(() => applyKmFont(findLook(prefs.look)));

// Liquid glass on the UI panels
document.documentElement.setAttribute('data-glass', '');
</script>

<template>
  <GlassFilter />
  <Background />
  <Welcome lName="Ory" fName="Chanraksa" />
  <NavBar />
  <div class="content">
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Experience />
    <Contact />
    <Footer />
  </div>
  <!-- desktop: AI, volume and back-to-top share the corner dock; smaller screens keep separate buttons -->
  <BackToTop v-if="!dockDesktop" />
  <ImageLightbox />
  <ChatBot />
  <MusicToggle v-if="!dockDesktop" />
  <CornerDock />
  <SettingsOverlay />
</template>

<style scoped>
.content {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 50vh;
  overflow: clip;
}
</style>
