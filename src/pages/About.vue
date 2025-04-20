<template>
    <div class="about">
        <Avatar :imagePath="'/my-real-pic.jpeg'" />
        <div class="about-content" id="about">
            <div class="about-me" ref="aboutMeCard" data-aos="fade-right">
                <p class="about-me-head">About Me</p>
                <br>
                <div class="about-me-desc">
                    <p><span>1</span> Hey there! 👋 I’m a problem-solver and tech enthusiast who loves turning ideas
                        into reality. 💻</p>
                    <p><span>2</span> Learning, building, and growing from Phnom Penh, Cambodia 🇰🇭, always seeking new
                        challenges. </p>
                    <p><span>3</span> Passionate about full-stack development, algorithms, and creating
                        scalable systems. ⚙️</p>
                    <p><span>4</span> Driven by curiosity, continuous learning, and a love for impactful technology.
                        Let’s build something amazing! ⚡</p>
                </div>

            </div>

            <div class="hobby-accolades">
                <div class="hobby" ref="hobbyCard" data-aos="fade-left">
                    <p class="hobby-head">Hobbies</p>
                    <br>
                    <div class="hobby-desc">
                        <p><span>1</span> Coding—where creativity meets logic. 💻</p>
                        <p><span>2</span> Riding motorcycles—nothing beats the thrill of the open road. 🏍️</p>
                        <p><span>3</span> Gaming—competitive, strategic, and just fun. 🎮</p>
                        <p><span>4</span> Sports—staying active and pushing limits. ⚽</p>
                    </div>


                </div>

                <!-- <div class="accolades" ref="accoladesCard">
                    <p class="accolades-head">Achievements</p>
                    <br>
                    <div class="accolades-desc">
                        <p><span>1</span> Based in the heart of the city 🌆.</p>
                        <p><span>2</span> Always exploring new spots around the world 🌍.</p>
                        <p><span>3</span> Currently, you can find me coding away in my cozy home office 🏠💻.</p>
                    </div>
                </div> -->
                <div class="accolades" ref="accoladesCard" data-aos="fade-up">
                    <p class="accolades-head">Accolades</p>
                    <br>
                    <div class="accolades-desc">
                        <div class="commits">
                            <p class="commits-head">Commits</p>
                            <p class="commits-num">320+</p>
                        </div>
                        <div class="projects">
                            <p class="projects-head">Projects</p>
                            <p class="projects-num">7+</p>
                        </div>
                        <div class="pr-merged">
                            <p class="pr-head">Code Lines</p>
                            <p class="pr-num">50K+</p>
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
        const hobbyCard = ref(null);
        const accoladesCard = ref(null);

        onMounted(() => {
            const cards = [aboutMeCard.value, hobbyCard.value, accoladesCard.value];

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
            accoladesCard,
        };
    }
};
</script>


<style scoped>
#about {
    scroll-margin-top: 420px;
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
    font-size: var(--M);
    /* flex-wrap: wrap; */
}

.about-me {
    height: 100%;
    width: 50%;
    justify-content: start;
}

.hobby-accolades {
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

.accolades {
    width: 100%;
    height: 50%;
}

.about-me,
.hobby,
.accolades {
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
.accolades:hover::before {
    opacity: 1;
    cursor: crosshair;
}


.about-me::before,
.hobby::before,
.accolades::before {
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

.about-me-desc,
.hobby-desc {
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-size: var(--S);
    padding: 10px;
    width: 100%;
}

.accolades {
    width: 100%;
}

.accolades-desc {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.accolades-desc div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 33%;
    padding: 5px;
    gap: 10px;
}

.commits {
    border-right: 2px solid var(--gray-light) !important;
}

.pr-merged {
    border-left: 2px solid var(--gray-light) !important;
}

.commits-head,
.projects-head,
.pr-head {
    font-size: var(--S);
}

@media screen and (max-width: 1000px) {
    #about {
        scroll-margin-top: 150px;
    }

    .about-content {
        flex-wrap: wrap;
    }

    .about-me,
    .hobby,
    .accolades,
    .hobby-accolades {
        width: 90vw;
    }
}


@media screen and (max-width: 628px) {

    .about-me,
    .hobby,
    .accolades {
        font-size: var(--M);
    }

    .about-me-desc,
    .hobby-desc,
    .accolades-desc {
        font-size: var(--XS);
    }

    .pr-head {
        text-align: center;
    }

}

@media screen and (max-width: 398px) {
  .accolades-desc{
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .commits {
    border-right: none !important;
    border-bottom: 2px solid var(--gray-light) !important;
    gap: 20px;
    padding-bottom: 20px !important;
  }

  .projects{
    border-bottom: 2px solid var(--gray-light) !important;
    gap: 20px;
    padding-bottom: 20px !important;
  }

  .pr-merged {
    border-left: none !important;
    gap: 20px;
    padding-bottom: 20px !important;
  }
}

</style>