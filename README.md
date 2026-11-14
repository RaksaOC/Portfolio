# 3D Personal Portfolio

Welcome to my 3D Personal Portfolio! This project showcases my web development skills in a visually stunning and interactive 3D environment. The portfolio is designed to highlight my work, skills, and experience in an engaging and modern way.

## 🔧 Tech Stack

- **Vue.js** - For building a reactive and smooth user interface
- **Three.js** - To create interactive 3D animations and visual effects
- **Bootstrap** - For responsive and sleek design components
- **Tailwind CSS** - For additional styling flexibility and utility-first classes

## 📱 Live Demo

Check out the live version of the portfolio on [raksa.netlify.app](https://raksa.netlify.app)

## 🎨 Features

- **Interactive 3D Design**: Enjoy an immersive experience with 3D animations powered by Three.js.
- **Responsive Layout**: Built with Bootstrap and Tailwind, making it look great on any device.
- **Showcase of Projects and Skills**: Explore my work through various sections designed to highlight key projects and achievements.
- **Sleek, Modern UI**: A visually appealing, modern design with smooth animations and transitions.

## 🚀 How It Works

This portfolio uses **Vue.js** to manage dynamic content and create an interactive experience. **Three.js** powers the 3D visuals, making the website come to life with smooth animations and transitions. The combination of **Bootstrap** and **Tailwind CSS** ensures the portfolio is responsive and adaptable to different screen sizes, from desktop to mobile.

## 📂 Project Structure

```
src/
  main.js, App.vue      entry: global styles, themes, page sections and floating UI
  sections/             one component per page section: Welcome, Hero, About, Skills, Projects, Experience, Contact, Footer
  components/
    layout/             NavBar, MobileNavBar, SettingsGear, CornerDock, BackToTop
    background/         Background (three.js canvas), GlassFilter (liquid-glass SVG filter)
    settings/           SettingsOverlay, ThemeIntro (reload reel)
    chat/               ChatBot (AI assistant UI)
    media/              ImageLightbox, MusicToggle
    cards/              ProjectCard, ExpCard, Skill
    common/             SectionIcon, RequestCV
  data/                 content as data: projects, skills, socials
  i18n/                 English / Khmer strings and project details
  core/                 app state and services: prefs (theme, mode), music, cursors, gfx, lenis, lightbox, corner, chat/
  themes/               one folder per theme (palette CSS, 3D scene, cursor, music, models), see src/themes/README.md
  styles/global.css     base tokens and site-wide styles (Monochrome palette)
  vendor/liquidglass/   third-party liquid-glass engine
  api/                  server code: chat (Gemini assistant), request-cv (emails the resume), context (assistant knowledge)
api/                    Vercel entry points only: each file re-exports its handler from src/api/
server.js               self-hosting server: serves dist/ and runs src/api/ (npm start)
public/                 static files served as-is
  images/{profile,projects,skills,socials}/   videos/projects/   documents/ (resume PDF)
  vendor/draco/         Draco decoder for compressed 3D models
  favicon, og-image, robots.txt, sitemap.xml  (kept at the root for browsers and crawlers)
```

## 🖥 Self-hosting (VPS)

Vercel serves `dist/` and runs `api/` for you. Anywhere else, `server.js` does both (Node 20.12+, no extra packages):

```bash
git clone <repo> portfolio && cd portfolio
npm ci
cp .env.example .env.local   # fill in SMTP_USER / SMTP_PASS / GEMINI_API_KEY (+ CV_PUBLIC_URL=https://your-domain)
npm run build
npm start                    # http://127.0.0.1:3000  (PORT / HOST env vars change it)
```

Keep it running with pm2 (`pm2 start npm --name portfolio -- start && pm2 save && pm2 startup`) or a systemd
service, and put a reverse proxy in front for HTTPS, e.g. Caddy: `your-domain.com { reverse_proxy 127.0.0.1:3000 }`.
With nginx, turn off buffering for `/api/chat` (`proxy_buffering off;`) so the AI answers stream.
To update: `git pull && npm ci && npm run build`, then restart.

## 🛠 Installation

To run this project locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/RaksaOC/Portfolio.git
```

2. Install dependencies:

```bash
cd Portfolio
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open your browser and go to `http://localhost:5173` to view the project.

## 💡 What I've Learned

- Advanced usage of **Vue.js** to create a dynamic and interactive user interface.
- Integrating **Three.js** to bring 3D models and animations to a web environment.
- Working with **Bootstrap** and **Tailwind CSS** to create a responsive and modern design.
- Enhanced skills in **JavaScript** for managing state and events in a real-time web application.

## 📑 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to add any additional information you think is important! The goal is to make it informative and engaging.