<template>
    <div class="about-section">
        <Avatar :imagePath="'/MY_PIC2.png'" />
        <div class="about-layout" id="about">
            <div class="bio-card" ref="aboutMeCard" data-aos="fade-right">
                <p class="bio-title">About Me</p>
                <br>
                <div class="bio-details">
                    <p><span>1</span> Hey! I’m a software engineer. I love to solve problems and turn ideas
                        into reality.</p>
                    <p><span>2</span> Experienced in full-stack and mobile development using modern, production-ready
                        technologies.</p>
                    <p><span>3</span> With many sophisticated projects under my belt, I value thoughtful system design,
                        performance and clean
                        architecture. </p>
                </div>
            </div>

            <div class="side-cards-wrapper">

                <div class="stats-card" ref="accoladesCard" data-aos="fade-left">
                    <p class="stats-title">Statistics</p>
                    <br>
                    <div class="stats-content">
                        <div class="stat-commits">
                            <p class="stat-label">Contributions</p>
                            <p class="stat-number">3.3K+</p>
                        </div>
                        <div class="stat-projects">
                            <p class="stat-label">Projects</p>
                            <p class="stat-number">15+</p>
                        </div>
                        <div class="stat-experience">
                            <p class="stat-label">Y.O.Exp</p>
                            <p class="stat-number">3+</p>
                        </div>
                    </div>
                </div>
                <div class="tech-card" ref="favoriteTechCard" data-aos="fade-up">
                    <p class="tech-title">Primary Technologies</p>
                    <br>
                    <div class="tech-slider-wrapper">
                        <div class="tech-slider">
                            <div v-for="(item, key) in favoriteTech" :key="key" class="tech-slider-item">
                                <img :src="item.image" :alt="key" />
                                <p>{{ key }}</p>
                            </div>
                            <!-- duplicate for seamless loop -->
                            <div v-for="(item, key) in favoriteTech" :key="key + '_dup'" class="tech-slider-item">
                                <img :src="item.image" :alt="key" />
                                <p>{{ key }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Avatar from '../components/Avatar.vue';

export default {
    name: 'About',
    components: {
        Avatar
    },
    setup() {
        const aboutMeCard = ref(null);
        const favoriteTechCard = ref(null);
        const accoladesCard = ref(null);

        // List of favorite tech (can customize)
        const favoriteTech = {
            "TypeScript": { image: "/skills-img/typescript.png" },
            "Next.js": { image: "/skills-img/nextjs.png" },
            "Tailwind CSS": { image: "/skills-img/tailwind.png" },
            "Flutter": { image: "/skills-img/flutter.png" },
            "Expo": { image: "/skills-img/expo.png" },
            "Express.js": { image: "/skills-img/express.png" },
            "Python": { image: "/skills-img/python.png" },
            "Redis": { image: "/skills-img/redis.png" },
            "PostgreSQL": { image: "/skills-img/postgre.png" },
            "Firebase": { image: "/skills-img/firebase.png" },
            "Docker": { image: "/skills-img/docker.png" },
        };

        onMounted(() => {
            const cards = [aboutMeCard.value, favoriteTechCard.value, accoladesCard.value];

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
            favoriteTechCard,
            accoladesCard,
            favoriteTech,
        };
    }
};
</script>

<style scoped>
#about {
    scroll-margin-top: 420px;
}

.about-section {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    z-index: 1;
    width: 100%;
    min-height: 100vh;
}

.about-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    bottom: 0;
    gap: 20px;
    font-family: var(--poppins);
    color: var(--light);
    font-size: var(--M);
    /* flex-wrap: wrap; */
}

.bio-card {
    height: 100%;
    width: 50%;
    justify-content: start;
}

.side-cards-wrapper {
    width: 50%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    gap: 20px;
    height: 100%;
}

/* .hobby {
    width: 100%;
    height: 50%;
} */

.tech-card {
    width: 100%;
    height: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tech-slider-wrapper {
    overflow: hidden;
    padding: 10px 0;
    width: 100%;
}

.tech-slider {
    display: flex;
    align-items: center;
    width: max-content;
    animation: favorite-slide 18s linear infinite;
}

.tech-slider-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 20px;
    gap: 10px;
}

.tech-slider-item img {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

.tech-slider-item p {
    color: var(--light);
    font-size: var(--XS);
    font-family: var(--poppins);
    text-align: center;
}

.tech-title,
.stats-title,
.bio-title {
    font-size: 22px;
}

@keyframes favorite-slide {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-50%);
    }
}

.stats-card {
    width: 100%;
    height: 50%;
}

.bio-card,
.tech-card,
.stats-card {
    border-radius: 0px;
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

.bio-card:hover::before,
.tech-card:hover::before,
.stats-card:hover::before {
    opacity: 1;
    cursor: crosshair;
}

.bio-card::before,
.tech-card::before,
.stats-card::before {
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

span {
    color: var(--gray-light);
}

.bio-details,
.hobby-desc {
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-size: var(--S);
    padding: 10px;
    width: 100%;
}

.stats-card {
    width: 100%;
}

.stats-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.stats-content div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 33%;
    padding: 5px;
    gap: 10px;
}

.stat-commits {
    border-right: 2px solid var(--gray-light) !important;
}

.stat-experience {
    border-left: 2px solid var(--gray-light) !important;
}

.stat-label {
    font-size: var(--S);
}

@media screen and (max-width: 1000px) {
    #about {
        scroll-margin-top: 150px;
    }

    .about-layout {
        flex-wrap: wrap;
    }

    .bio-card,
    .tech-card,
    .stats-card,
    .side-cards-wrapper {
        width: 90vw;
    }
}


@media screen and (max-width: 628px) {

    .bio-card,
    .tech-card,
    .stats-card {
        font-size: var(--M);
    }

    .bio-details,
    .hobby-desc,
    .stats-content {
        font-size: var(--XS);
    }

    .stat-label {
        text-align: center;
    }

}

@media screen and (max-width: 398px) {
    .stats-content {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    .stat-commits {
        border-right: none !important;
        border-bottom: 2px solid var(--gray-light) !important;
        gap: 20px;
        padding-bottom: 20px !important;
    }

    .stat-projects {
        border-bottom: 2px solid var(--gray-light) !important;
        gap: 20px;
        padding-bottom: 20px !important;
    }

    .stat-experience {
        border-left: none !important;
        gap: 20px;
        padding-bottom: 20px !important;
    }
}
</style>