import { createI18n } from 'vue-i18n'
import fr from '../locales/fr.json'
import en from '../locales/en.json'

const messages = {
  fr,
  en,
}

const locale = localStorage.getItem('lang') === 'English' ? 'en' : 'fr'

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'fr',
  messages,
})

export default i18n
