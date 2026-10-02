import Constants from 'expo-constants';

/**
 * Where to talk to when nobody has said otherwise: the default instance, set at build time in app.config.js.
 *
 * @return {string} the backend url
 */
export const defaultBackendUrl = (): string => Constants.expoConfig?.extra?.defaultApiUrl;
