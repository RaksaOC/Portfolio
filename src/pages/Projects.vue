<template>
  <div class="projects" data-aos-delay="500">
    <Avatar :imagePath="'/projects-img/projects-avatar.png'"/>
    <div class="projects-wrapper" id="projects">
      <ProjectCard v-for="project in projects" :project="project" :key="project.number"/>
    </div>
  </div>
</template>

<script setup>
import Avatar from '../components/Avatar.vue';
import ProjectCard from '../components/ProjectCard.vue';


const projects = [
  {
    number: 1,
    title: "3D Personal Portfolio",
    year: 2025,
    mainImage: "/projects-img/3dPort/2.png",
    image: [
      "/projects-img/3dPort/1.png",
      "/projects-img/3dPort/2.png",
      "/projects-img/3dPort/3.png",
      "/projects-img/3dPort/4.png",
      "/projects-img/3dPort/5.png"
    ],
    techStack: ["Vue.js", "Three.js", "Bootstrap"],
    description: "A modern and visually rich 3D personal portfolio website that offers an interactive experience through my projects and skills. Built with Vue.js for reactivity and Three.js for immersive 3D animations, it features a responsive design powered by Bootstrap. Designed to showcase both creativity and technical skills.",
    githubLink: "https://github.com/RaksaOC/Portfolio.git",
    ytLink: "#projects"
  },
  {
    number: 2,
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
    ytLink: "#projects"
  },
  {
    number: 3,
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
    ytLink: "#projects"
  },
  {
    number: 4,
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
    ytLink: "#projects"
  },
  {
    number: 5,
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
    ytLink: "#projects"
  },
  {
    number: 6,
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
    ytLink: "#projects"
  },
  {
    number: 7,
    title: "Previous Portfolio",
    year: 2024,
    mainImage: "/projects-img/prev-port/1.png",
    image: [
      "/projects-img/prev-port/1.png",
      "/projects-img/prev-port/2.png",
      "/projects-img/prev-port/3.png",
      "/projects-img/prev-port/4.png",
      "/projects-img/prev-port/5.png"
    ],
    techStack: ["React"],
    description: "A personal portfolio website built with React. This was my first project using React, featuring sections for about, projects, and contact. It highlights my early front-end development skills and served as the foundation for more advanced work.",
    githubLink: "https://github.com/RaksaOC/RaksaOC-Portfolio.git",
    ytLink: "#projects"
  }
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