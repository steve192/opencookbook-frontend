import {beforeEach, describe, expect, it, vi} from 'vitest';

// What the device keeps between two starts of the app.
const device = new Map<string, string>();
let appVersion = '1.19.0';

vi.mock('expo-constants', () => ({default: {get expoConfig() {
  return {version: appVersion};
}}}));
vi.mock('../offline/storage', () => ({
  persistStorage: {
    getItem: async (key: string) => device.get(key) ?? null,
    setItem: async (key: string, value: string) => void device.set(key, value),
    removeItem: async (key: string) => void device.delete(key),
  },
  requestPersistentStorage: async () => undefined,
  storageUsage: async () => null,
}));
vi.mock('../offline/imageCache', () => ({clearImageCache: async () => undefined, prefetchImage: async () => undefined}));
vi.mock('../api/secureStorage');
vi.mock('../api/client');

// One start of the app: a fresh store that rehydrates from what the device kept.
const start = async () => {
  vi.resetModules();
  // The reset makes the client a new one, so it is told again what to answer.
  const {client} = await import('../api/client');
  vi.mocked(client.request).mockImplementation(
      async () => ({data: [{id: 1, title: 'Lasagne', images: [], mine: true}]}));
  // The probe and the sync are not what these tests are about.
  vi.mocked(client.get).mockReturnValue(new Promise(() => undefined));
  const {store, persistor} = await import('./store');
  const {recipeEndpoints} = await import('../api/endpoints/recipes');
  const {login, logout} = await import('./features/authSlice');
  const {shoppingListsLoaded} = await import('./features/shoppingSlice');
  await new Promise<void>((resolve) => {
    const check = () => persistor.getState().bootstrapped && resolve();
    persistor.subscribe(check);
    check();
  });
  const cachedRecipes = () => recipeEndpoints.getRecipes.select()(store.getState()).data;
  return {store, persistor, recipeEndpoints, login, logout, shoppingListsLoaded, cachedRecipes};
};

const list = {id: 7, name: null, defaultList: true, householdId: null, householdName: null, version: 0};

describe('store persistence', () => {
  beforeEach(() => {
    device.clear();
    appVersion = '1.19.0';
  });

  it('brings back what was read before the app was closed', async () => {
    const first = await start();
    first.store.dispatch(first.login());
    await first.store.dispatch(first.recipeEndpoints.getRecipes.initiate());
    await first.persistor.flush();

    const second = await start();

    expect(second.cachedRecipes()).toEqual([{id: 1, title: 'Lasagne', images: [], mine: true, type: 'Recipe'}]);
  });

  it('drops the cache a different app version read, but keeps the shopping lists', async () => {
    const first = await start();
    first.store.dispatch(first.login());
    first.store.dispatch(first.shoppingListsLoaded([list]));
    await first.store.dispatch(first.recipeEndpoints.getRecipes.initiate());
    await first.persistor.flush();

    appVersion = '1.20.0';
    const second = await start();

    expect(second.cachedRecipes()).toBeUndefined();
    expect(second.store.getState().shopping.lists).toEqual([list]);
  });

  it('keeps nothing of an account that signed out', async () => {
    const first = await start();
    first.store.dispatch(first.login());
    first.store.dispatch(first.shoppingListsLoaded([list]));
    await first.store.dispatch(first.recipeEndpoints.getRecipes.initiate());
    first.store.dispatch(first.logout());
    await new Promise((resolve) => setTimeout(resolve, 0));
    await first.persistor.flush();

    const second = await start();

    expect(second.cachedRecipes()).toBeUndefined();
    expect(second.store.getState().shopping.lists).toEqual([]);
  });
});
