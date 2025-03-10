<script setup>
import {ref, provide, onMounted} from 'vue'
import Background from './components/Background.vue'
import Welcome from './pages/Welcome.vue'
import NavBar from './components/NavBar.vue'
import Hero from './pages/Hero.vue'
import About from './pages/About.vue'
import Skills from './pages/Skills.vue'
import Projects from './pages/Projects.vue'
import Contact from './pages/Contact.vue'
import Footer from './pages/Footer.vue'
import PlaceHolder from './pages/PlaceHolder.vue'

const theme = ref(localStorage.getItem('theme') || 'dark'); // Default to dark theme

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme.value);
  localStorage.setItem('theme', theme.value);
};

// Apply theme when app loads
onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value);
});

// Provide theme and toggle function to all components
provide('theme', theme);
provide('toggleTheme', toggleTheme);


// Slow down scrolling
import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.5, // Slows down scroll
  smooth: true,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)


</script>

<template>
  <Background />
  <Welcome lName="Ory" fName="Chanraksa" />
  <NavBar />
  <div class="content">
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Contact />
    <Footer />
  </div>
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
  overflow: hidden;
}
</style>
