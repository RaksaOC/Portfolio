<template>
    <div class="about">
        <AboutBackground />
        <div class="about-content" id="about">
            <div class="about-me" ref="aboutMeCard">
                <p class="about-me-head">About Me</p>
                <br>
                <div class="about-me-desc">
                    <p><span>1</span> Hey there! 👋 I’m a tech enthusiast and creative thinker who loves building cool
                        stuff. 💻</p>
                    <p><span>2</span> Always learning, always experimenting—whether it's coding, design, or something
                        new. 🤖</p>
                    <p><span>3</span> When I’m not at my desk, I’m probably lost in a sci-fi movie 🎬 or planning my
                        next trip 🌍.</p>
                </div>
            </div>

            <div class="hobby-location">
                <div class="hobby" ref="hobbyCard">
                    <p class="hobby-head">Hobbies</p>
                    <br>
                    <div class="hobby-desc">
                        <p><span>1</span> Coding, of course! 🖥️</p>
                        <p><span>2</span> Photography—capturing moments, one shot at a time 📸.</p>
                        <p><span>3</span> Hiking in nature 🌲 and getting lost in new places 🗺️.</p>
                        <p><span>4</span> Gaming 🎮—because why not, right?</p>
                    </div>
                </div>
                <div class="location" ref="locationCard">
                    <p class="location-head">Where Am I?</p>
                    <br>
                    <div class="location-desc">
                        <p><span>1</span> Based in the heart of the city 🌆.</p>
                        <p><span>2</span> Always exploring new spots around the world 🌍.</p>
                        <p><span>3</span> Currently, you can find me coding away in my cozy home office 🏠💻.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AboutBackground from '../components/AboutBackground.vue';

export default {
    name: 'About',
    components: {
        AboutBackground,
    },
    setup() {
        const aboutMeCard = ref(null);
        const hobbyCard = ref(null);
        const locationCard = ref(null);

        onMounted(() => {
            const cards = [aboutMeCard.value, hobbyCard.value, locationCard.value];

            const handleOnMouseMove = (e) => {
                const { currentTarget: target } = e;
                const rect = target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                target.style.setProperty("--mouse-x", `${x}px`);
                target.style.setProperty("--mouse-y", `${y}px`);
            };

            cards.forEach(card => {
                if (card) {
                    card.addEventListener("mousemove", handleOnMouseMove);
                }
            });
        });

        return {
            aboutMeCard,
            hobbyCard,
            locationCard,
        };
    }
};
</script>


<style scoped>

#about{
    scroll-margin-top: 300px;
}
.about {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    z-index: 1;
    width: 100%;
    min-height: 100vh;
}

.about-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    bottom: 0;
    gap: 20px;
    font-family: var(--poppins);
    color: var(--light);
    font-size: var(--L);
    /* flex-wrap: wrap; */
}

.about-me {
    height: 100%;
    width: 50%;
    justify-content: start;
}

.hobby-location {
    width: 50%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    gap: 20px;
    height: 100%;
}

.hobby {
    width: 100%;
    height: 50%;
}

.location {
    width: 100%;
    height: 50%;
}

.about-me,
.hobby,
.location {
    border-radius: 5px;
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
    /* Soft shadow */
    display: flex;
    /* justify-content: center; */
    flex-direction: column;
    align-items: center;
    padding: 20px;
    position: relative;
}

.about-me:hover::before,
.hobby:hover::before,
.location:hover::before {
    opacity: 1;
    cursor: crosshair;
}


.about-me::before,
.hobby::before,
.location::before {
    background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.1),
            transparent 40%);
    content: "";
    height: 100%;
    width: 100%;
    border-radius: inherit;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
    opacity: 0;
    transition: opacity 500ms;
}

span{
    color: var(--gray-light);
}

.about-me-desc,
.hobby-desc,
.location-desc {
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-size: var(--S);
    padding: 10px;
    width: 100%;
}

@media screen and (max-width: 1200px) {
    /* .about{
        min-height: 100vh;
    } */
    .about-content {
        flex-wrap: wrap;
    }

    .about-me,
    .hobby,
    .location,
    .hobby-location {
        width: 90vw;
    }
}

@media screen and (max-width: 628px) {
    .about-content{
        /* top: calc(100vh); */
    }

}
</style>