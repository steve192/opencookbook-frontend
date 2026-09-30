// The native app updates through expo-updates instead.
export const registerServiceWorker = (_onUpdateWaiting: (reload: () => void) => void) => Promise.resolve();
