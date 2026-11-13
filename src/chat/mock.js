// Demo answers for the AI chat while it isn't wired to Gemini (VITE_CHAT_MOCK). Streams canned markdown in
// small chunks so the whole UI (status, thinking dots, caret, Stop) can be seen working. Facts come from the
// site itself.

const ANSWERS = {
  en: {
    about: `**Raksa** (Ory Chanraksa) is a full-stack software engineer based in **Phnom Penh, Cambodia**.

- **Now:** Full-stack developer at **CamCyber Digital Tech Team**, building national-scale platforms for government ministries and public institutions, and project technical lead on the HR systems.
- **Also:** freelance full-stack work for clients, and a Computer Science (Software Engineering) student at **CADT**.
- **Before:** full-stack developer & technical operations intern at **Quicknews**.

He works across web, mobile and APIs, and cares about thoughtful system design, performance and clean architecture.`,
    projects: `Here are his **featured projects**:

| Project | What it is | Stack |
|---|---|---|
| MLMUPC HRM | Ministry-wide HR platform, ~3,000 officers | Angular, NestJS, Flutter |
| NIS HRM | Government HR with face-scanner check-ins, 500+ officers | Angular, NestJS, Raspberry Pi |
| CCN | National nurse registration & licensing app | Flutter, Firebase |
| PhumiYerng | Community tourism & marketplace (LASED III) | Flutter, Angular, NestJS |
| KOMPLEX | Education platform for Khmer students | Next.js, Expo, FastAPI |
| Grand Cineplex | Cinema operations web app | React, Express, PostgreSQL |

Tap any project in the **Projects** section to see screenshots and details.`,
    stack: `Raksa's main tools:

- **Frontend:** Angular, React, Next.js, Vue, Tailwind CSS, Three.js
- **Mobile:** Flutter, Expo
- **Backend:** NestJS, Express.js, FastAPI, Spring Boot, Socket.IO
- **Data:** PostgreSQL, Redis, MongoDB, MySQL, Firebase
- **DevOps:** Docker, Linux, GitLab CI/CD, Ansible, Vercel, Cloudflare

Most of his recent government work is **Angular + NestJS + Flutter + PostgreSQL**.`,
    contact: `The easiest ways to reach Raksa:

1. The **contact form** at the bottom of this page
2. The **Request CV** button, which emails you his resume straight away

He'd be glad to hear about roles, projects or collaborations.`,
    fallback: `I'm running in **demo mode** for now, so I can only answer a few things. Try asking:

- *Who is Raksa?*
- *Show his featured projects*
- *What's his tech stack?*
- *How can I contact him?*`,
  },
  km: {
    about: `**រក្សា** (អោយ ចន្ទ័រក្សា) គឺជាអ្នកអភិវឌ្ឍន៍កម្មវិធី Full-stack រស់នៅក្នុង **រាជធានីភ្នំពេញ**។

- **បច្ចុប្បន្ន៖** អ្នកអភិវឌ្ឍ Full-stack នៅ **CamCyber Digital Tech Team** បង្កើតវេទិកាទ្រង់ទ្រាយជាតិសម្រាប់ក្រសួង និងស្ថាប័នសាធារណៈ និងជាប្រធានផ្នែកបច្ចេកទេសលើគម្រោងប្រព័ន្ធធនធានមនុស្ស។
- **ផងដែរ៖** ការងារឯករាជ្យសម្រាប់អតិថិជន និងជានិស្សិតវិទ្យាសាស្ត្រកុំព្យូទ័រនៅ **CADT**។
- **មុននេះ៖** កម្មសិក្សាការីនៅ **Quicknews**។`,
    projects: `**គម្រោងលេចធ្លោ**របស់គាត់៖

| គម្រោង | អំពី | បច្ចេកវិទ្យា |
|---|---|---|
| MLMUPC HRM | ប្រព័ន្ធធនធានមនុស្សទូទាំងក្រសួង មន្ត្រីជិត ៣.០០០ នាក់ | Angular, NestJS, Flutter |
| NIS HRM | ប្រព័ន្ធធនធានមនុស្ស និងម៉ាស៊ីនស្កេនមុខ មន្ត្រីជាង ៥០០ នាក់ | Angular, NestJS, Raspberry Pi |
| CCN | កម្មវិធីចុះឈ្មោះ និងអាជ្ញាប័ណ្ណគិលានុបដ្ឋាក | Flutter, Firebase |
| PhumiYerng | ទេសចរណ៍សហគមន៍ និងទីផ្សារ (LASED III) | Flutter, Angular, NestJS |

ចុចលើគម្រោងណាមួយក្នុងផ្នែក **គម្រោង** ដើម្បីមើលរូបភាព និងព័ត៌មានលម្អិត។`,
    stack: `បច្ចេកវិទ្យាសំខាន់ៗរបស់រក្សា៖

- **ផ្នែកខាងមុខ៖** Angular, React, Next.js, Vue, Tailwind CSS
- **ទូរសព្ទ៖** Flutter, Expo
- **ផ្នែកខាងក្រោយ៖** NestJS, Express.js, FastAPI, Spring Boot
- **ទិន្នន័យ៖** PostgreSQL, Redis, MongoDB, Firebase
- **DevOps៖** Docker, Linux, GitLab CI/CD, Ansible`,
    contact: `វិធីងាយបំផុតដើម្បីទាក់ទងរក្សា៖

1. **ទម្រង់ទំនាក់ទំនង**នៅខាងក្រោមទំព័រនេះ
2. ប៊ូតុង **ស្នើសុំប្រវត្តិរូប** ដែលផ្ញើប្រវត្តិរូបរបស់គាត់ទៅអ៊ីមែលរបស់អ្នកភ្លាមៗ`,
    fallback: `ខ្ញុំកំពុងដំណើរការក្នុង **របៀបសាកល្បង** ដូច្នេះអាចឆ្លើយបានតែសំណួរមួយចំនួន។ សាកសួរ៖

- *តើរក្សាជានរណា?*
- *បង្ហាញគម្រោងលេចធ្លោរបស់គាត់*
- *តើគាត់ប្រើបច្ចេកវិទ្យាអ្វីខ្លះ?*
- *តើខ្ញុំអាចទាក់ទងគាត់ដោយរបៀបណា?*`,
  },
}

