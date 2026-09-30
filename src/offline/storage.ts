import Storage from 'expo-sqlite/kv-store';

// SQLite rather than AsyncStorage, whose Android database stops at 6 MB.
export const persistStorage = Storage;

export const requestPersistentStorage = () => Promise.resolve();

export const storageUsage = (): Promise<number | null> => Promise.resolve(null);
