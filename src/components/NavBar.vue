<!-- NavBar.vue -->
<template>
    <ul class="nav-bar" ref="navBar">
        <div class="logo">
            <p class="logo-text">ChanRaksa</p>
        </div>
        <div class="links-theme">
            <div class="links">
                <a href="#home">
                    <li class="nav-link">Home</li>
                </a>
                <a href="#about">
                    <li class="nav-link">About</li>
                </a>
                <a href="#skills">
                    <li class="nav-link">Skills</li>
                </a>
                <a href="#projects">
                    <li class="nav-link">Projects</li>
                </a>
                <a href="#contact">
                    <li class="nav-link">Contact</li>
                </a>
            </div>
            <div class="theme">
                <img src="../assets/dark-icon.png" alt="darkTheme">
                <div class="switch">
                    <input type="checkbox" id="checkboxInput">
                    <label for="checkboxInput" class="toggleSwitch"></label>
                </div>
                <img src="../assets/light-icon.png" alt="lightTheme">
            </div>
        </div>
    </ul>
</template>


<script setup>
import { ref, onMounted } from 'vue';
const navBar = ref(null);
onMounted(() => {
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const welcomePageHeight = 200;
        if (navBar.value) {
            if (scrollY > welcomePageHeight) {
                navBar.value.style.opacity = '1';
                navBar.value.style.transform = 'translateY(0)'
            }
            else {
                navBar.value.style.opacity = '0';
                navBar.value.style.transform = 'translateY(-50px)'
            }
        }
    })
})

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
}

.theme img {
    width: 20px;
}

/* From Uiverse.io by vinodjangid07 */
/* To hide the checkbox */
#checkboxInput {
    display: none;
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
    box-shadow: 5px 2px 7px rgba(8, 8, 8, 0.26);
    border: 5px solid rgb(0, 0, 0);
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