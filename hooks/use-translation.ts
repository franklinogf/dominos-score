import { useTranslation } from 'react-i18next';

/**
 * Custom hook for translations with better TypeScript support
 * Uses the react-i18next useTranslation hook under the hood
 */
export const useT = () => {
  const { t, i18n } = useTranslation();

  return {
    /**
     * Translate function
     * @param key - Translation key (e.g., 'common.loading' or 'game.title')
     * @param options - Translation options (interpolation values, etc.)
     */
    t,

    /**
     * Current language
     */
    language: i18n.language,

    /**
     * Change language
     * @param lang - Language code (e.g., 'en', 'es')
     */
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),

    /**
     * Available languages
     */
    languages: Object.keys(i18n.options.resources || {}),

    /**
     * Check if the app is ready (i18n is initialized)
     */
    isReady: i18n.isInitialized,
  };
};

export default useT;
