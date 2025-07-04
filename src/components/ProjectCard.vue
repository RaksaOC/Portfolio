<template>
    <div class="project-card" ref="cardRef" data-aos="zoom-in-down">
        <div class="top">
            <div class="text-wrapper">
                <div class="num" ref="numRef">
                    <p>{{ project.number }}</p>
                </div>
                <div class="desc" ref="descRef">
                    <p class="title">{{ project.title }}</p>
                    <div class="tech-stack">
                        <div class="stack-item" v-for="item in project.techStack" :key="item">
                            <p>{{ item }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="project-img-year ">
                <div class="project-img-link">
                    <img :src="project.mainImage" alt="" ref="projectImageRef" class="project-image">
                </div>
                <p class="year">{{ project.year }}</p>
            </div>
        </div>
        <div class="arrow" ref="arrowRef">
            <img src="/arrow-down.png" alt="see more arrow">
        </div>
        <div class="bottom" ref="bottomRef">
            <div id="carouselExampleInterval" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                    <div class="carousel-item active" data-bs-interval="2000">
                        <img :src="project.image[0]" class="d-block w-100" alt="...">
                    </div>
                    <div class="carousel-item" data-bs-interval="2000">
                        <img :src="project.image[1]" class="d-block w-100" alt="...">
                    </div>
                    <div class="carousel-item" data-bs-interval="2000">
                        <img :src="project.image[2]" class=" d-block w-100" alt="...">
                    </div>
                    <div class="carousel-item" data-bs-interval="2000">
                        <img :src="project.image[3]" class="d-block w-100" alt="...">
                    </div>
                    <div class="carousel-item" data-bs-interval="2000">
                        <img :src="project.image[4]" class="d-block w-100" alt="...">
                    </div>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval"
                    data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true" @click="notifyClick"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval"
                    data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true" @click="notifyClick"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
            <div class="description">
                <p>{{ project.description }}</p>
            </div>
            <div class="project-links" ref="projectLinksRef">
                <a :href="project.githubLink" target="_blank">
                    <img src="/contact-img/github.png" alt="">
                    GitHub
                </a>
                <a :href="project.ytLink" target="_blank">
                    <img src="/contact-img/yt.png" alt="">
                    Demo
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

defineProps({
    project: Object
});
const numRef = ref(null);
const cardRef = ref(null);
const descRef = ref(null);
const projectImageRef = ref(null);
const arrowRef = ref(null);
const bottomRef = ref(null);
const notifyClick = () => {
    console.log("is pressed");
}

const isExtraVisible = ref(true);

onMounted(() => {
    const card = cardRef.value;
    const num = numRef.value;
    const desc = descRef.value;
    const projectImage = projectImageRef.value;
    const arrow = arrowRef.value;
    const bottom = bottomRef.value;

    if (!card || !projectImage || !num) {
        console.log("Ref is not found!");
        return;
    }

    const handleOnMouseMove = (e) => {
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);
    };
    card.addEventListener("mousemove", handleOnMouseMove);

    // Show image on hover
    const showImage = () => {
        projectImage.style.opacity = "0.7";
        projectImage.style.transform = "translateY(-5px)";
        projectImage.style.visibility = "visible";;
    };

    const hideImage = () => {
        projectImage.style.opacity = "0";
        projectImage.style.transform = "translateY(10px)";
        projectImage.style.visibility = "hidden";
    };

    const showNum = () => {
        if (window.innerWidth > 638) {
            num.style.transform = "translateX(0)";  // Reset to original position
            desc.style.transform = "translateX(0)"
            num.classList.remove('hidden');
        }
    };

    const hideNum = () => {
        if (window.innerWidth > 638) {
            num.style.transform = "translateX(-100%)";  // Move it out to the left
            desc.style.transform = "translateX(calc(-12%))"
            num.classList.add('hidden');
        }

    };

    // Toggle description
    arrow.addEventListener("click", () => {
        isExtraVisible.value = !isExtraVisible.value;

        if (isExtraVisible.value) {
            bottom.classList.remove("show");
            bottom.style.display = "none"
            arrow.style.transform = "rotate(0deg)";
        } else {
            bottom.classList.add("show");
            bottom.style.display = "flex"
            arrow.style.transform = "rotate(180deg)";
        }
    });


    card.addEventListener("mouseenter", showImage);
    card.addEventListener("mouseleave", hideImage);

    card.addEventListener("mouseenter", hideNum);
    card.addEventListener("mouseleave", showNum);

    card.addEventListener("mouseenter", () => {
        arrow.style.opacity = "0.7"
    })

    card.addEventListener("mouseleave", () => {
        if (isExtraVisible.value) {
            arrow.style.opacity = "0"
        }
    })
});
</script>

