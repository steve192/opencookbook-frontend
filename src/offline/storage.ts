import Storage from 'expo-sqlite/kv-store';

// SQLite rather than AsyncStorage, whose Android database stops at 6 MB.
export const persistStorage = Storage;

export const requestPersistentStorage = async () => undefined;

export const storageUsage = async (): Promise<number | null> => null;
