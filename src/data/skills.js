// Tech stack shown on the site. Icons live in public/images/skills/.

/**
 * Skills section: one horizontally scrolling panel per group (order = display order).
 * Within each group, the tech used most across src/data/projects.js comes first.
 * Group titles live in src/i18n/*.js → skills.groups.<key>.
 * Optional `rows`: items per row on the Skills ribbon, e.g. [3, 3] (SkillRibbon.vue).
 */
export const skillGroups = [
  {
    key: "languages",
    rows: [3, 3], // ribbon layout override: items per row (otherwise up to 3 balanced rows)
    items: [
      { name: "TypeScript", image: "/images/skills/typescript.png" },
      { name: "JavaScript", image: "/images/skills/javascript.png" },
      { name: "Dart", image: "/images/skills/dart.png" },
      { name: "Python", image: "/images/skills/python.png" },
      { name: "Java", image: "/images/skills/java.png" },
      { name: "C#", image: "/images/skills/csharp.png" },
    ],
  },
  {
    key: "frontend",
    items: [
      { name: "Next.js", image: "/images/skills/nextjs.png" },
      { name: "Flutter", image: "/images/skills/flutter.png" },
      { name: "Angular", image: "/images/skills/angular.png" },
      { name: "React", image: "/images/skills/react.png" },
      { name: "Expo", image: "/images/skills/expo.png" },
      { name: "Vue", image: "/images/skills/vue.svg" },
      { name: "Three.js", image: "/images/skills/threejs.png" },
      { name: "Unity", image: "/images/skills/unity.png" },
      { name: "JavaFX", image: "/images/skills/javafx.png" },
    ],
  },
  {
    key: "styling",
    items: [
      { name: "Tailwind CSS", image: "/images/skills/tailwind.png" },
      { name: "HTML", image: "/images/skills/html.png" },
      { name: "CSS", image: "/images/skills/css.png" },
      { name: "Bootstrap", image: "/images/skills/bootstrap.png" },
    ],
  },
  {
    key: "backend",
    rows: [3, 3],
    items: [
      { name: "Express.js", image: "/images/skills/express.png" },
      { name: "NestJS", image: "/images/skills/nestjs.svg" },
      { name: "Node.js", image: "/images/skills/nodejs.png" },
      { name: "Socket.IO", image: "/images/skills/socketio.svg" },
      { name: "FastAPI", image: "/images/skills/fastapi.png" },
      { name: "Spring Boot", image: "/images/skills/spring.png" },
    ],
  },
  {
    key: "databases",
    rows: [3, 3],
    items: [
      { name: "PostgreSQL", image: "/images/skills/postgre.png" },
      { name: "Redis", image: "/images/skills/redis.png" },
      { name: "MongoDB", image: "/images/skills/mongodb.svg" },
      { name: "Firebase", image: "/images/skills/firebase.png" },
      { name: "MySQL", image: "/images/skills/mysql.png" },
      { name: "Sequelize", image: "/images/skills/sequelize.svg" },
    ],
  },
  {
    key: "devops",
    items: [
      { name: "Docker", image: "/images/skills/docker.png" },
      { name: "Linux", image: "/images/skills/linux.png" },
      { name: "Nginx", image: "/images/skills/nginx.svg" },
      { name: "AWS", image: "/images/skills/aws.svg" },
      { name: "Cloudflare", image: "/images/skills/cloudflare.png" },
      { name: "Vercel", image: "/images/skills/vercel.png" },
      { name: "Railway", image: "/images/skills/railway.png" },
      { name: "GitLab CI/CD", image: "/images/skills/gitlab.svg" },
      { name: "Ansible", image: "/images/skills/ansible.svg" },
    ],
  },
  {
    key: "ai",
    items: [
      { name: "Claude Code", image: "/images/skills/claude-code.svg" },
      { name: "Cursor", image: "/images/skills/cursor.svg" },
      { name: "Codex", image: "/images/skills/codex.svg" },
      { name: "GitHub Copilot", image: "/images/skills/copilot.svg" },
    ],
  },
  {
    key: "tools",
    items: [
      { name: "Git", image: "/images/skills/git.png" },
      { name: "Postman", image: "/images/skills/postman.png" },
      { name: "Figma", image: "/images/skills/figma.png" },
      { name: "Google Analytics", image: "/images/skills/ga.png" },
    ],
  },
  {
    key: "iot",
    rows: [2],
    items: [
      { name: "IoT", image: "/images/skills/iot.svg" },
      { name: "Raspberry Pi", image: "/images/skills/raspberrypi.svg" },
    ],
  },
];

/** Every skill as one flat list. */
export const skills = skillGroups.flatMap((g) => g.items);

/** About section: the favourite-tech slider. */
export const favoriteTech = [
  { name: "TypeScript", image: "/images/skills/typescript.png" },
  { name: "Next.js", image: "/images/skills/nextjs.png" },
  { name: "Tailwind CSS", image: "/images/skills/tailwind.png" },
  { name: "Flutter", image: "/images/skills/flutter.png" },
  { name: "Expo", image: "/images/skills/expo.png" },
  { name: "Express.js", image: "/images/skills/express.png" },
  { name: "Python", image: "/images/skills/python.png" },
  { name: "Redis", image: "/images/skills/redis.png" },
  { name: "PostgreSQL", image: "/images/skills/postgre.png" },
  { name: "Firebase", image: "/images/skills/firebase.png" },
  { name: "Docker", image: "/images/skills/docker.png" },
];

// Currently learning (not shown at the moment):
// const learnings = {
//   "Kotlin": "/images/skills/kotlin.png",
//   "Angular": "/images/skills/angular.png",
//   "PHP": "/images/skills/php.png",
//   "Laravel": "/images/skills/laravel.png",
//   ".NET": "/images/skills/dotnet.svg"
// };
