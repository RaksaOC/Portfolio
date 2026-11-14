<template>
    <div class="about-section">
        <SectionIcon icon="about" image="/images/profile/portrait-cutout.png" />
        <div class="about-layout" id="about">
            <div class="bio-card" ref="aboutMeCard" data-aos="fade-right">
                <p class="bio-title">{{ $t('about.title') }}</p>
                <br>
                <div class="bio-details">
                    <p><span>1</span> {{ $t('about.p1') }}</p>
                    <p><span>2</span> {{ $t('about.p2') }}</p>
                    <p><span>3</span> {{ $t('about.p3') }}</p>
                </div>
            </div>

            <div class="side-cards-wrapper">

                <div class="stats-card" ref="accoladesCard" data-aos="fade-left">
                    <p class="stats-title">{{ $t('about.statsTitle') }}</p>
                    <br>
                    <div class="stats-content">
                        <div class="stat-commits">
                            <p class="stat-label">{{ $t('about.contributions') }}</p>
                            <p class="stat-number">5K+</p>
                        </div>
                        <div class="stat-projects">
                            <p class="stat-label">{{ $t('about.projects') }}</p>
                            <p class="stat-number">20+</p>
                        </div>
                        <div class="stat-experience">
                            <p class="stat-label">{{ $t('about.yoe') }}</p>
                            <p class="stat-number">3+</p>
                        </div>
                    </div>
                </div>
                <div class="tech-card" ref="favoriteTechCard" data-aos="fade-up">
                    <p class="tech-title">{{ $t('about.techTitle') }}</p>
                    <br>
                    <div class="tech-slider-wrapper">
                        <div class="tech-slider">
                            <div v-for="item in favoriteTech" :key="item.name" class="tech-slider-item">
                                <img :src="item.image" :alt="item.name" />
                                <p>{{ item.name }}</p>
                            </div>
                            <!-- duplicate for seamless loop -->
                            <div v-for="item in favoriteTech" :key="item.name + '_dup'" class="tech-slider-item">
                                <img :src="item.image" :alt="item.name" />
                                <p>{{ item.name }}</p>
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
import SectionIcon from '../components/common/SectionIcon.vue';
import { favoriteTech } from '../data/skills';

export default {
    name: 'About',
    components: {
        SectionIcon
    },
    setup() {
        const aboutMeCard = ref(null);
        const favoriteTechCard = ref(null);
        const accoladesCard = ref(null);


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
    width: 64px;
    height: 64px;
    padding: 15px;
    box-sizing: border-box;
    object-fit: contain;
    /* glass circle */
    border-radius: 50%;
    background:
        radial-gradient(circle at 30% 25%, color-mix(in srgb, white 22%, transparent), transparent 55%),
        color-mix(in srgb, var(--light) 7%, transparent);
    border: 1px solid color-mix(in srgb, white 22%, transparent);
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 40%, transparent),
        inset 0 -5px 12px color-mix(in srgb, var(--dark) 25%, transparent),
        0 6px 16px rgba(0, 0, 0, 0.2);
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