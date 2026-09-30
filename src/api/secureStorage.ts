import * as SecureStore from 'expo-secure-store';

export type SecureKey = 'authToken' | 'refreshToken' | 'backendUrl';

export const readSecure = (key: SecureKey): Promise<string | null> => SecureStore.getItemAsync(key).catch(() => null);

export const writeSecure = (key: SecureKey, value: string): Promise<void> => SecureStore.setItemAsync(key, value);

export const removeSecure = (key: SecureKey): Promise<void> => SecureStore.deleteItemAsync(key);
