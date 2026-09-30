import * as Localization from 'expo-localization';

export const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
