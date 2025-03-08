<template>
    <div class="project-card" ref="cardRef">
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
                    <img :src="project.image" alt="" ref="projectImageRef" class="project-image">
                </div>
                <p class="year">{{ project.year }}</p>
            </div>
        </div>
        <div class="arrow" ref="arrowRef">
            <img src="/arrow-down.png" alt="see more arrow">
        </div>
        <div class="bottom" ref="bottomRef">
            <div class="description">
                <p>{{ project.description }}</p>
            </div>
            <div class="project-links" ref="projectLinksRef">
                <a :href="project.githubLink">
                <img src="/github.png" alt="">
                    GitHub
                </a>
                <a :href="project.ytLink">
                    <img src="/yt.png" alt="">
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
const projectLinksRef = ref(null);
const projectImageRef = ref(null);
const arrowRef = ref(null);
const bottomRef = ref(null);

const isExtraVisible = ref(true);

onMounted(() => {
    const card = cardRef.value;
    const num = numRef.value;
    const desc = descRef.value;
    const projectImage = projectImageRef.value;
    const projectLinks = projectLinksRef.value;
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
        projectImage.style.visibility = "visible";;
    };

    const hideImage = () => {
        projectImage.style.opacity = "0";
        projectImage.style.visibility = "hidden";
    };

    const showNum = () => {
        num.style.transform = "translateX(0)";  // Reset to original position
        desc.style.transform = "translateX(0)"
        num.classList.remove('hidden');
    };

    const hideNum = () => {
        num.style.transform = "translateX(-100%)";  // Move it out to the left
        desc.style.transform = "translateX(calc(-15%))"
        num.classList.add('hidden');
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
        arrow.style.opacity = "0"
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
    color: white;
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
}

.project-image:hover {
    opacity: 1;
    transform: scale(1.05);
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
    margin-top: 3px;
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
</style>
