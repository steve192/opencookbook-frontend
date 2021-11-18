import i18n from 'i18next';
import en from './en.json';
import de from './de.json';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

export const resources = {
  en: {
    translation: en,
  },
  de: {
    translation: de
  }
} as const;

const locale = Localization.locale.split("-")[0];

console.debug("Detected locale", locale);
i18n.use(initReactI18next).init({
  lng: locale,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  resources,
});