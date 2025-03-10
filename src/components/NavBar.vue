<template>
    <ul class="nav-bar" ref="navBar">
        <div class="logo">
            <p class="logo-text">ChanRaksa</p>
        </div>
        <div class="links-theme">
            <div class="links">
                <a href="#home" class="nav-link">Home</a>
                <a href="#about" class="nav-link">About</a>
                <a href="#skills" class="nav-link">Skills</a>
                <a href="#projects" class="nav-link">Projects</a>
                <a href="#contact" class="nav-link">Contact</a>
            </div>
            <div class="theme">
                <img src="../assets/dark-icon.png" alt="darkTheme">
                <div class="switch">
                    <input type="checkbox" id="checkboxInput" @click="toggleTheme">
                    <span class="toggleSwitch"></span>
                </div>
                <img src="../assets/light-icon.png" alt="lightTheme">
            </div>
        </div>
    </ul>
    <MobileNavBar class="mobile-nav" />
</template>


<script setup>
import { ref, onMounted } from 'vue';
import MobileNavBar from './MobileNavBar.vue';

const navBar = ref(null);
const theme = ref(localStorage.getItem("theme") || "dark");  // Default to dark if no saved theme

// Function to toggle between light and dark
const isLight = ref(true);
const toggleTheme = () => {
    isLight.value = !isLight.value;
    if (isLight.value) {
        theme.value = "dark";
    }
    else {
        theme.value = "light";
    }
    document.documentElement.setAttribute("data-theme", theme.value);  // Update the theme on the root element
    localStorage.setItem("theme", theme.value);  // Save the selected theme
    console.log("theme switched to:", theme.value);
};

onMounted(() => {
    // Ensure the theme is set correctly on page load
    document.documentElement.setAttribute("data-theme", theme.value);  // Apply saved theme from localStorage
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const welcomePageHeight = 200;

        const nav = navBar.value;

        if (navBar.value) {
            if (scrollY > welcomePageHeight) {
                nav.style.opacity = '1';
                nav.style.transform = 'translateY(0)';
            } else {
                nav.style.opacity = '0';
                nav.style.transform = 'translateY(-50px)';
            }
        }
    });
});
</script>




<style scoped>
.nav-bar {
    max-width: 1200px;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 200px;
    border-radius: 60px;
    background-color: var(--gray-dark);
    padding: 30px 30px;
    position: fixed;
    top: 20px;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform: translateY(-50px);
    z-index: 100;

    /* Glassmorphism Effect */
    background: rgba(255, 255, 255, 0.1);
    /* Light transparent background */
    backdrop-filter: blur(5px);
    /* Blurry effect */
    -webkit-backdrop-filter: blur(5px);
    /* Safari support */
    border: 1px solid rgba(255, 255, 255, 0.2);
    /* Subtle border */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.links-theme {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    align-items: center;
}

.links {
    display: flex;
    gap: 30px;
    color: white;
    font-family: var(--poppins);
}

.links a {
    color: var(--light);
    text-decoration: none;
    font-size: var(--S);
    position: relative;
}

.links a:before {
    content: "";
    position: absolute;
    bottom: -5px;
    height: 2px;
    width: 100%;
    background: var(--gray-light);
    border-radius: 50px;
    transform: scaleX(0);
    transition: transform 0.2s linear;
}

.links a:hover::before {
    transform: scaleX(1);
}

.theme {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-text {
    color: var(--light);
    font-size: var(--M);
    font-family: var(--poppins);
    user-select: none;
}

.theme img {
    width: 20px;
}

/* From Uiverse.io by vinodjangid07 */
/* To hide the checkbox */
.switch {
    position: relative;
}

#checkboxInput {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    z-index: 100;
}

.toggleSwitch {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 50px;
    height: 30px;
    background-color: rgb(82, 82, 82);
    border-radius: 20px;
    cursor: pointer;
    transition-duration: .2s;
}

.toggleSwitch::after {
    content: "";
    position: absolute;
    height: 10px;
    width: 10px;
    left: 5px;
    background-color: transparent;
    border-radius: 50%;
    transition-duration: .2s;
    box-shadow: 5px 2px 7px rgba(123, 123, 123, 0.26);
    border: 5px solid var(--dark);
}

#checkboxInput:checked+.toggleSwitch::after {
    transform: translateX(100%);
    transition-duration: .2s;
    background-color: var(--light);
}

/* Switch background change */
#checkboxInput:checked+.toggleSwitch {
    background-color: var(--light);
    transition-duration: .2s;
}

.mobile-nav {
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform: translateY(-50px);
    pointer-events: none;
}


@media screen and (max-width: 1000px) {
    .mobile-nav {
        display: flex;
    }

    .nav-bar {
        display: none;
    }
}
</style>
