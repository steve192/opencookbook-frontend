import {createStore, del, get, set} from 'idb-keyval';

// IndexedDB rather than localStorage, which holds 5 MB and blocks the page while it writes.
const store = createStore('cookpal', 'persisted');

export const persistStorage = {
  getItem: async (key: string): Promise<string | null> => (await get<string>(key, store)) ?? null,
  setItem: (key: string, value: string): Promise<void> => set(key, value, store),
  removeItem: (key: string): Promise<void> => del(key, store),
};

// Otherwise the browser may evict the data under storage pressure, and Safari after 7 days unused.
export const requestPersistentStorage = async () => {
  await navigator.storage?.persist?.();
};

export const storageUsage = async (): Promise<number | null> =>
  (await navigator.storage?.estimate?.())?.usage ?? null;
