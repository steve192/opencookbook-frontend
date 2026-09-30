// One tab at a time; with ifAvailable, a tab that finds the lock taken skips the task.
export const withTabLock = <T>(name: string, task: () => Promise<T>, options?: {ifAvailable?: boolean}):
  Promise<T | undefined> =>
  // Plain http origins have no Web Locks.
  navigator.locks ? navigator.locks.request(name, options ?? {}, (lock) => lock ? task() : undefined) : task();
