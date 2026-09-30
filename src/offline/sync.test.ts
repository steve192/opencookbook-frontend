import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {client} from '../api/client';

// The real endpoints and baseQuery; only the network and the device storage are faked.
vi.mock('../api/client');
vi.mock('../api/secureStorage');
const prefetchImage = vi.fn(async (_request: unknown) => undefined);
vi.mock('./imageCache', () => ({prefetchImage: (image: unknown) => prefetchImage(image)}));

const {api} = await import('../api/api');
const {syncForOffline, SYNCED_WEEKS} = await import('./sync');
const {default: connectivity, wentOffline} = await import('./connectivitySlice');
const {default: auth, login, logout} = await import('../redux/features/authSlice');

const request = vi.mocked(client.request);

const SERVER: Record<string, unknown> = {
  '/users/self': {email: 'anna@example.test'},
  '/instance': {termsOfService: '', sharingEnabled: true, householdsEnabled: true, ocrImportEnabled: false,
    apiKeysEnabled: false},
  '/recipes': [
    {id: 1, title: 'Lasagne', images: [{uuid: 'lasagne-cover'}, {uuid: 'lasagne-step'}], mine: true},
    {id: 2, title: 'Salat', images: [], mine: false},
  ],
  '/recipe-groups': [],
  '/households': [],
  '/recipes/nutrition': [],
};

const pathOf = (config: AxiosRequestConfig) => config.url!.replace('https://cookpal.test/api/v1', '');
const requested = () => request.mock.calls.map(([config]) => pathOf(config));

const serve = async (config: AxiosRequestConfig) => {
  const path = pathOf(config);
  if (path.startsWith('/weekplan/')) {
    return {data: []};
  }
  if (path in SERVER) {
    return {data: SERVER[path]};
  }
  throw new Error('unexpected request for ' + path);
};

const unreachable = () => new AxiosError('Network Error');
const refused = (status: number) =>
  new AxiosError('Request failed', undefined, undefined, undefined, {status, data: {}} as AxiosResponse);

// More recipes than one batch of thumbnail downloads holds.
const cookbookOfSix = Array.from({length: 6}, (_, index) =>
  ({id: index + 1, title: 'Recipe ' + (index + 1), images: [{uuid: 'cover-' + (index + 1)}], mine: true}));

const signedInStore = () => {
  const store = configureStore({
    reducer: combineReducers({auth, connectivity, [api.reducerPath]: api.reducer}),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  store.dispatch(login());
  return store;
};

const sync = (store: ReturnType<typeof signedInStore>) => store.dispatch(syncForOffline() as never) as Promise<void>;

describe('syncForOffline', () => {
  const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

  beforeEach(() => {
    request.mockReset();
    request.mockImplementation(serve);
    prefetchImage.mockClear();
    info.mockClear();
  });

  it('reads everything the app shows offline, then the thumbnails', async () => {
    const store = signedInStore();

    await sync(store);

    expect(requested()).toEqual(expect.arrayContaining(
        ['/users/self', '/instance', '/recipes', '/recipe-groups', '/households', '/recipes/nutrition']));
    expect(requested().filter((path) => path.startsWith('/weekplan/'))).toHaveLength(SYNCED_WEEKS.length);
    expect(store.getState().connectivity.lastSyncedAt).not.toBeNull();
    // A list shows the first image of a recipe; a recipe without one needs nothing.
    expect(prefetchImage.mock.calls).toEqual([[{uuid: 'lasagne-cover', size: 'thumbnail'}]]);
  });

  it('stops at the first failure and does not call the data synced', async () => {
    request.mockImplementation(async (config) => {
      if (pathOf(config) === '/recipes') {
        throw unreachable();
      }
      return serve(config);
    });
    const store = signedInStore();

    await sync(store);

    expect(store.getState().connectivity.lastSyncedAt).toBeNull();
    expect(store.getState().connectivity.online).toBe(false);
    expect(requested()).not.toContain('/recipes/nutrition');
    expect(prefetchImage).not.toHaveBeenCalled();
    // Only the code: the error itself carries the request, and with it the access token.
    expect(info).toHaveBeenCalledWith('Sync for offline use stopped', 'NETWORK_UNREACHABLE');
  });

  it('goes on with the next thumbnail when the server refuses one', async () => {
    request.mockImplementation(async (config) => pathOf(config) === '/recipes' ? {data: cookbookOfSix} : serve(config));
    prefetchImage.mockRejectedValueOnce(refused(404));

    await sync(signedInStore());

    expect(prefetchImage).toHaveBeenCalledTimes(6);
    expect(info).not.toHaveBeenCalled();
  });

  it('stops prefetching thumbnails when the server cannot be reached', async () => {
    request.mockImplementation(async (config) => pathOf(config) === '/recipes' ? {data: cookbookOfSix} : serve(config));
    prefetchImage.mockRejectedValueOnce(unreachable());

    await sync(signedInStore());

    expect(prefetchImage).not.toHaveBeenCalledWith({uuid: 'cover-6', size: 'thumbnail'});
    expect(info).toHaveBeenCalledWith('Sync for offline use stopped', 'NETWORK_UNREACHABLE');
  });

  it('stops prefetching thumbnails once the sign in ended', async () => {
    request.mockImplementation(async (config) => pathOf(config) === '/recipes' ? {data: cookbookOfSix} : serve(config));
    const store = signedInStore();
    prefetchImage.mockImplementationOnce(async () => {
      store.dispatch(logout());
      throw refused(401);
    });

    await sync(store);

    // The rest of the first batch was already on its way.
    expect(prefetchImage).toHaveBeenCalledTimes(4);
  });

  it('asks nothing while offline', async () => {
    const store = signedInStore();
    store.dispatch(wentOffline('no-network'));

    await sync(store);

    expect(request).not.toHaveBeenCalled();
  });
});
