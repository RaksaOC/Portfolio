import { createApp } from "vue";
import "./global.css";
import App from "./App.vue";
import { onMounted } from "vue";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS CSS

createApp(App).mount("#app");

AOS.init({
  duration: 800,
  easing: "ease-in-out",
  once: true,
  mirror: false,
  // offset: 100,
});


