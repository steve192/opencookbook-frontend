import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import de from './de.json';
import en from './en.json';
import {deviceLanguage} from './locale';

export const resources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
} as const;

console.debug('Detected locale', deviceLanguage);

i18n.use(initReactI18next).init({
  lng: deviceLanguage,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  resources,
});
