<template>
    <div class="mobile-nav" ref="mobileNavRef">
        <div class="mobile-nav-wrapper" ref="barRef">
            <div class="logo">
                <p class="logo-text">
                    ChanRaksa
                </p>
            </div>
            <div class="menu" ref="menuRef">
                <img src="/menu.svg" alt="">
            </div>
        </div>
        <div class="mobile-nav-content" ref="contentRef">
            <div class="content-logo">
                <p class="logo-text">
                    ChanRaksa
                </p>
                <img src="/close.png" alt="" ref="closeRef">
            </div>
            <div class="nav-links-wrapper">
                <ul class="nav-links">
                    <a href="#home" @click="hideContent">
                        <li>Home</li>
                    </a>
                    <a href="#about" @click="hideContent">
                        <li>About</li>
                    </a>
                    <a href="#skills" @click="hideContent">
                        <li>Skills</li>
                    </a>
                    <a href="#projects" @click="hideContent">
                        <li>Projects</li>
                    </a>
                    <a href="#contact" @click="hideContent">
                        <li>Contact</li>
                    </a>
                    <div class="theme">
                        <img src="../assets/dark-icon.png" alt="darkTheme">
                        <div class="switch">
                            <input type="checkbox" id="checkboxInput" @click="toggleTheme">
                            <span class="toggleSwitch"></span>
                        </div>
                        <img src="../assets/light-icon.png" alt="lightTheme">
                    </div>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const mobileNavRef = ref(null);
const menuRef = ref(null);
const closeRef = ref(null);
const barRef = ref(null);
const contentRef = ref(null);
const hideContent = () => {
    barRef.value.style.display = "flex";
    contentRef.value.style.display = "none";
};

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
    const menu = menuRef.value;
    const bar = barRef.value;
    const close = closeRef.value;
    const content = contentRef.value;

    const showContent = () => {
        content.style.display = "flex";
        bar.style.display = "none";
    };


    menu.addEventListener("click", showContent);
    close.addEventListener("click", hideContent);

    // Scroll event
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const welcomePageHeight = 200;

        // Always access the reactive reference dynamically inside the event listener
        const mobileNav = mobileNavRef.value;
        if (mobileNav) {
            if (scrollY > welcomePageHeight) {
                mobileNav.style.opacity = '1';
                mobileNav.style.transform = 'translateY(0)';
                mobileNav.style.pointerEvents = 'auto'; // Allow interactions
            } else {
                mobileNav.style.opacity = '0';
                mobileNav.style.transform = 'translateY(-50px)';
                mobileNav.style.pointerEvents = 'none'; // Prevent interactions when hidden
            }
        }
    });
});
</script>


<style>
.mobile-nav {
    position: fixed;
    top: 0px;
    display: none;
    width: 100%;
    height: 70px;
    z-index: 70;
}

.mobile-nav-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    padding: 10px;
}

.logo-text {
    font-family: var(--poppins);
    font-size: var(--M);
    margin: 0;
    color: var(--light);
}

.menu img {
    width: 40px;
    filter: invert(100);
}

.content-logo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.content-logo img {
    width: 20px;
    filter: grayscale();
}

.mobile-nav-content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(16, 16, 16, 0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(100px);
    padding: 20px;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    z-index: 60;
}

.nav-links-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.nav-links {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-left: 20px;
    list-style: none;
    font-family: var(--poppins);
    font-size: var(--M);
}

.nav-links a {
    color: var(--light) !important;
    text-decoration: none;

}

.theme{
    display: flex;
    justify-content: space-between;
    max-width: 20%;
    gap: 10px;
}

.theme img{
    width: 30px;
}

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
</style>