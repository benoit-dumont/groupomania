import Vue from 'vue';
import VueI18n from 'vue-i18n';
import fr from '../locales/fr.json';
import en from '../locales/en.json';

const messages = {
  fr,
  en,
};

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: localStorage.getItem('lang') === 'English' ? 'en' : 'fr', // set locale
  messages, // set locale messages
});

export default i18n;
