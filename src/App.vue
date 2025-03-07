<script setup>
import Welcome from './pages/Welcome.vue'
import Background from './components/Background.vue'
import NavBar from './components/NavBar.vue'
import Hero from './pages/Hero.vue'
import About from './pages/About.vue'
import Skills from './pages/Skills.vue'
import PlaceHolder from './pages/PlaceHolder.vue'


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
    <!-- <PlaceHolder /> -->
    
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
}
</style>
