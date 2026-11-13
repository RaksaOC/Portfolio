import { createApp } from "vue";
import "./global.css";
import "./looks.css";
import App from "./App.vue";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS CSS
import { i18n } from "./i18n";
import "./vendor/liquidglass/components.js"; // registers <lg-switch> etc.
import "./gfx"; // graphics settings -> glass CSS variables
import { initGlassTap } from "./glassTap";

const app = createApp(App);
app.use(i18n);
app.mount("#app");
initGlassTap();

const isMobile = window.innerWidth <= 768;

AOS.init({
  duration: isMobile ? 1200 : 800,
  easing: isMobile ? "ease-in-out-back" : "ease-in-out-sine",
  once: isMobile,
  mirror: false,
});
