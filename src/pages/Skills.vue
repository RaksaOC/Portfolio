<template>
  <div class="skills" id="skills">
    <Avatar :imagePath="'/skills-img/skills-avatar.png'" />
    <!-- <div class="skills-content" ref="skillContentRef" id="skills" > -->
    <!-- <p class="skill-head">Techstack</p> -->
    <div class="skill-img-wrapper">
      <Skill v-for="(skill, index) in skills" :key="skill.name" :image="skill.image" :name="skill.name"
        :isEven="index % 2 === 0" :index="index" />
    </div>
    <!-- </div> -->
    <!-- <div class="learning" ref="learningRef" data-aos="zoom-out-up">
      <p class="learning-head">Currently Learning</p>
      <div class="learning-slide-wrapper">
        <div class="learning-slide">
          <Skill v-for="(value, key) in learnings" :key="key" :image="value" :name="key"/>
        </div>
        <div class="learning-slide">
          <Skill v-for="(value, key) in learnings" :key="key" :image="value" :name="key"/>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import Skill from '../components/Skill.vue';
import Avatar from '../components/Avatar.vue';
import { ref, onMounted } from 'vue';

export default {
  name: "skills",
  components: {
    Skill,
    Avatar
  },
  setup() {
    // Change skillsMap to skills array
    const skills = [
      // Core Languages
      { name: "Java", image: "/skills-img/java.png" },
      { name: "C++", image: "/skills-img/c++.png" },
      { name: "Python", image: "/skills-img/python.png" },
      { name: "JavaScript", image: "/skills-img/javascript.png" },
      { name: "TypeScript", image: "/skills-img/typescript.png" },
      { name: "Dart", image: "/skills-img/dart.png" },
      { name: "C#", image: "/skills-img/csharp.png" },

      // Web Fundamentals
      { name: "HTML", image: "/skills-img/html.png" },
      { name: "CSS", image: "/skills-img/css.png" },
      { name: "Tailwind CSS", image: "/skills-img/tailwind.png" },
      { name: "Bootstrap", image: "/skills-img/bootstrap.png" },

      // Frontend Frameworks/Libraries & Engines
      { name: "React", image: "/skills-img/react.png" },
      { name: "Next.js", image: "/skills-img/nextjs.png" },
      { name: "Vue", image: "/skills-img/vue.svg" },
      { name: "Three.js", image: "/skills-img/threejs.png" },
      { name: "Flutter", image: "/skills-img/flutter.png" },
      { name: "Expo", image: "/skills-img/expo.png" }, // Expo (commonly used with React Native)
      { name: "JavaFX", image: "/skills-img/javafx.png" },
      { name: "Unity", image: "/skills-img/unity.png" }, // Moved Unity here, with frameworks/engines

      // Backend Frameworks/Platforms
      { name: "Node.js", image: "/skills-img/nodejs.png" },
      { name: "Express.js", image: "/skills-img/express.png" },
      { name: "FastAPI", image: "/skills-img/fastapi.png" }, // Added FastAPI
      { name: "Spring Boot", image: "/skills-img/spring.png" }, // added as "Spring Boot"

      // Databases & Cloud
      { name: "MySQL", image: "/skills-img/mysql.png" },
      { name: "PostgreSQL", image: "/skills-img/postgre.png" },
      { name: "MongoDB", image: "/skills-img/mongodb.svg" },
      { name: "Redis", image: "/skills-img/redis.png" },
      { name: "Firebase", image: "/skills-img/firebase.png" },

      // Analytics

      // DevOps & Deployment
      { name: "Cloudflare", image: "/skills-img/cloudflare.png" }, // Added Cloudflare
      { name: "Vercel", image: "/skills-img/vercel.png" },
      { name: "Railway", image: "/skills-img/railway.png" },
      { name: "Docker", image: "/skills-img/docker.png" },
      { name: "Linux", image: "/skills-img/linux.png" },
      { name: "Google Analytics", image: "/skills-img/ga.png" }, // Added Google Analytics

      // Collaboration & Tools
      { name: "Git", image: "/skills-img/git.png" },
      { name: "Postman", image: "/skills-img/postman.png" },
      { name: "Figma", image: "/skills-img/figma.png" },
      { name: "Spline", image: "/skills-img/spline.png" }, // Added Spline
    ];
    // const learnings = {
    //   "Kotlin": "/skills-img/kotlin.png",
    //   "Angular": "/skills-img/angular.png",
    //   "PHP": "skills-img/php.png",
    //   "Laravel": "skills-img/laravel.png",
    //   ".NET": "/skills-img/dotnet.svg"
    // };

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
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);
      };

      skillContent.addEventListener("mousemove", handleOnMouseMove);
      learning.addEventListener("mousemove", handleOnMouseMove);
    });

    // Return skills array and refs so they can be used in the template
    return {
      skills,
      skillContentRef,
      // learnings,
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
  scroll-margin-top: -800px;
}

/* .skills-content {
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
} */

/* .skills-content::before,
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
} */
.skill-head {
  font-size: var(--M);
  margin-bottom: 60px;
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
  /* .skills-content {
    width: 90vw;
  } */

  .skill-img-wrapper {
    justify-content: space-around;
  }

  .learning {
    width: 90vw;
  }
}

@media screen and (max-width: 638px) {
  /* .skills-content {
    scroll-margin-top: 100px;
  } */
}
</style>