<style scoped>
.project-card {
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 20px;
    width: 100%;
    min-height: 20%;
    font-family: var(--poppins);
    color: var(--light);
    transition: all 0.5s;
    position: relative;
    gap: 20px;
    transition: max-width 0.3s ease;
}

.project-card:hover::before {
    opacity: 1;
    cursor: crosshair;
}

.project-card::before {
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

.text-wrapper {
    display: flex;
    justify-content: start;
    align-items: start;
    gap: 20px;
    max-width: 40%;
}

.title {
    font-size: var(--M);
    width: 100%;
}

.tech-stack {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 10px;
}

.desc {
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: all 0.5s;
}

.stack-item {
    font-size: var(--S);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 5px 10px;
    user-select: none;
    transition: all 0.3s ease-in-out;
}

.stack-item p {
    margin: 0;
}

.stack-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.project-img-year {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    max-width: 50%;
}

.project-image {
    width: 65%;
    aspect-ratio: 16/9;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease-in-out;
    border-radius: 10px;
    transform: translateY(10px);
}

.project-image:hover {
    opacity: 1;
}

.num {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 40px;
    height: 40px;
    position: relative;
    transition: transform 0.3s ease;
}

.num p {
    margin-bottom: 9px;
    color: var(--gray-light);
    font-size: var(--S);
    visibility: visible;
    transition: opacity 0.3s ease;
}

.num.hidden p {
    opacity: 0;
}

.project-img-link {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
}

.project-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 50%;
    transition: all 0.3s ease-in-out;
}

.project-links a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--light);
    border-radius: 30px;
    padding: 10px;
    text-decoration: none;
    font-size: var(--XS);
    cursor: pointer;
    gap: 10px;
}

.project-links>a>img {
    width: 20px;
}

.project-links a:hover {
    background: rgba(255, 255, 255, 0.05);
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
}

.bottom {
    max-width: 80%;
    max-height: 0;
    opacity: 0;
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    transition: max-height 0.5s ease-in-out, opacity 0.3s ease
}

.bottom.show {
    max-height: 600px;
    opacity: 1;
    /* Adjust this value based on content */
}

.arrow {
    transition: all 0.3s ease;
    opacity: 0;
}

.arrow img {
    width: 30px;
    cursor: pointer;
    transition: all 0.5s ease;
}

.arrow img:hover {
    transform: scale(1.1);
}

.bottom p {
    text-align: center;
}

.carousel {
    border-radius: 10px;
    width: 300px;
    overflow-x: hidden;
}

.carousel-item img {
    width: 300px !important;
    aspect-ratio: 16/9;
}

.carousel-control-prev-icon {
    margin-right: 50%;
}

.carousel-control-next-icon {
    margin-left: 50%;
}


.carousel-control-prev-icon,
.carousel-control-next-icon {
    display: none;
    filter: invert();
    cursor: pointer;
}

@media screen and (max-width: 1000px) {

    .text-wrapper {
        max-width: 60%;
    }

    .project-img-link img {
        display: none;
    }

    .arrow {
        opacity: 1 !important;
    }

    .project-links {
        width: 100%;
        justify-content: center;
        gap: 20px;
    }

    /* .num {
        opacity: 0;
    } */
}

@media screen and (max-width: 638px) {
    .top {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

  .tech-stack {
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

    .bottom {
        max-width: 100%;
    }

    .text-wrapper {
        max-width: 100%;
        gap: 0;
    }

    .desc {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .description{
      font-size: var(--XS);
    }

    .num {
        display: none;
    }

    .title {
        text-align: center;
    }

    .project-img-year {
        gap: 0;
    }
}
</style>
