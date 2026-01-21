<template>
  <div class="projects" data-aos-delay="500">
    <Avatar :imagePath="'/projects-img/projects-avatar.png'" />

    <!-- Tab Navigation -->
    <div class="tab-container" data-aos="zoom-in-down">
      <div class="tab-wrapper">
        <div class="tab-indicator" :style="tabIndicatorStyle"></div>
        <button class="tab-button" :class="{ active: activeTab === 'featured' }" @click="activeTab = 'featured'">
          Featured
        </button>
        <button class="tab-button" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          All
        </button>
      </div>
    </div>

    <div class="projects-wrapper" id="projects">
      <ProjectCard v-for="(project, index) in displayedProjects" :project="project" :displayNumber="index + 1"
        :key="project.number" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Avatar from '../components/Avatar.vue';
import ProjectCard from '../components/ProjectCard.vue';

const activeTab = ref('featured');


const projects = [
  // 1. KOMPLEX - flagship fullstack web/mobile app
  {
    number: 1,
    title: "KOMPLEX",
    year: 2025,
    mainImage: "/projects-img/komplex/1.png",
    image: [
      "/projects-img/komplex/1.png",
      "/projects-img/komplex/2.png",
      "/projects-img/komplex/3.png",
      "/projects-img/komplex/4.png",
      "/projects-img/komplex/5.png"
    ],
    techStack: ["Next.js", "Expo", "Tailwind", "Express.js", "FastAPI", "PostgreSQL", "Redis"],
    description: "A web and mobile application educational platform for khmer students with curriculum aligned interactive lessons, utilities, tutor AI and community features.",
    githubLink: "https://github.com/KOMPLEX-KH/KOMPLEX.git",
    ytLink: "https://komplex.app"
  },

  // 2. Quicknews - fullstack web app
  {
    number: 2,
    title: "Quicknews",
    year: 2025,
    mainImage: "/projects-img/quicknews/1.JPG",
    image: [
      "/projects-img/quicknews/1.JPG",
      "/projects-img/quicknews/2.png",
      "/projects-img/quicknews/3.png",
      "/projects-img/quicknews/4.png",
      "/projects-img/quicknews/5.png"
    ],
    techStack: ["Next.Js", "Tailwind", "Express.Js", "PostgreSQL", "Redis", "Cloudflare"],
    description: "An engaging news application delivering credible news by verified creators.",
    ytLink: "https://quicknews-v1.netlify.app/"
  },

  // 3. Grand Cineplex - fullstack (React + Express + DB/payment)
  {
    number: 3,
    title: "Grand Cineplex",
    year: 2026,
    mainImage: "/projects-img/grand-cineplex/2.png",
    image: [
      "/projects-img/grand-cineplex/1.png",
      "/projects-img/grand-cineplex/2.png",
      "/projects-img/grand-cineplex/3.png",
      "/projects-img/grand-cineplex/4.png",
      "/projects-img/grand-cineplex/5.png"
    ],
    techStack: ["React", "Express.js", "PostgreSQL", "ABA payway"],
    description: "A web application for managing cinema operations, featuring multi-role interfaces for customers to browse and reserve tickets, cashiers to manage payments and managers to manage the cinema.",
    githubLink: "https://github.com/RaksaOC/Grand-Cineplex.git",
    ytLink: "https://youtu.be/gUxQBH9ti1M",
  },

  // 4. Grand Cineplex DBA - admin database management tool
  {
    number: 4,
    title: "Grand Cineplex DBA",
    year: 2026,
    mainImage: "/projects-img/grand-cineplex-dba/1.png",
    videoSrc: "/project-videos/grand-cineplex-dba.mp4",
    techStack: ["Next.Js", "PostgreSQL"],
    description: "A custom database management tool for managing Grand Cineplex's database with dashboard, roles, permissions, console and schema visualization.",
    githubLink: "https://github.com/RaksaOC/Grand-Cineplex-DBA",
    ytLink: "https://youtu.be/goEl2iz4AUI",
  },

  // 5. V-Menu - fullstack web system
  {
    number: 5,
    title: "V-Menu",
    year: 2026,
    mainImage: "/projects-img/v-menu/1.png",
    image: [
      "/projects-img/v-menu/1.png",
      "/projects-img/v-menu/2.png",
      "/projects-img/v-menu/3.png",
      "/projects-img/v-menu/4.png",
      "/projects-img/v-menu/5.png"
    ],
    techStack: ["Next.js", "Tailwind", "MongoDB"],
    description: "A digital restaurant ordering and management system where users are able to scan QR code and place food orders, chefs receive orders, cashier manage payments and owners can manage multiple restaurants.",
    githubLink: "https://github.com/RaksaOC/V-Menu.git",
  },

  // 6. Jou Em - unity game with backend
  {
    number: 6,
    title: "Jou Em",
    year: 2025,
    mainImage: "/projects-img/jou-em/5.png",
    image: [
      "/projects-img/jou-em/5.png",
      "/projects-img/jou-em/4.png",
      "/projects-img/jou-em/3.png",
      "/projects-img/jou-em/2.png",
      "/projects-img/jou-em/1.png"
    ],
    techStack: ["Unity", "C#", "Express.js", "MongoDB"],
    description: "A captivating fruit merging puzzle game inspired by the rich culture and landscapes of Cambodia, featuring traditional Khmer fruits in an ancient temple setting.",
    githubLink: "https://github.com/Neitong/Fruit-Merge-Game.git",
    ytLink: "https://raksaoc.github.io/fruit-merge-website/",
    isVertical: true
  },

  // 7. Learning Management System - Java fullstack desktop app
  {
    number: 7,
    title: "Learning Management System",
    year: 2025,
    mainImage: "/projects-img/lms/2.png",
    image: [
      "/projects-img/lms/1.png",
      "/projects-img/lms/2.png",
      "/projects-img/lms/3.png",
      "/projects-img/lms/4.png",
      "/projects-img/lms/5.png"
    ],
    techStack: ["Java", "JavaFX", "MySQL"],
    description: "A feature-rich Learning Management System (LMS) for managing courses, student enrollments, and teacher assignments. Built with Java and JavaFX for a desktop interface, and MySQL as the backend for data management. The admin app controls all core features, while teacher and student apps focus on classroom interactions.",
    githubLink: "https://github.com/RaksaOC/Learning-Management-System",
    ytLink: "https://youtu.be/TtJ_sTZEOfY"
  },

  // 8. Dak Louk - flutter marketplace mobile
  {
    number: 8,
    title: "Dak Louk",
    year: 2026,
    mainImage: "/projects-img/dak-louk/1.png",
    videoSrc: "/project-videos/dak-louk.mp4",
    techStack: ["Flutter", "SQLite"],
    description: "An offline marketplace flutter mobile application for merchants and buyers with product listing, ordering, live streams and posts system.",
    githubLink: "https://github.com/salxz696969/dak-louk.git",
    ytLink: "https://youtube.com/shorts/3_a9yMMPTMU",
    isVertical: true
  },

  // 9. NoteDown - fullstack spring boot web notes app
  {
    number: 9,
    title: "NoteDown",
    year: 2025,
    mainImage: "/projects-img/note-down/1.png",
    image: [
      "/projects-img/note-down/1.png",
      "/projects-img/note-down/2.png",
      "/projects-img/note-down/1.png",
      "/projects-img/note-down/2.png",
      "/projects-img/note-down/1.png"
    ],
    techStack: ["HTML", "CSS", "JS", "Spring Boot"],
    description: "A full-stack web application for taking and organizing notes. Built with Spring Boot for the backend and JavaScript, HTML, and CSS for the frontend. Created to explore full-stack development, REST APIs, and client-server communication.",
    githubLink: "https://github.com/RaksaOC/Note-Down.git",
  },

  // 10. Quizzy - interactive game/fullstack Next
  {
    number: 10,
    title: "Quizzy",
    year: 2025,
    mainImage: "/projects-img/quizzy/1.png",
    image: [
      "/projects-img/quizzy/5.png",
      "/projects-img/quizzy/4.png",
      "/projects-img/quizzy/3.png",
      "/projects-img/quizzy/2.png",
      "/projects-img/quizzy/1.png"
    ],
    techStack: ["Next.js", "Tailwind", "Framer Motion"],
    description: "A beautiful, interactive web application built with Next.js featuring educational games and quizzes designed specifically for kids! This app provides an engaging learning experience with colorful animations, fun sound effects, and kid-friendly content.",
    githubLink: "https://github.com/RaksaOC/Quizzy.git",
    ytLink: "https://quizzy-orpin.vercel.app"
  },

  // 11. KeebsForKeebs - frontend (React)
  {
    number: 11,
    title: "KeebsForKeebs",
    year: 2025,
    mainImage: "/projects-img/keebs-for-keebs/1.png",
    image: [
      "/projects-img/keebs-for-keebs/1.png",
      "/projects-img/keebs-for-keebs/2.png",
      "/projects-img/keebs-for-keebs/3.png",
      "/projects-img/keebs-for-keebs/4.png",
      "/projects-img/keebs-for-keebs/5.png"
    ],
    techStack: ["React", "Tailwind", "CSS"],
    description: "An interactive web platform for browsing, testing, and purchasing mechanical keyboards. Features include a 3D viewer, live sound tests, and a fully functional cart and checkout system, all built with a modern and responsive UI.",
    githubLink: "https://github.com/salxz696969/keyboard-showcase.git",
  },

  // 12. BestWay - business website
  {
    number: 12,
    title: "BestWay",
    year: 2025,
    mainImage: "/projects-img/best-way/1.png",
    image: [
      "/projects-img/best-way/1.png",
      "/projects-img/best-way/2.png",
      "/projects-img/best-way/3.png",
    ],
    techStack: ["Next.Js", "Tailwind"],
    description: "A website for bestway a logistics company in Cambodia, for displaying information about the company and their services.",
    ytLink: "https://www.bestway-global-kh.com"
  },

  // 13. McDonald's Clone - frontend
  {
    number: 13,
    title: "McDonald's Clone",
    year: 2024,
    mainImage: "/projects-img/mcdonald/1.jpg",
    image: [
      "/projects-img/mcdonald/1.jpg",
      "/projects-img/mcdonald/2.jpg",
      "/projects-img/mcdonald/3.jpg",
      "/projects-img/mcdonald/4.jpg",
      "/projects-img/mcdonald/5.jpg"
    ],
    techStack: ["HTML", "CSS", "Bootstrap"],
    description: "A front-end replica of the official McDonald's website. Built using HTML, CSS, and Bootstrap, the project demonstrates the ability to recreate a professional website layout and responsive UI using fundamental web technologies.",
    githubLink: "https://github.com/RaksaOC/McDonald-Clone.git",
    ytLink: "https://mc-donald-clone-lime.vercel.app/"
  },

  // 14. Dart Clinic - CLI tool
  {
    number: 14,
    title: "Dart Clinic",
    year: 2026,
    mainImage: "/projects-img/dart-clinic/1.png",
    techStack: ["Dart", "JSON"],
    videoSrc: "/project-videos/dart-clinic.mp4",
    description: "A CLI hospital management system for managing patients, doctors, appointments, rooms, and other hospital operations.",
    githubLink: "https://github.com/RaksaOC/Dart-Clinic",
    ytLink: "https://youtu.be/gT9WJ3ogHp8",
  },

  // 15. Bus Management System - CLI (C++)
  {
    number: 15,
    title: "Bus Management System",
    year: 2024,
    mainImage: "/projects-img/bus-reserve/1.png",
    image: [
      "/projects-img/bus-reserve/1.png",
      "/projects-img/bus-reserve/2.png",
      "/projects-img/bus-reserve/3.png",
      "/projects-img/bus-reserve/4.png",
      "/projects-img/bus-reserve/5.png"
    ],
    techStack: ["C++", "JSON"],
    description: "A command-line bus reservation system developed in C++. Users can book and refund seats, while admins manage buses and admin accounts. JSON is used for data storage, making the system lightweight and portable.",
    githubLink: "https://github.com/RaksaOC/Bus-Management-System.git",
  },

  // 16. 3D Portfolio - personal interactive 3d site
  {
    number: 16,
    title: "3D Portfolio",
    year: 2024,
    mainImage: "/projects-img/3dPort/2.png",
    image: [
      "/projects-img/3dPort/1.png",
      "/projects-img/3dPort/2.png",
      "/projects-img/3dPort/3.png",
      "/projects-img/3dPort/4.png",
      "/projects-img/3dPort/5.png"
    ],
    techStack: ["Three.js", "Vue.js", "Bootstrap"],
    description: "A visually stunning 3D web portfolio built using Three.js and Vue.js to showcase myself, skills, projects and experience.",
    githubLink: "https://github.com/RaksaOC/Portfolio",
    ytLink: "https://www.chanraksa.com",
  },
];

