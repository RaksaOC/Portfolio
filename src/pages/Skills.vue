<template>
  <div class="skills">
    <Avatar :imagePath="'/skills-img/skills-avatar.png'"/>
    <div class="skills-content" ref="skillContentRef" id="skills" data-aos="zoom-in-up">
      <p class="skill-head">Techstack</p>
      <div class="skill-img-wrapper">
        <Skill
            v-for="(value, key) in skillsMap"
            :key="key"
            :image="value"
            :name="key"
        />
      </div>
    </div>
    <div class="learning" ref="learningRef" data-aos="zoom-out-up">
      <p class="learning-head">Currently Learning</p>
      <div class="learning-slide-wrapper">
        <div class="learning-slide">
          <Skill v-for="(value, key) in learnings" :key="key" :image="value" :name="key"/>
        </div>
        <div class="learning-slide">
          <Skill v-for="(value, key) in learnings" :key="key" :image="value" :name="key"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Skill from '../components/Skill.vue';
import Avatar from '../components/Avatar.vue';
import {ref, onMounted} from 'vue';

export default {
  name: "skills",
  components: {
    Skill,
    Avatar
  },
  setup() {
    // Declare skillsMap here
    const skillsMap = {
      "C": "/skills-img/c.png",
      "C++": "/skills-img/c++.png",
      "Java": "/skills-img/java.png",
      "Python": "/skills-img/python.png",
      "JavaScript": "/skills-img/javascript.png",
      "Spring Boot": "/skills-img/spring.png",
      "JavaFX": "/skills-img/javafx.png",
      "HTML": "/skills-img/html.png",
      "CSS": "/skills-img/css.png",
      "React": "/skills-img/react.png",
      "Vue": "/skills-img/vue.svg",
      "Three.js": "/skills-img/threejs.png",
      "Tailwind": "/skills-img/tailwind.png",
      "Bootstrap": "/skills-img/bootstrap.png",
      "MySQL": "/skills-img/mysql.png",
      "Git": "/skills-img/git.png",
      "Linux": "/skills-img/linux.png",
      "Figma": "/skills-img/figma.png"
    };
    const learnings = {
      "Flutter": "/skills-img/flutter.png",
      "Dart": "/skills-img/dart.png",
      "Kotlin": "/skills-img/kotlin.png",
      "Angular": "/skills-img/angular.png",
      "Firebase": "/skills-img/firebase.png",
      "PHP": "skills-img/php.png",
      "Laravel": "skills-img/laravel.png",
      "Node.js": "/skills-img/nodejs.png",
      "Express.js": "/skills-img/express.png",
      "Next.js": "/skills-img/nextjs.png",
      "C#": "/skills-img/csharp.png",
      ".NET": "/skills-img/dotnet.svg"
    };


    const skillContentRef = ref(null);
    const learningRef = ref(null);

    onMounted(() => {
      const skillContent = skillContentRef.value;
      const learning = learningRef.value;

      // Check if the ref is initialized correctly
      if (!skillContent || !learning) {
        console.log("skillContentRef is not found!");
        return;
      }

      const handleOnMouseMove = (e) => {
        const {currentTarget: target} = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);
      };

      skillContent.addEventListener("mousemove", handleOnMouseMove);
      learning.addEventListener("mousemove", handleOnMouseMove);
    });

    // Return both skillsMap and skillContentRef so they can be used in the template
    return {
      skillsMap,
      skillContentRef,
      learnings,
      learningRef
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
  z-index: 1;
  gap: 20px;
}

.skill-head {
  font-size: var(--M);
  margin-bottom: 60px;
}

.skills-content {
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 20px;
  width: 100%;
  scroll-margin-top: 200px;
}

.skills-content::before,
.learning::before {
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

.skills-content:hover::before,
.learning:hover::before {
  opacity: 1;
  cursor: crosshair;
}

.skill-img-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}


@keyframes slide {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-100%);
  }
}

.learning {
  overflow: hidden;
  padding: 20px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  position: relative;
  width: 100%;
}

.learning-head {
  font-size: var(--M);
  text-align: center;
  margin-bottom: 60px;
}

.learning-slide-wrapper {
  display: flex;
  width: 200%;
}

.learning:hover .learning-slide {
  animation-play-state: paused;
}

.learning-slide {
  display: flex;
  animation: slide 15s linear infinite;
}

.learning-slide img {
  width: 100px;
  margin: 0 20px;
}

@media screen and (max-width: 1000px) {
  .skills-content {
    width: 90vw;
  }

  .skill-img-wrapper {
    justify-content: space-around;
  }

  .learning {
    width: 90vw;
  }
}

@media screen and (max-width: 638px) {
  .skills-content {
    scroll-margin-top: 100px;
  }
}
</style>
