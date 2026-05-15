import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '@/locales/en/translations';
import esTranslations from '@/locales/es/translations';

export const defaultNS = 'translations';
export const resources = {
  en: {
    translations: enTranslations,
  },
  es: {
    translations: esTranslations,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getLocales()[0]?.languageCode || 'en', // Use device language or fallback to English
  fallbackLng: 'en',
  defaultNS,
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  react: {
    useSuspense: false, // Disable suspense for React Native
  },
});

export default i18n;
