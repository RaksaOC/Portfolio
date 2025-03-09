import { createApp } from "vue";
import "./global.css";
import App from "./App.vue";
import { onMounted } from "vue";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS CSS

createApp(App).mount("#app");

AOS.init({
  duration: 1000, // Adjust timing
  easing: "ease-in-out", // Smooth effect
  once: false, // Keep animations on scroll
//   offset: 400, // Adjust when animations start
});

