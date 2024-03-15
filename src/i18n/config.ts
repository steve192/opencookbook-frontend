import * as Localization from 'expo-localization';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import de from './de.json';
import en from './en.json';

export const resources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
} as const;

const locale = Localization.getLocales()[0].languageCode ?? 'en';

console.debug('Detected locale', locale);
i18n.use(initReactI18next).init({
  lng: locale,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  resources,
});
