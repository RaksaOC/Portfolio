// Every project on the site. Used by the Projects section (src/sections/Projects.vue) and by the AI assistant's
// knowledge base (src/api/context.js), so both always describe the same work.

// Translation key for each project's description (src/i18n/*.js → projects.items.<key>)
export const descKeys = {
  17: 'mlmupc', 18: 'nis', 19: 'ccn', 20: 'phumiyerng',
  1: 'komplex', 2: 'quicknews', 3: 'grandCineplex', 4: 'grandCineplexDba', 5: 'vMenu',
  6: 'jouEm', 7: 'lms', 8: 'dakLouk', 9: 'noteDown', 10: 'quizzy', 11: 'keebs',
  12: 'bestWay', 13: 'mcdonald', 14: 'dartClinic', 15: 'bus', 16: 'portfolio3d',
};

export const projects = [
  // Government & national-scale platforms (CamCyber Digital Tech Team)
  {
    number: 17,
    title: "MLMUPC HRM",
    year: 2026,
    mainImage: "/images/projects/mlmupc-hrm/cover.jpg",
    image: [
      "/images/projects/mlmupc-hrm/1.jpg",
      "/images/projects/mlmupc-hrm/2.jpg",
      "/images/projects/mlmupc-hrm/3.jpg",
      "/images/projects/mlmupc-hrm/4.jpg",
      "/images/projects/mlmupc-hrm/5.jpg"
    ],
    techStack: ["Angular", "NestJS", "Flutter", "PostgreSQL", "Redis", "Socket.IO", "Docker"],
    description: "A ministry-wide human resource management platform for the Ministry of Land Management, Urban Planning and Construction, digitising attendance, leave, requests and civil servant records for nearly 3,000 officers across web and mobile. Full-stack developer and project technical lead."
  },
  {
    number: 18,
    title: "NIS HRM",
    year: 2026,
    mainImage: "/images/projects/nis-hrm/cover.jpg",
    image: [
      "/images/projects/nis-hrm/store-1.jpg",
      "/images/projects/nis-hrm/store-2.jpg",
      "/images/projects/nis-hrm/store-3.jpg",
      "/images/projects/nis-hrm/2-km.jpg",
      "/images/projects/nis-hrm/3-km.jpg"
    ],
    techStack: ["Angular", "NestJS", "Flutter", "PostgreSQL", "Socket.IO", "Python", "Raspberry Pi"],
    description: "A government HR platform for the National Institute of Statistics under the Ministry of Planning, serving 500+ officers with attendance, leave and personnel records, plus a face scanner integration that pairs on-site biometric terminals with the cloud for real-time check-ins. Full-stack developer and project technical lead."
  },
  {
    number: 19,
    title: "CCN",
    year: 2026,
    mainImage: "/images/projects/ccn/cover.jpg",
    image: [
      "/images/projects/ccn/store-2.jpg",
      "/images/projects/ccn/store-3.jpg",
      "/images/projects/ccn/store-4.jpg",
      "/images/projects/ccn/store-1.jpg"
    ],
    techStack: ["Flutter", "Dart", "Firebase", "App Store", "Google Play"],
    description: "The national registration and licensing platform of the Cambodian Council of Nurses, letting nurses nationwide register, apply for membership, licences and CPD, and receive QR-verifiable certificates through multi-step approval workflows. Mobile developer, building the Flutter app and owning its iOS and Android releases to the App Store and Google Play."
  },
  {
    number: 20,
    title: "PhumiYerng",
    year: 2026,
    mainImage: "/images/projects/phumiyerng/cover.jpg",
    image: [
      "/images/projects/phumiyerng/km-1.jpg",
      "/images/projects/phumiyerng/km-2.jpg",
      "/images/projects/phumiyerng/km-3.jpg"
    ],
    techStack: ["Flutter", "Angular", "NestJS", "PostgreSQL", "Redis", "Firebase", "Socket.IO"],
    description: "A community tourism and marketplace app supporting LASED III, a Royal Government of Cambodia land programme backed by the World Bank, bringing 19 rural communities onto one platform to promote their trips, homestays and farm-fresh products."
  },

  // 1. KOMPLEX - flagship fullstack web/mobile app
  {
    number: 1,
    title: "KOMPLEX",
    year: 2025,
    mainImage: "/images/projects/komplex/cover.jpg",
    image: [
      "/images/projects/komplex/1.png",
      "/images/projects/komplex/2.png",
      "/images/projects/komplex/3.png",
      "/images/projects/komplex/4.png",
      "/images/projects/komplex/5.png"
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
    mainImage: "/images/projects/quicknews/cover.jpg",
    image: [
      "/images/projects/quicknews/1.JPG",
      "/images/projects/quicknews/2.png",
      "/images/projects/quicknews/3.png",
      "/images/projects/quicknews/4.png",
      "/images/projects/quicknews/5.png"
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
    mainImage: "/images/projects/grand-cineplex/cover.jpg",
    image: [
      "/images/projects/grand-cineplex/1.png",
      "/images/projects/grand-cineplex/2.png",
      "/images/projects/grand-cineplex/3.png",
      "/images/projects/grand-cineplex/4.png",
      "/images/projects/grand-cineplex/5.png"
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
    mainImage: "/images/projects/grand-cineplex-dba/cover.jpg",
    image: ["/images/projects/grand-cineplex-dba/1.png"],
    videoSrc: "/videos/projects/grand-cineplex-dba.mp4",
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
    mainImage: "/images/projects/v-menu/cover.jpg",
    image: [
      "/images/projects/v-menu/1.jpg",
      "/images/projects/v-menu/2.jpg",
      "/images/projects/v-menu/3.jpg",
      "/images/projects/v-menu/4.jpg",
      "/images/projects/v-menu/5.jpg",
      "/images/projects/v-menu/6.jpg",
      "/images/projects/v-menu/7.jpg"
    ],
    techStack: ["Next.js", "Express", "TypeScript", "MongoDB", "Firebase Auth"],
    description: "QR-code restaurant ordering: customers order from their table, the kitchen sees the queue, cashiers close bills and owners run menus, tables and staff across restaurants. Rebuilt from one Next.js app into three microservices (restaurant, menu and order), each with its own MongoDB database, behind a Next.js frontend.",
    githubLink: "https://github.com/RaksaOC/V-Menu.git",
  },

  // 6. Jou Em - unity game with backend
  {
    number: 6,
    title: "Jou Em",
    year: 2025,
    mainImage: "/images/projects/jou-em/cover.jpg",
    image: [
      "/images/projects/jou-em/5.png",
      "/images/projects/jou-em/4.png",
      "/images/projects/jou-em/3.png",
      "/images/projects/jou-em/2.png",
      "/images/projects/jou-em/1.png"
    ],
    techStack: ["Unity", "C#", "Express.js", "MongoDB"],
    description: "A captivating fruit merging puzzle game inspired by the rich culture and landscapes of Cambodia, featuring traditional Khmer fruits in an ancient temple setting.",
    githubLink: "https://github.com/Neitong/Fruit-Merge-Game.git",
    ytLink: "https://raksaoc.github.io/fruit-merge-website/"
  },

  // 7. Learning Management System - Java fullstack desktop app
  {
    number: 7,
    title: "Learning Management System",
    year: 2025,
    mainImage: "/images/projects/lms/cover.jpg",
    image: [
      "/images/projects/lms/1.png",
      "/images/projects/lms/2.png",
      "/images/projects/lms/3.png",
      "/images/projects/lms/4.png",
      "/images/projects/lms/5.png"
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
    mainImage: "/images/projects/dak-louk/cover.jpg",
    image: ["/images/projects/dak-louk/1.png"],
    videoSrc: "/videos/projects/dak-louk.mp4",
    techStack: ["Flutter", "SQLite"],
    description: "An offline marketplace flutter mobile application for merchants and buyers with product listing, ordering, live streams and posts system.",
    githubLink: "https://github.com/salxz696969/dak-louk.git",
    ytLink: "https://youtube.com/shorts/3_a9yMMPTMU"
  },

  // 9. NoteDown - fullstack spring boot web notes app
  {
    number: 9,
    title: "NoteDown",
    year: 2025,
    mainImage: "/images/projects/note-down/cover.jpg",
    image: [
      "/images/projects/note-down/1.png",
      "/images/projects/note-down/2.png",
      "/images/projects/note-down/1.png",
      "/images/projects/note-down/2.png",
      "/images/projects/note-down/1.png"
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
    mainImage: "/images/projects/quizzy/cover.jpg",
    image: [
      "/images/projects/quizzy/5.png",
      "/images/projects/quizzy/4.png",
      "/images/projects/quizzy/3.png",
      "/images/projects/quizzy/2.png",
      "/images/projects/quizzy/1.png"
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
    mainImage: "/images/projects/keebs-for-keebs/cover.jpg",
    image: [
      "/images/projects/keebs-for-keebs/1.png",
      "/images/projects/keebs-for-keebs/2.png",
      "/images/projects/keebs-for-keebs/3.png",
      "/images/projects/keebs-for-keebs/4.png",
      "/images/projects/keebs-for-keebs/5.png"
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
    mainImage: "/images/projects/best-way/cover.jpg",
    image: [
      "/images/projects/best-way/1.png",
      "/images/projects/best-way/2.png",
      "/images/projects/best-way/3.png",
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
    mainImage: "/images/projects/mcdonald/cover.jpg",
    image: [
      "/images/projects/mcdonald/1.jpg",
      "/images/projects/mcdonald/2.jpg",
      "/images/projects/mcdonald/3.jpg",
      "/images/projects/mcdonald/4.jpg",
      "/images/projects/mcdonald/5.jpg"
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
    mainImage: "/images/projects/dart-clinic/cover.jpg",
    image: ["/images/projects/dart-clinic/1.png"],
    techStack: ["Dart", "JSON"],
    videoSrc: "/videos/projects/dart-clinic.mp4",
    description: "A CLI hospital management system for managing patients, doctors, appointments, rooms, and other hospital operations.",
    githubLink: "https://github.com/RaksaOC/Dart-Clinic",
    ytLink: "https://youtu.be/gT9WJ3ogHp8",
  },

  // 15. Bus Management System - CLI (C++)
  {
    number: 15,
    title: "Bus Management System",
    year: 2024,
    mainImage: "/images/projects/bus-reserve/cover.jpg",
    image: [
      "/images/projects/bus-reserve/1.png",
      "/images/projects/bus-reserve/2.png",
      "/images/projects/bus-reserve/3.png",
      "/images/projects/bus-reserve/4.png",
      "/images/projects/bus-reserve/5.png"
    ],
    techStack: ["C++", "JSON"],
    description: "A command-line bus reservation system developed in C++. Users can book and refund seats, while admins manage buses and admin accounts. JSON is used for data storage, making the system lightweight and portable.",
    githubLink: "https://github.com/RaksaOC/Bus-Management-System.git",
  },

  // 16. 3D Portfolio - this site (Vue 3 + Three.js, themes, AI assistant)
  {
    number: 16,
    title: "3D Portfolio",
    year: 2026,
    mainImage: "/images/projects/3dPort/cover.jpg",
    image: [
      "/images/projects/3dPort/1.jpg",
      "/images/projects/3dPort/2.jpg",
      "/images/projects/3dPort/3.jpg",
      "/images/projects/3dPort/4.jpg",
      "/images/projects/3dPort/5.jpg",
      "/images/projects/3dPort/6.jpg",
      "/images/projects/3dPort/7.jpg",
      "/images/projects/3dPort/8.jpg",
      "/images/projects/3dPort/9.jpg"
    ],
    techStack: ["Vue 3", "Three.js", "Vite", "vue-i18n", "Node.js"],
    description: "This site: my current portfolio, built with Vue 3 and Three.js. 25 switchable themes, each with its own 3D scene and look, liquid-glass UI, English and Khmer, a 3D skills ribbon, and an AI assistant that answers questions about my work.",
    githubLink: "https://github.com/RaksaOC/Portfolio",
    ytLink: "https://www.chanraksa.com",
  },
];

// Featured projects, shown in this order: government platforms (17-20) + KOMPLEX, Quicknews,
// Grand Cineplex, Jou Em, LMS, BestWay
export const featuredProjectNumbers = [17, 18, 19, 20, 1, 2, 3, 6, 7, 12];
