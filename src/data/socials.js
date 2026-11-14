// Social / profile links. `hero: true` ones also show under the hero headline; all of them show in Contact.
// Icons live in public/images/socials/. (index.html's JSON-LD `sameAs` lists the same profiles for search engines.)
export const socials = [
  { name: 'GitHub', href: 'https://github.com/RaksaOC', icon: '/images/socials/github.png', hero: true },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/ory-chanraksa-1702b6263/', icon: '/images/socials/linkedin.png', hero: true },
  { name: 'Upwork', href: 'https://www.upwork.com/freelancers/~0193c96741cd57f0f1?mp_source=share', icon: '/images/socials/upwork.png' },
  { name: 'Facebook', href: 'https://www.facebook.com/ory.chanraksa/', icon: '/images/socials/facebook.png' },
  { name: 'YouTube', href: 'https://www.youtube.com/@raksa7276', icon: '/images/socials/yt.png' },
  { name: 'Telegram', href: 'https://t.me/chanraksaOry', icon: '/images/socials/telegram.png' },
]

export const heroSocials = socials.filter((s) => s.hero)
