<script setup>
import { provide, watchEffect } from 'vue'
import Background from './components/Background.vue'
import Welcome from './pages/Welcome.vue'
import NavBar from './components/NavBar.vue'
import Hero from './pages/Hero.vue'
import About from './pages/About.vue'
import Skills from './pages/Skills.vue'
import Projects from './pages/Projects.vue'
import Experience from './pages/Experience.vue'
import Contact from './pages/Contact.vue'
import Footer from './pages/Footer.vue'
import SettingsOverlay from './components/SettingsOverlay.vue'
import BackToTop from './components/BackToTop.vue'
import ImageLightbox from './components/ImageLightbox.vue'
import ChatBot from './components/ChatBot.vue'
import MusicToggle from './components/MusicToggle.vue'
import CornerDock from './components/CornerDock.vue'
import GlassFilter from './components/GlassFilter.vue'
import './lenis.js' // smooth scrolling
import './music.js' // theme music
import { theme, setTheme, prefs, applyKmFont } from './prefs'
import { dockDesktop } from './corner'

// Light / dark mode lives in prefs.js (toggled from Settings)
provide('theme', theme);
provide('toggleTheme', () => setTheme(theme.value === 'dark' ? 'light' : 'dark'));

// Khmer fonts follow the active theme
watchEffect(() => applyKmFont(prefs.look));

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
