import * as Localization from 'expo-localization';

export const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';

/** What the device measures in; only "us" means imperial units in the kitchen. */
export const deviceMeasurementSystem = Localization.getLocales()[0]?.measurementSystem ?? null;
