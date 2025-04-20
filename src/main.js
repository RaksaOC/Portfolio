import {createApp} from "vue";
import "./global.css";
import App from "./App.vue";
import {onMounted} from "vue";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS CSS

createApp(App).mount("#app");

const isMobile = window.innerWidth <= 768;

AOS.init({
    duration: isMobile ? 1200 : 800,
    easing: isMobile ? "ease-in-out-back" : "ease-in-out-sine",
    once: isMobile,
    mirror: false
});


