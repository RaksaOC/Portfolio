<template>
    <div class="experience" id="experience">
        <Avatar :imagePath="'/exp-avatar.png'" />

        <!-- Desktop Version -->
        <div class="experience-wrapper desktop-version">
            <div class="timeline-bar"></div>
            <div class="experience-content">
                <div v-for="(exp, index) in experiences" :key="index" class="experience-row">
                    <!-- Card on left for even indices -->
                    <ExpCard v-if="index % 2 === 0" :place="exp.place" :role="exp.role" :desc="exp.desc"
                        :duration="exp.duration" :offset="1200" aos="fade-right" />

                    <!-- Circular emblem (always in middle) -->
                    <div v-if="index % 2 === 1" class="spacer"></div>
                    <div class="emblem" data-aos="zoom-in" data-aos-offset="1200"></div>

                    <!-- Card on right for odd indices -->
                    <ExpCard v-if="index % 2 === 1" :place="exp.place" :role="exp.role" :desc="exp.desc" :offset="1200"
                        :duration="exp.duration" aos="fade-left" />
                </div>
            </div>
        </div>

        <!-- Mobile Version -->
        <div class="experience-wrapper mobile-version">
            <div class="mobile-timeline-bar"></div>
            <div class="mobile-experience-content">
                <div v-for="(exp, index) in experiences" :key="index" class="mobile-experience-row">
                    <div class="mobile-emblem" data-aos="zoom-in" data-aos-offset="200"></div>
                    <ExpCard :place="exp.place" :role="exp.role" :desc="exp.desc" :duration="exp.duration" :offset="200"
                        aos="fade-left" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Avatar from '../components/Avatar.vue';
import ExpCard from '../components/ExpCard.vue';

const experiences = [
    // {
    //     place: "Quicknews",
    //     role: "Full stack developer & Technical operations intern",
    //     desc: "Served as the technical bridge to an external agency, supporting product decisions, maintaining system architecture knowledge, overseeing infrastructure, and contributing hands-on full-stack work and experimental features as needed.",
    //     duration: "Jan. 2026-Present"
    // },
    {
        place: "Freelance",
        role: "Full-Stack Developer",
        desc: "Delivered tech solutions for clients, from requirements and system design to implementation and deployment. Built scalable frontend and backend systems using modern technologies, with a focus on performance, maintainability, and real-world production needs.",
        duration: "May. 2025–Present",
    },
    {
        place: "KOMPLEX",
        role: "Founder",
        desc: "Founded and led the development of KOMPLEX, an education platform. Drove the technical direction, led a small team, and actively participated in hackathons, startup launchpads, incubation programs, and investor pitches.",
        duration: "Aug. 2025-Present"
    },
    {
        place: "Cambodia Academy of Digital Technology",
        role: "Computer Science Trainer",
        desc: "Taught junior-level computer science fundamentals, covering JavaScript, database design, algorithms, and web design, combining theory with hands-on implementation.",
        duration: "Aug. 2025 - Sep.2025"
    },
    {
        place: "Cambodia Academy of Digital Technology",
        role: "Computer Science Student",
        desc: "Studied Computer Science at Cambodia Academy of Digital Technology (CADT) pursuing a Bachelor's degree in Computer Science specializing in Software Engineering.",
        duration: "Feb. 2024 - Present"
    }
];
</script>

<style scoped>
.experience {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
    padding: 50px 0;
    scroll-margin-top: -800px;
}

.experience-wrapper {
    width: 100%;
    max-width: 1200px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
}

.timeline-bar {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 5px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transform: translateX(-50%);
    z-index: 1;
}

.experience-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;
    position: relative;
    z-index: 2;
}

.experience-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 40px;
    width: 100%;
}

.spacer {
    /* Spacer for alternating layout */
    min-width: 0;
}

.emblem {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 3;
    flex-shrink: 0;
}

/* Desktop version - hide on mobile */
@media screen and (max-width: 768px) {
    .desktop-version {
        display: none;
    }
}

/* Mobile version - hide on desktop */
.mobile-version {
    display: none;
}

@media screen and (max-width: 768px) {
    .mobile-version {
        display: block;
    }

    .experience-wrapper {
        padding: 20px 20px;
    }

    .mobile-timeline-bar {
        position: absolute;
        left: 27.5px;
        top: 0;
        bottom: 0;
        width: 5px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        z-index: 1;
    }

    .mobile-experience-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 60px;
        position: relative;
        z-index: 2;
        padding-left: 40px;
    }

    .mobile-experience-row {
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
    }

    .mobile-emblem {
        position: absolute;
        left: -40px;
        top: 50%;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        z-index: 3;
        flex-shrink: 0;
        transform: translateX(-50%);
    }

    .mobile-experience-row :deep(.exp-card) {
        flex: 1;
        max-width: 100%;
    }
}
</style>
