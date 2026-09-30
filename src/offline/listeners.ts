import {api} from '../api/api';
import {apiUrl, client, PROBE_TIMEOUT_MILLIS} from '../api/client';
import {clearTokens} from '../api/session';
import {login, logout, sessionRestored} from '../redux/features/authSlice';
import {startAppListening} from '../redux/listenerMiddleware';
import {probeRequested, selectIsOnline, wentOnline} from './connectivitySlice';
import {clearImageCache} from './imageCache';
import {requestPersistentStorage} from './storage';
import {syncForOffline} from './sync';

const PROBE_DELAYS_MILLIS = [5_000, 10_000, 30_000];
const STEADY_PROBE_MILLIS = 60_000;
const SYNC_EVERY_MILLIS = 60 * 60 * 1000;

const serverReachable = async () => {
  try {
    await client.get(await apiUrl('/instance'), {timeout: PROBE_TIMEOUT_MILLIS});
    return true;
  } catch {
    return false;
  }
};

export const registerOfflineListeners = () => {
  // Until the server answers again: soon at first, then once a minute, and at once when asked.
  startAppListening({
    predicate: (_action, current, previous) => selectIsOnline(previous) && !selectIsOnline(current),
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();
      let attempt = 0;
      while (!selectIsOnline(listenerApi.getState())) {
        await listenerApi.condition(probeRequested.match, PROBE_DELAYS_MILLIS[attempt] ?? STEADY_PROBE_MILLIS);
        attempt++;
        if (await serverReachable()) {
          listenerApi.dispatch(wentOnline());
        }
      }
    },
  });

  // After signing in and on every start signed in, then hourly until signing out.
  startAppListening({
    predicate: (action) => login.match(action) || (sessionRestored.match(action) && action.payload),
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();
      void requestPersistentStorage();
      do {
        void listenerApi.dispatch(syncForOffline());
      } while (!await listenerApi.condition(logout.match, SYNC_EVERY_MILLIS));
    },
  });

  // Back online after a while offline: whatever changed meanwhile is fetched.
  startAppListening({
    actionCreator: wentOnline,
    effect: (_action, listenerApi) => {
      const {lastSyncedAt} = listenerApi.getState().connectivity;
      if (lastSyncedAt === null || Date.now() - lastSyncedAt > SYNC_EVERY_MILLIS) {
        void listenerApi.dispatch(syncForOffline());
      }
    },
  });

  // Nothing of an account stays on the device once it is signed out; the slices reset themselves.
  startAppListening({
    actionCreator: logout,
    effect: async (_action, listenerApi) => {
      await clearTokens();
      listenerApi.dispatch(api.util.resetApiState());
      await clearImageCache();
    },
  });
};
