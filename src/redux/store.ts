import {combineReducers, configureStore, Reducer} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
import Constants from 'expo-constants';
import {
  FLUSH, PAUSE, PERSIST, PersistConfig, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE,
} from 'redux-persist';
import {api} from '../api/api';
import {onSessionRejected} from '../api/session';
import {cacheVersionOf, keepOnlyVersion} from '../offline/cacheVersion';
import connectivityReducer, {selectIsOnline} from '../offline/connectivitySlice';
import {registerOfflineListeners} from '../offline/listeners';
import {persistStorage} from '../offline/storage';
import authSlice, {logout} from './features/authSlice';
import settingsSlice from './features/settingsSlice';
import shoppingSlice from './features/shoppingSlice';
import timersSlice from './features/timersSlice';
import {listenerMiddleware} from './listenerMiddleware';

const CACHE_VERSION = cacheVersionOf(Constants.expoConfig?.version ?? '0');

const persisted = <S, >(key: string, reducer: Reducer<S>, config: Partial<PersistConfig<S>> = {}) =>
  persistReducer<S>({
    key,
    storage: persistStorage,
    throttle: 1000,
    // Never give up waiting for the storage: rehydrating nothing would then overwrite what is stored.
    timeout: 0,
    ...config,
  }, reducer);

const ofThisVersion = {version: CACHE_VERSION, migrate: keepOnlyVersion(CACHE_VERSION)};

const rootReducer = combineReducers({
  auth: authSlice,
  settings: settingsSlice,
  timers: timersSlice,
  // Unsent shopping changes survive app updates; only the cache is tied to a version.
  shopping: persisted('shopping', shoppingSlice),
  connectivity: persisted('connectivity', connectivityReducer, {...ofThisVersion, whitelist: ['lastSyncedAt']}),
  // RTK Query restores its own entries from the rehydrate action (extractRehydrationInfo).
  [api.reducerPath]: persisted(api.reducerPath, api.reducer,
      {...ofThisVersion, whitelist: ['queries', 'mutations', 'provided'], stateReconciler: false}),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]},
  }).prepend(listenerMiddleware.middleware).concat(api.middleware),
});

export const persistor = persistStore(store);

registerOfflineListeners();

// The server refused the refresh token: the sign in is over, wherever the app happens to be.
onSessionRejected(() => store.dispatch(logout()));

// RTK Query refetches on reconnect by what this app knows about the server, not by navigator.onLine.
setupListeners(store.dispatch, (dispatch, {onOnline, onOffline}) => {
  let online = selectIsOnline(store.getState());
  return store.subscribe(() => {
    const now = selectIsOnline(store.getState());
    if (now !== online) {
      online = now;
      dispatch(now ? onOnline() : onOffline());
    }
  });
});

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
