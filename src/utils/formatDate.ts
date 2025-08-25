import i18n from '../I18n';

/**
 * Formate une date selon la locale actuelle de vue-i18n.
 * @param date - Date, string ou timestamp à formater
 * @returns La date formatée en string
 */
export function formatDate(date: string | number | Date): string {
  const locale = i18n.global.locale.value === 'en' ? 'en-US' : 'fr-FR';
  return new Date(date).toLocaleString(locale);
}
