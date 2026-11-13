import { createI18n } from 'vue-i18n'
import en from './en.js'
import km from './km.js'
import * as projectDetails from './projectDetails.js'

// structured project details for the image viewer live in their own file
Object.assign(en.projects, projectDetails.en)
Object.assign(km.projects, projectDetails.km)

export const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'km', label: 'ខ្មែរ', name: 'ភាសាខ្មែរ' },
]

const KEY = 'lang'

function initialLocale() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved && LOCALES.some((l) => l.code === saved)) return saved
  } catch { /* storage blocked */ }
  return (navigator.language || '').toLowerCase().startsWith('km') ? 'km' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages: { en, km },
})

function applyDocumentLang(code) {
  document.documentElement.setAttribute('lang', code)
}

applyDocumentLang(i18n.global.locale.value)

export function setLocale(code) {
  i18n.global.locale.value = code
  applyDocumentLang(code)
  try { localStorage.setItem(KEY, code) } catch { /* storage blocked */ }
}
