<template>
    <div class="projects">
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
        description: "A modern and visually stunning 3D personal portfolio website that takes you on an interactive journey through my projects and skills 🌟. Built with Vue.js for seamless reactivity and Three.js to bring in some impressive 3D animations, this project features a sleek, responsive design powered by Bootstrap. Perfect for showing off creativity and technical skills! 🔥",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 2,
        title: "Learning Management System",
        year: 2025,
        mainImage: "/projects-img/lms/1.png",
        image: [
            "/projects-img/lms/1.png",
            "/projects-img/lms/1.png",
            "/projects-img/lms/1.png",
            "/projects-img/lms/1.png",
            "/projects-img/lms/1.png"
        ],
        techStack: ["Java", "JavaFX", "MySQL"],
        description: "A feature-rich Learning Management System (LMS) that makes managing courses, student enrollments, and teacher assignments a breeze 🎓. Built with Java and JavaFX for a smooth desktop interface, while MySQL powers the backend for efficient data storage. The admin app controls everything, from managing users to overseeing the entire database 📊, while the teacher and student apps focus on assignments and quizzes. A solid tool for creating an engaging educational experience!",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 3,
        title: "Quizzard",
        year: 2025,
        mainImage: "/projects-img/quizzard/1.png",
        image: [
            "/projects-img/quizzard/1.png",
            "/projects-img/quizzard/2.png",
            "/projects-img/quizzard/1.png",
            "/projects-img/quizzard/2.png",
            "/projects-img/quizzard/1.png"
        ],
        techStack: ["HTML", "CSS", "JavaScript"],
        description: "An interactive quiz app that lets you test your knowledge on various topics 🧠. Built with plain old HTML, CSS, and Vanilla JavaScript, Quizzard offers two modes: 'play' to test your skills and 'make' to create your own quizzes 🤓. A fun, educational tool for both learning and teaching, with real-time score tracking and a smooth user experience!",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 4,
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
        description: "A simple yet efficient C++-based CLI bus reservation system 🚌. Users can easily book and refund seats, as well as view their reservation history. Admins can manage buses, add new ones, delete old ones, and even manage other admins 👨‍💼. Data is stored in JSON, keeping it lightweight and portable. It's a perfect example of making practical use of C++ and JSON for a useful, real-world application.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 5,
        title: "McDonald's Clone",
        year: 2024,
        mainImage: "/projects-img/mcdonald/1.png",
        image: [
            "/projects-img/mcdonald/1.png",
            "/projects-img/mcdonald/2.png",
            "/projects-img/mcdonald/3.png",
            "/projects-img/mcdonald/4.png",
            "/projects-img/mcdonald/5.png"
        ],
        techStack: ["HTML", "CSS", "Bootstrap"],
        description: "A replica of McDonald's official website 🍔, built using basic HTML, CSS, and a bit of Bootstrap for responsiveness. This project is a great demonstration of how you can recreate a professional website with simple front-end technologies. It’s a fun and practical exercise in web design and UI replication, proving that with just the basics, you can build a polished product 👌.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 6,
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
        description: "A static personal portfolio website built with React 🌐. This project marked my first step into the world of React, showcasing my skills in front-end development. Featuring a homepage, about section, project showcase, and contact page, it highlights my journey in web development and my ability to create clean and organized web experiences. It was a stepping stone toward more complex projects 💪.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
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
}

@media screen and (max-width: 1000px) {
    .projects-wrapper {
        width: 90vw;
    }
}
</style>