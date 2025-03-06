<template>
    <div class="about">
        <AboutBackground/>
        <h1>About Us</h1>
        <p>This is the about page of our portfolio.</p>
    </div>
</template>

<script>
import AboutBackground from '../components/AboutBackground.vue';

export default {
  name: 'About',
  // 2. Register the imported component.
  components: {
    AboutBackground, // Now Vue.js knows where to find the component.
  },
};

</script>

<style scoped>

.about {
    position: relative;
    padding: 20px;
    height: 100vh;
    display: flex;
}

.about h1 {
    font-size: 2em;
    margin-bottom: 10px;
    color: white;
}

.about p {
    font-size: 1.2em;
}
</style>