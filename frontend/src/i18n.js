import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import hi from './locales/hi';

// For optimization, we only include the most used languages in the main bundle
// Others can be added dynamically or imported in a separate chunk
const resources = {
  en: en,
  hi: hi
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi', // Default to Hindi
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

/**
 * Lazy loads other languages to keep initial bundle small.
 * These will be bundled as separate chunks by the build tool.
 */
export const loadExtraLanguage = async (lng) => {
  if (i18n.hasResourceBundle(lng, 'translation')) return;

  try {
    let bundle;
    switch (lng) {
      case 'bn':
        bundle = (await import('./locales/bn')).default;
        break;
      case 'te':
        bundle = (await import('./locales/te')).default;
        break;
      case 'mr':
        bundle = (await import('./locales/mr')).default;
        break;
      case 'ta':
        bundle = (await import('./locales/ta')).default;
        break;
      default:
        // Load the consolidated 'others' bundle if it matches
        const others = (await import('./locales/others')).default;
        if (others[lng]) {
          bundle = others[lng];
        }
    }

    if (bundle) {
      i18n.addResourceBundle(lng, 'translation', bundle.translation || bundle);
    }
  } catch (error) {
    console.error(`Error loading language ${lng}:`, error);
  }
};

export default i18n;
