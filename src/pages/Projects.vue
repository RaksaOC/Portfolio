<template>
  <div class="projects" data-aos-delay="500">
    <Avatar :imagePath="'/projects-img/projects-avatar.png'" />
    <div class="projects-wrapper" id="projects">
      <ProjectCard v-for="project in projects" :project="project" :key="project.number" />
    </div>
  </div>
</template>

<script setup>
import Avatar from '../components/Avatar.vue';
import ProjectCard from '../components/ProjectCard.vue';


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
    techStack: ["Three.js", "Next.js", "Tailwind"],
    description: "A visually stunning 3D web portfolio built using Three.js and Next.js to showcase projects interactively.",
    githubLink: "https://github.com/RaksaOC/Portfolio",
    ytLink: "https://www.chanraksa.com",
  },
];

</script>


<style>
.projects {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;

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
}
</style>