// One process: the callers' own single flight is all the locking there is.
export const withTabLock = <T>(_name: string, task: () => Promise<T>, _options?: {ifAvailable?: boolean}):
  Promise<T | undefined> => task();
