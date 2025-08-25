import { useI18n } from 'vue-i18n';

export const langOptions = [
  { flag: 'fi-fr', lang: 'Français', value: 'fr' },
  { flag: 'fi-us', lang: 'English', value: 'en' },
];

export const savedLang = localStorage.getItem('lang') || 'fr';

export function useLanguage() {
  const { locale } = useI18n();

  const initLanguage = () => {
    locale.value = savedLang;
  };

  const switchLanguage = (language: string) => {
    if (!language) return;
    localStorage.setItem('lang', language);
    locale.value = language;
  };

  return { switchLanguage, initLanguage };
}
