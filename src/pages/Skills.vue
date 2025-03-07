<template>
    <div class="skills">
        <SkillsBackground />
        <div class="skills-content" ref="skillContentRef" id="skills">
            <p class="skill-head">Techstack</p>
            <div class="skill-img-wrapper">
                <div v-for="(value, key) in skillsMap" :key="key">
                    <Skill :image="value" :name="key" />
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import SkillsBackground from '../components/SkillsBackground.vue';
import Skill from '../components/Skill.vue';
import { ref, onMounted } from 'vue';

export default {
    name: "skills",
    components: {
        SkillsBackground,
        Skill
    },
    setup() {
        // Declare skillsMap here
        const skillsMap = {
            "C": "/skills-img/c.png",
            "C++": "/skills-img/c++.png",
            "Java": "/skills-img/java.png",
            "Python": "/skills-img/python.png",
            "JavaScript": "/skills-img/javascript.png",
            "Assembly": "/skills-img/assembly.png",
            "JavaFX": "/skills-img/javafx.png",
            "HTML": "/skills-img/html.png",
            "CSS": "/skills-img/css.png",
            "React": "/skills-img/react.png",
            "Vue": "/skills-img/vue.svg",
            "Three.js": "/skills-img/threejs.png",
            "Tailwind": "/skills-img/tailwind.svg",
            "Bootstrap": "/skills-img/bootstrap.png",
            "MySQL": "/skills-img/mysql.png",
            "Git": "/skills-img/git.png",
            "Linux": "/skills-img/linux.png",
            "Figma": "/skills-img/figma.png"
        };

        const skillContentRef = ref(null);

        onMounted(() => {
            const skillContent = skillContentRef.value;

            // Check if the ref is initialized correctly
            if (!skillContent) {
                console.log("skillContentRef is not found!");
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

            skillContent.addEventListener("mousemove", handleOnMouseMove);
        });

        // Return both skillsMap and skillContentRef so they can be used in the template
        return {
            skillsMap,
            skillContentRef
        }
    }
}
</script>

<style scoped>
.skills {
    width: 100%;
    min-height: 100vh;
    font-family: var(--poppins);
    color: var(--light);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.skill-head {
    font-size: var(--L);
    margin-bottom: 60px;
}

.skills-content {
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
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 20px;
    width: 100%;
}

.skills-content:hover::before {
    opacity: 1;
    cursor: crosshair;
}

.skills-content::before {
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

.skill-item img {
    width: 150px;
}

.skill-img-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

@media screen and (max-width: 1200px) {
    .skills-content {
        width: 90vw;
    }
}
</style>
