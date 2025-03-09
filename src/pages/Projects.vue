<template>
    <div class="projects" >
        <Avatar :imagePath="'/my-pic.png'" />
        <div class="projects-wrapper" id="projects">
            <ProjectCard2 v-for="project in projects" :project="project" :key="project.number" />
        </div>
    </div>
</template>

<script setup>
import Avatar from '../components/Avatar.vue';
import ProjectCard from '../components/ProjectCard.vue';
import ProjectCard2 from '../components/ProjectCard2.vue';


const projects = [
    {
        number: 1,
        title: "3D Personal Portfolio",
        year: 2025,
        image: "/lms-project.png",
        techStack: ["Vue.js", "Three.js", "Tailwind"],
        description: "A modern and visually stunning 3D personal portfolio website that showcases projects and skills in an interactive and engaging way. Built using Vue.js for reactivity, Three.js for impressive 3D animations, and Tailwind for a sleek and responsive design. This project demonstrates expertise in front-end development and interactive web experiences.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 2,
        title: "Learning Management System",
        year: 2025,
        image: "/lms-project.png",
        techStack: ["Java", "JavaFX", "MySQL"],
        description: "A feature-rich Learning Management System (LMS) designed to facilitate course management, student enrollments, and teacher assignments. The system is built with Java and JavaFX for a smooth desktop interface, while MySQL is used for efficient data storage and retrieval. It provides an intuitive UI for both students and instructors, enhancing the educational experience.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 3,
        title: "Quizzard",
        year: 2025,
        image: "/lms-project.png",
        techStack: ["HTML", "CSS", "JavaScript"],
        description: "An interactive quiz application that allows users to test their knowledge on various topics. Developed using HTML, CSS, and JavaScript, this project offers a dynamic UI with real-time score tracking, multiple-choice questions, and an engaging user experience. Ideal for learning, entertainment, or self-assessment.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 4,
        title: "Bus Reservation System",
        year: 2024,
        image: "/bus-reserve-pic.png",
        techStack: ["C++", "JSON"],
        description: "A C++-based bus reservation system that enables users to check bus schedules, book seats, and manage their reservations efficiently. The system uses JSON to store user data and reservations, ensuring a lightweight and portable data management approach. Designed with an easy-to-use console interface for smooth functionality.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 5,
        title: "McDonald's Clone",
        year: 2024,
        image: "/mcdonald's.png",
        techStack: ["HTML", "CSS"],
        description: "A fully responsive clone of the McDonald's website built using pure HTML and CSS. This project replicates the original site's layout, design, and animations, showcasing skills in front-end development and UI design. It serves as an excellent demonstration of attention to detail and the ability to recreate professional websites.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    },
    {
        number: 6,
        title: "Previous Portfolio",
        year: 2024,
        image: "/port.png",
        techStack: ["HTML", "CSS"],
        description: "A simple yet elegant personal portfolio website built using HTML and CSS. This project served as an introduction to web development, featuring a homepage, about section, project showcase, and contact page. It highlights foundational front-end skills and was a stepping stone toward more advanced projects.",
        githubLink: "https://github.com/RaksaOC/Portfolio.git",
        ytLink: "https://github.com/RaksaOC/Portfolio.git"
    }
]

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

@media screen and (max-width: 1000px){
    .projects-wrapper{
        width: 90vw;
    }
}
</style>