// Featured projects: first 8 + Quizzy (10) + 3D Portfolio (16)
const featuredProjectNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 10, 16];

const displayedProjects = computed(() => {
  if (activeTab.value === 'featured') {
    return projects.filter(project => featuredProjectNumbers.includes(project.number));
  }
  return projects;
});

const tabIndicatorStyle = computed(() => ({
  transform: activeTab.value === 'featured' ? 'translateX(0)' : 'translateX(calc(100% + 4px))',
}));

</script>


<style>
.projects {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  scroll-margin-top: -800px;
  position: relative;
}

.tab-container {
  /* Sticky only within the Projects section (unsticks when Projects ends) */
  position: sticky;
  top: 100px;
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  margin-top: 20px;
}

.tab-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  padding: 4px;
  display: flex;
  gap: 4px;
  overflow: hidden;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 6px);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  transition: transform 0.25s ease;
  z-index: 0;
}

.tab-button {
  min-width: 180px;
  padding: 10px 30px;
  border: none;
  background: transparent;
  color: var(--light);
  font-family: var(--poppins);
  font-size: var(--S);
  cursor: pointer;
  transition: opacity 0.3s ease;
  border-radius: 50px;
  position: relative;
  z-index: 1;
  flex: 1;
}

.tab-button:not(.active) {
  opacity: 0.7;
}

.tab-button:hover {
  opacity: 1;
}

.projects-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  scroll-margin-top: 200px;
  overflow-x: visible;
}

@media screen and (max-width: 1000px) {
  .projects-wrapper {
    width: 90vw;
  }

  .tab-button {
    padding: 8px 20px;
    font-size: var(--XS);
    min-width: 140px;
  }
}
</style>