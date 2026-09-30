import {PersistedState} from 'redux-persist';

// "1.19.0" as 1019000: cached answers belong to the app version that read them.
export const cacheVersionOf = (appVersion: string): number =>
  appVersion.split('.').reduce((version, part) => version * 1000 + Number(part), 0);

// A newer app drops the cache it did not read itself and fetches everything anew.
export const keepOnlyVersion = (version: number) => (state: PersistedState): Promise<PersistedState> =>
  Promise.resolve(state?._persist?.version === version ? state : undefined);
