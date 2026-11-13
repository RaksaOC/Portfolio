// Structured project details for the full-screen viewer (ImageLightbox.vue), keyed like projects.items.
// Every field is optional; the viewer only shows what's there:
//   summary     one-line overview
//   org         organisation / client it was built for
//   company     where it was built
//   role        my role
//   platform    web / mobile / desktop / CLI ...
//   users       who uses it / scale
//   highlights  key features (list)
//   shots       captions for individual screenshots, keyed by file name (e.g. '3.jpg'); screenshots
//               without one are shown centred on their own
// Avoid the characters { } @ | in the text (vue-i18n syntax).

const CAMCYBER = 'CamCyber Digital Tech Team'

export const en = {
  fields: {
    overview: 'Overview',
    org: 'Organisation',
    company: 'Built at',
    role: 'My role',
    platform: 'Platform',
    users: 'Users',
    year: 'Year',
    highlights: 'Highlights',
    stack: 'Tech stack',
    screenshot: 'Screenshot',
  },
  details: {
    mlmupc: {
      summary: 'A ministry-wide HR platform that takes civil-servant administration fully digital.',
      org: 'Ministry of Land Management, Urban Planning and Construction',
      company: CAMCYBER,
      role: 'Full-stack developer and project technical lead',
      platform: 'Web and mobile',
      users: 'Nearly 3,000 officers',
      highlights: ['Attendance with QR check-in and check-out', 'Leave and request workflows', 'Digital civil-servant records'],
    },
    nis: {
      summary: 'A government HR platform with on-site biometric check-ins connected to the cloud.',
      org: 'National Institute of Statistics, Ministry of Planning',
      company: CAMCYBER,
      role: 'Full-stack developer and project technical lead',
      platform: 'Web, mobile and face-scanner terminals',
      users: '500+ officers',
      highlights: ['Attendance, leave and personnel records', 'Face-scanner terminals paired with the cloud', 'Real-time check-ins'],
    },
    ccn: {
      summary: 'The national registration and licensing platform for nurses in Cambodia.',
      org: 'Cambodian Council of Nurses',
      company: CAMCYBER,
      role: 'Mobile developer, building the Flutter app and owning its store releases',
      platform: 'iOS and Android',
      users: 'Nurses nationwide',
      highlights: ['Registration and membership applications', 'Licence and CPD applications with multi-step approvals', 'QR-verifiable certificates'],
    },
    phumiyerng: {
      summary: 'A community tourism and marketplace app for rural Cambodia.',
      org: 'LASED III, a Royal Government of Cambodia land programme backed by the World Bank',
      company: CAMCYBER,
      role: 'Full-stack developer',
      platform: 'Mobile and web',
      users: '19 rural communities',
      highlights: ['Community trips and homestays', 'Farm-fresh products marketplace', 'Every community on one platform'],
    },
    komplex: {
      summary: 'An education platform built for Khmer students.',
      platform: 'Web and mobile',
      users: 'Khmer students',
      highlights: ['Curriculum-aligned interactive lessons', 'AI tutor', 'Study utilities and community features'],
    },
    quicknews: {
      summary: 'A news app delivering credible news from verified creators.',
      org: 'Quicknews',
      role: 'Full-stack developer and technical operations intern',
      platform: 'Web',
      highlights: ['News from verified creators', 'Credibility-first reading experience'],
    },
    grandCineplex: {
      summary: 'A cinema operations web app with an interface for every role.',
      platform: 'Web',
      users: 'Customers, cashiers and managers',
      highlights: ['Browse and reserve tickets', 'Cashier payments with ABA PayWay', 'Manager tools for running the cinema'],
    },
    grandCineplexDba: {
      summary: 'A custom database administration tool for Grand Cineplex.',
      platform: 'Web',
      highlights: ['Dashboard', 'Roles and permissions', 'Query console', 'Schema visualisation'],
    },
    vMenu: {
      summary: 'Digital ordering and management for restaurants.',
      platform: 'Web',
      users: 'Diners, chefs, cashiers and owners',
      highlights: ['Scan a QR code to order', 'Live orders for the kitchen', 'Payments for cashiers', 'Multi-restaurant management'],
    },
    jouEm: {
      summary: 'A fruit-merging puzzle game rooted in Cambodian culture.',
      platform: 'Game',
      highlights: ['Traditional Khmer fruits', 'Ancient temple setting', 'Game backend with Express and MongoDB'],
    },
    lms: {
      summary: 'A desktop learning management system.',
      platform: 'Desktop',
      users: 'Admins, teachers and students',
      highlights: ['Course management', 'Student enrolment', 'Teacher assignments', 'Separate admin, teacher and student apps'],
    },
    dakLouk: {
      summary: 'An offline marketplace app for merchants and buyers.',
      platform: 'Mobile, works offline',
      users: 'Merchants and buyers',
      highlights: ['Product listings and ordering', 'Live streams', 'Posts'],
    },
    noteDown: {
      summary: 'A full-stack app for taking and organising notes.',
      platform: 'Web',
      highlights: ['Create and organise notes', 'Spring Boot REST API', 'Built to explore client-server communication'],
    },
    quizzy: {
      summary: 'Educational games and quizzes made for kids.',
      platform: 'Web',
      users: 'Kids',
      highlights: ['Interactive games and quizzes', 'Colourful animations', 'Fun sound effects'],
    },
    keebs: {
      summary: 'Browse, test and buy mechanical keyboards.',
      platform: 'Web',
      highlights: ['3D keyboard viewer', 'Live sound tests', 'Cart and checkout'],
    },
    bestWay: {
      summary: 'A company website for a Cambodian logistics firm.',
      org: 'BestWay, a logistics company in Cambodia',
      platform: 'Web',
      highlights: ['Company profile', 'Services showcase'],
    },
    mcdonald: {
      summary: "A front-end replica of McDonald's official website.",
      platform: 'Web (front end)',
      highlights: ['Professional layout recreated from scratch', 'Responsive on every screen size'],
    },
    dartClinic: {
      summary: 'A command-line hospital management system.',
      platform: 'Command line',
      highlights: ['Patients and doctors', 'Appointments', 'Rooms and hospital operations'],
    },
    bus: {
      summary: 'A command-line bus reservation system.',
      platform: 'Command line',
      users: 'Passengers and admins',
      highlights: ['Book and refund seats', 'Bus and admin account management', 'Lightweight JSON storage'],
    },
    portfolio3d: {
      summary: 'My previous portfolio, built as an interactive 3D website.',
      platform: 'Web',
      highlights: ['Three.js 3D scenes', 'About, skills, projects and experience'],
    },
  },
}

