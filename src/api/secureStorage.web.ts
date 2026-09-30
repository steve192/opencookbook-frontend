import AsyncStorage from '@react-native-async-storage/async-storage';
import type {SecureKey} from './secureStorage';

// Shared by every tab of the app, which is what lets a tab see that another one renewed.
export const readSecure = (key: SecureKey): Promise<string | null> => AsyncStorage.getItem(key);

export const writeSecure = (key: SecureKey, value: string): Promise<void> => AsyncStorage.setItem(key, value);

export const removeSecure = (key: SecureKey): Promise<void> => AsyncStorage.removeItem(key);
