import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {api} from '../api/api';
import {client} from '../api/client';
import auth from '../redux/features/authSlice';
import {listenerMiddleware} from '../redux/listenerMiddleware';
import connectivity, {probeRequested, wentOffline} from './connectivitySlice';
import {registerOfflineListeners} from './listeners';

vi.mock('../api/client');
vi.mock('../api/secureStorage');
// Both reach native modules, and neither is what these tests are about.
vi.mock('./storage', () => ({requestPersistentStorage: async () => undefined}));
vi.mock('./imageCache', () => ({clearImageCache: async () => undefined, prefetchImage: async () => undefined}));

const get = vi.mocked(client.get);

const offlineStore = () => configureStore({
  reducer: combineReducers({auth, connectivity, [api.reducerPath]: api.reducer}),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(api.middleware),
});

describe('the probe while offline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    get.mockReset();
    listenerMiddleware.clearListeners();
    registerOfflineListeners();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('asks the server after 5 s, 10 s and 30 s, then every 60 s', async () => {
    const waited: number[] = [];
    let previous = Date.now();
    get.mockImplementation(async () => {
      waited.push(Date.now() - previous);
      previous = Date.now();
      throw new AxiosError('Network Error');
    });
    const store = offlineStore();

    store.dispatch(wentOffline('unreachable'));
    await vi.advanceTimersByTimeAsync(5_000 + 10_000 + 30_000 + 3 * 60_000);

    expect(waited).toEqual([5_000, 10_000, 30_000, 60_000, 60_000, 60_000]);
    expect(get).toHaveBeenCalledWith('https://cookpal.test/api/v1/instance', {timeout: 5_000});
    expect(store.getState().connectivity.online).toBe(false);
  });

  it('asks at once when asked to, without waiting for its turn', async () => {
    get.mockRejectedValue(new AxiosError('Network Error'));
    const store = offlineStore();
    store.dispatch(wentOffline('no-network'));
    await vi.advanceTimersByTimeAsync(1_000);
    expect(get).not.toHaveBeenCalled();

    store.dispatch(probeRequested());
    await vi.advanceTimersByTimeAsync(0);

    expect(get).toHaveBeenCalledOnce();
  });

  it('brings the app back online when the server answers, and stops asking', async () => {
    get.mockRejectedValueOnce(new AxiosError('Network Error')).mockResolvedValue({data: {}});
    const store = offlineStore();

    store.dispatch(wentOffline('unreachable'));
    await vi.advanceTimersByTimeAsync(5_000);
    expect(store.getState().connectivity.online).toBe(false);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(store.getState().connectivity.online).toBe(true);
    await vi.advanceTimersByTimeAsync(10 * 60_000);

    expect(get).toHaveBeenCalledTimes(2);
  });
});