const CAMCYBER_KM = 'ក្រុមបច្ចេកទេសឌីជីថល CamCyber'

export const km = {
  fields: {
    overview: 'ទិដ្ឋភាពទូទៅ',
    org: 'ស្ថាប័ន',
    company: 'អភិវឌ្ឍនៅ',
    role: 'តួនាទីរបស់ខ្ញុំ',
    platform: 'វេទិកា',
    users: 'អ្នកប្រើប្រាស់',
    year: 'ឆ្នាំ',
    highlights: 'ចំណុចសំខាន់ៗ',
    stack: 'បច្ចេកវិទ្យា',
    screenshot: 'រូបថតអេក្រង់',
  },
  details: {
    mlmupc: {
      summary: 'វេទិកាគ្រប់គ្រងធនធានមនុស្សទូទាំងក្រសួង ដែលធ្វើឱ្យរដ្ឋបាលមន្ត្រីរាជការក្លាយជាឌីជីថលទាំងស្រុង។',
      org: 'ក្រសួងរៀបចំដែនដី នគរូបនីយកម្ម និងសំណង់',
      company: CAMCYBER_KM,
      role: 'អ្នកអភិវឌ្ឍ Full-stack និងប្រធានផ្នែកបច្ចេកទេសនៃគម្រោង',
      platform: 'វេប និងទូរសព្ទ',
      users: 'មន្ត្រីជិត ៣.០០០ នាក់',
      highlights: ['ចុះវត្តមានចូល-ចេញដោយស្កេន QR', 'ដំណើរការច្បាប់ឈប់សម្រាក និងសំណើ', 'ប្រវត្តិរូបមន្ត្រីរាជការជាឌីជីថល'],
    },
    nis: {
      summary: 'វេទិកាធនធានមនុស្សរបស់រដ្ឋាភិបាល ដែលភ្ជាប់ការចុះវត្តមានជីវមាត្រនៅទីតាំងទៅកាន់ប្រព័ន្ធក្លោដ។',
      org: 'វិទ្យាស្ថានជាតិស្ថិតិ ក្រសួងផែនការ',
      company: CAMCYBER_KM,
      role: 'អ្នកអភិវឌ្ឍ Full-stack និងប្រធានផ្នែកបច្ចេកទេសនៃគម្រោង',
      platform: 'វេប ទូរសព្ទ និងម៉ាស៊ីនស្កេនមុខ',
      users: 'មន្ត្រីជាង ៥០០ នាក់',
      highlights: ['វត្តមាន ច្បាប់ឈប់សម្រាក និងប្រវត្តិរូបបុគ្គលិក', 'ម៉ាស៊ីនស្កេនមុខភ្ជាប់ជាមួយប្រព័ន្ធក្លោដ', 'ការចុះវត្តមានភ្លាមៗ'],
    },
    ccn: {
      summary: 'វេទិកាចុះឈ្មោះ និងផ្តល់អាជ្ញាប័ណ្ណថ្នាក់ជាតិសម្រាប់គិលានុបដ្ឋាកនៅកម្ពុជា។',
      org: 'គណៈគិលានុបដ្ឋាកកម្ពុជា',
      company: CAMCYBER_KM,
      role: 'អ្នកអភិវឌ្ឍកម្មវិធីទូរសព្ទ បង្កើតកម្មវិធី Flutter និងទទួលខុសត្រូវការដាក់ឱ្យប្រើប្រាស់',
      platform: 'iOS និង Android',
      users: 'គិលានុបដ្ឋាកទូទាំងប្រទេស',
      highlights: ['ការចុះឈ្មោះ និងស្នើសុំសមាជិកភាព', 'ស្នើសុំអាជ្ញាប័ណ្ណ និង CPD តាមការអនុម័តច្រើនជំហាន', 'វិញ្ញាបនបត្រដែលអាចផ្ទៀងផ្ទាត់តាម QR'],
    },
    phumiyerng: {
      summary: 'កម្មវិធីទេសចរណ៍សហគមន៍ និងទីផ្សារសម្រាប់តំបន់ជនបទកម្ពុជា។',
      org: 'គម្រោង LASED III របស់រាជរដ្ឋាភិបាលកម្ពុជា ក្រោមការគាំទ្ររបស់ធនាគារពិភពលោក',
      company: CAMCYBER_KM,
      role: 'អ្នកអភិវឌ្ឍ Full-stack',
      platform: 'ទូរសព្ទ និងវេប',
      users: 'សហគមន៍ជនបទចំនួន ១៩',
      highlights: ['ដំណើរកម្សាន្ត និងផ្ទះស្នាក់នៅក្នុងសហគមន៍', 'ទីផ្សារផលិតផលស្រស់ៗពីកសិករ', 'សហគមន៍ទាំងអស់នៅលើវេទិកាតែមួយ'],
    },
    komplex: {
      summary: 'វេទិកាអប់រំដែលបង្កើតឡើងសម្រាប់សិស្សខ្មែរ។',
      platform: 'វេប និងទូរសព្ទ',
      users: 'សិស្សខ្មែរ',
      highlights: ['មេរៀនអន្តរកម្មស្របតាមកម្មវិធីសិក្សា', 'គ្រូបង្រៀន AI', 'ឧបករណ៍ជំនួយការសិក្សា និងមុខងារសហគមន៍'],
    },
    quicknews: {
      summary: 'កម្មវិធីព័ត៌មានដែលផ្តល់ព័ត៌មានគួរឱ្យទុកចិត្តពីអ្នកបង្កើតមាតិកាដែលបានផ្ទៀងផ្ទាត់។',
      org: 'Quicknews',
      role: 'កម្មសិក្សាការីអ្នកអភិវឌ្ឍ Full-stack និងប្រតិបត្តិការបច្ចេកទេស',
      platform: 'វេប',
      highlights: ['ព័ត៌មានពីអ្នកបង្កើតមាតិកាដែលបានផ្ទៀងផ្ទាត់', 'បទពិសោធន៍អានដែលផ្តោតលើភាពគួរឱ្យទុកចិត្ត'],
    },
    grandCineplex: {
      summary: 'កម្មវិធីវេបគ្រប់គ្រងប្រតិបត្តិការរោងភាពយន្ត ដែលមានចំណុចប្រទាក់សម្រាប់គ្រប់តួនាទី។',
      platform: 'វេប',
      users: 'អតិថិជន អ្នកគិតលុយ និងអ្នកគ្រប់គ្រង',
      highlights: ['រកមើល និងកក់សំបុត្រ', 'ការទូទាត់តាម ABA PayWay សម្រាប់អ្នកគិតលុយ', 'ឧបករណ៍សម្រាប់អ្នកគ្រប់គ្រងរោងភាពយន្ត'],
    },
    grandCineplexDba: {
      summary: 'ឧបករណ៍គ្រប់គ្រងមូលដ្ឋានទិន្នន័យផ្ទាល់ខ្លួនសម្រាប់ Grand Cineplex។',
      platform: 'វេប',
      highlights: ['ផ្ទាំងគ្រប់គ្រង', 'តួនាទី និងសិទ្ធិ', 'កុងសូលសំណួរ', 'ការបង្ហាញរចនាសម្ព័ន្ធទិន្នន័យ'],
    },
    vMenu: {
      summary: 'ការកម្ម៉ង់ និងគ្រប់គ្រងភោជនីយដ្ឋានបែបឌីជីថល។',
      platform: 'វេប',
      users: 'អតិថិជន ចុងភៅ អ្នកគិតលុយ និងម្ចាស់',
      highlights: ['ស្កេន QR ដើម្បីកម្ម៉ង់', 'ការកម្ម៉ង់ផ្ទាល់សម្រាប់ផ្ទះបាយ', 'ការទូទាត់សម្រាប់អ្នកគិតលុយ', 'គ្រប់គ្រងភោជនីយដ្ឋានច្រើន'],
    },
    jouEm: {
      summary: 'ហ្គេមផ្គុំផ្លែឈើដែលចាក់ឫសក្នុងវប្បធម៌កម្ពុជា។',
      platform: 'ហ្គេម',
      highlights: ['ផ្លែឈើខ្មែរប្រពៃណី', 'បរិយាកាសប្រាសាទបុរាណ', 'ផ្នែកខាងក្រោយហ្គេមដោយ Express និង MongoDB'],
    },
    lms: {
      summary: 'ប្រព័ន្ធគ្រប់គ្រងការសិក្សាលើកុំព្យូទ័រ។',
      platform: 'កុំព្យូទ័រ',
      users: 'អ្នកគ្រប់គ្រង គ្រូ និងសិស្ស',
      highlights: ['គ្រប់គ្រងវគ្គសិក្សា', 'ការចុះឈ្មោះសិស្ស', 'ការចាត់តាំងគ្រូ', 'កម្មវិធីដាច់ដោយឡែកសម្រាប់អ្នកគ្រប់គ្រង គ្រូ និងសិស្ស'],
    },
    dakLouk: {
      summary: 'កម្មវិធីទីផ្សារក្រៅបណ្តាញសម្រាប់អ្នកលក់ និងអ្នកទិញ។',
      platform: 'ទូរសព្ទ ដំណើរការក្រៅបណ្តាញ',
      users: 'អ្នកលក់ និងអ្នកទិញ',
      highlights: ['ការដាក់លក់ផលិតផល និងការកម្ម៉ង់', 'ការផ្សាយផ្ទាល់', 'ប្រកាស'],
    },
    noteDown: {
      summary: 'កម្មវិធី Full-stack សម្រាប់កត់ត្រា និងរៀបចំកំណត់ចំណាំ។',
      platform: 'វេប',
      highlights: ['បង្កើត និងរៀបចំកំណត់ចំណាំ', 'REST API ដោយ Spring Boot', 'បង្កើតដើម្បីស្វែងយល់ពីការទំនាក់ទំនងរវាងម៉ាស៊ីនភ្ញៀវ និងម៉ាស៊ីនមេ'],
    },
    quizzy: {
      summary: 'ហ្គេម និងសំណួរអប់រំសម្រាប់កុមារ។',
      platform: 'វេប',
      users: 'កុមារ',
      highlights: ['ហ្គេម និងសំណួរអន្តរកម្ម', 'ចលនាចម្រុះពណ៌', 'សំឡេងកម្សាន្ត'],
    },
    keebs: {
      summary: 'រកមើល សាកល្បង និងទិញក្តារចុចមេកានិច។',
      platform: 'វេប',
      highlights: ['កម្មវិធីមើលក្តារចុច 3D', 'ការសាកល្បងសំឡេងផ្ទាល់', 'កន្ត្រក និងការទូទាត់'],
    },
    bestWay: {
      summary: 'គេហទំព័រក្រុមហ៊ុនសម្រាប់ក្រុមហ៊ុនដឹកជញ្ជូនមួយនៅកម្ពុជា។',
      org: 'BestWay ក្រុមហ៊ុនដឹកជញ្ជូននៅកម្ពុជា',
      platform: 'វេប',
      highlights: ['ប្រវត្តិក្រុមហ៊ុន', 'ការបង្ហាញសេវាកម្ម'],
    },
    mcdonald: {
      summary: "ការចម្លងផ្នែកខាងមុខនៃគេហទំព័រផ្លូវការរបស់ McDonald's។",
      platform: 'វេប (ផ្នែកខាងមុខ)',
      highlights: ['បង្កើតប្លង់អាជីពឡើងវិញពីដំបូង', 'ឆ្លើយតបគ្រប់ទំហំអេក្រង់'],
    },
    dartClinic: {
      summary: 'ប្រព័ន្ធគ្រប់គ្រងមន្ទីរពេទ្យតាម command-line។',
      platform: 'Command line',
      highlights: ['អ្នកជំងឺ និងវេជ្ជបណ្ឌិត', 'ការណាត់ជួប', 'បន្ទប់ និងប្រតិបត្តិការមន្ទីរពេទ្យ'],
    },
    bus: {
      summary: 'ប្រព័ន្ធកក់សំបុត្រឡានក្រុងតាម command-line។',
      platform: 'Command line',
      users: 'អ្នកដំណើរ និងអ្នកគ្រប់គ្រង',
      highlights: ['កក់ និងដកសំបុត្រ', 'គ្រប់គ្រងឡានក្រុង និងគណនីអ្នកគ្រប់គ្រង', 'រក្សាទុកទិន្នន័យដោយ JSON'],
    },
    portfolio3d: {
      summary: 'ផលប័ត្រមុនរបស់ខ្ញុំ ដែលបង្កើតជាគេហទំព័រ 3D អន្តរកម្ម។',
      platform: 'វេប',
      highlights: ['ឈុតឆាក 3D ដោយ Three.js', 'អំពីខ្ញុំ ជំនាញ គម្រោង និងបទពិសោធន៍'],
    },
  },
}