const TOPICS = [
  ['projects', /project|portfolio|work|built|featured|គម្រោង/i],
  ['stack', /stack|skill|tech|language|framework|tool|បច្ចេកវិទ្យា|ជំនាញ/i],
  ['contact', /contact|email|hire|reach|cv|resume|ទាក់ទង|ប្រវត្តិរូប/i],
  ['about', /who|about|raksa|experience|job|yourself|assistant|នរណា|អំពី|បទពិសោធន៍/i],
]

const STATUS = {
  en: { projects: 'Looking through projects…', stack: 'Checking skills…', contact: 'Finding contact options…', about: 'Reading his experience…', fallback: 'Thinking…' },
  km: { projects: 'កំពុងមើលគម្រោង…', stack: 'កំពុងពិនិត្យជំនាញ…', contact: 'កំពុងរកវិធីទំនាក់ទំនង…', about: 'កំពុងអានបទពិសោធន៍…', fallback: 'កំពុងគិត…' },
}

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  const t = setTimeout(resolve, ms)
  signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
})

export async function* mockStream(message, locale, signal) {
  const lang = locale === 'km' || /[ក-៿]/.test(message) ? 'km' : 'en'
  const topic = TOPICS.find(([, re]) => re.test(message))?.[0] || 'fallback'
  yield { type: 'start' }
  yield { type: 'status', text: STATUS[lang][topic] }
  await sleep(900, signal)
  const text = ANSWERS[lang][topic]
  // stream in small, slightly uneven chunks (grapheme-safe enough for Khmer)
  const chars = [...text]
  for (let i = 0; i < chars.length;) {
    const n = 2 + Math.floor(Math.random() * 5)
    yield { type: 'delta', text: chars.slice(i, i + n).join('') }
    i += n
    await sleep(14 + Math.random() * 18, signal)
  }
  yield { type: 'end' }
}
