import {beforeEach, describe, expect, it, vi} from 'vitest';

// RestAPI pulls in axios, expo-secure-store and react-native, none of which
// resolve under the node test environment. The slice only ever calls
// setIsOnline, so a stub is enough and keeps the test on the reducer logic.
const setIsOnline = vi.fn();
vi.mock('../../dao/RestAPI', () => ({
  default: {setIsOnline: (value: boolean) => setIsOnline(value)},
}));
// Reached through authSlice; does not resolve under the node test environment.
vi.mock('../../AppPersistence', () => ({default: {clearOfflineData: () => undefined}}));

const {logout} = await import('./authSlice');
const {applyInstanceInfo, changeBackendUrl, changeOnlineState, changeShoppingProvider, changeTheme} =
  await import('./settingsSlice');
const reducer = (await import('./settingsSlice')).default;

const initialState = () => reducer(undefined, {type: '@@INIT'});

describe('settingsSlice', () => {
  beforeEach(() => setIsOnline.mockClear());

  it('starts on the system theme, online, with no backend url', () => {
    expect(initialState()).toEqual({
      theme: 'system', backendUrl: '', isOnline: true, sharingEnabled: true,
      householdsEnabled: true,
      ocrImportEnabled: false,
      apiKeysEnabled: false,
    });
  });

  // Assumed on until the instance says otherwise: the alternative is that a slow or failed
  // lookup silently removes a feature the instance does offer.
  it('assumes sharing is available before the instance has been asked', () => {
    expect(initialState().sharingEnabled).toBe(true);
  });

  // The opposite default to sharing, and deliberately so: most instances have no machine
  // learning subsystem at all, and offering a scan that cannot work is worse than offering
  // it a moment late.
  it('assumes recipe scanning is unavailable until the instance says otherwise', () => {
    expect(initialState().ocrImportEnabled).toBe(false);
  });

  it.each([true, false])('stores what the instance offers: %s', (enabled) => {
    const state = reducer(initialState(), applyInstanceInfo({
      sharingEnabled: enabled, householdsEnabled: enabled, ocrImportEnabled: enabled, apiKeysEnabled: enabled,
    }));
    expect(state).toMatchObject({
      sharingEnabled: enabled, householdsEnabled: enabled, ocrImportEnabled: enabled, apiKeysEnabled: enabled,
    });
  });

  it('takes a server from before api keys as having none', () => {
    const state = reducer(initialState(), applyInstanceInfo({
      sharingEnabled: true, householdsEnabled: true, ocrImportEnabled: false,
    }));
    expect(state.apiKeysEnabled).toBe(false);
  });

  it.each(['light', 'dark', 'system'] as const)('stores the %s theme', (theme) => {
    expect(reducer(initialState(), changeTheme(theme)).theme).toBe(theme);
  });

  it('stores the backend url', () => {
    const state = reducer(initialState(), changeBackendUrl('https://example.test'));
    expect(state.backendUrl).toBe('https://example.test');
  });

  it('leaves unrelated fields untouched when changing one', () => {
    const withUrl = reducer(initialState(), changeBackendUrl('https://example.test'));
    const withTheme = reducer(withUrl, changeTheme('dark'));
    expect(withTheme).toEqual({
      theme: 'dark', backendUrl: 'https://example.test', isOnline: true, sharingEnabled: true,
      householdsEnabled: true,
      ocrImportEnabled: false,
      apiKeysEnabled: false,
    });
  });

  it('forgets the shopping provider on logout, so the next account is read anew', () => {
    const chosen = reducer(initialState(), changeShoppingProvider('BRING'));
    expect(reducer(chosen, logout()).shoppingProvider).toBeUndefined();
  });

  // The online flag is mirrored into RestAPI because the request layer reads it
  // outside of React. Losing that propagation would silently break offline mode.
  it('propagates the online state to RestAPI', () => {
    const state = reducer(initialState(), changeOnlineState(false));
    expect(state.isOnline).toBe(false);
    expect(setIsOnline).toHaveBeenCalledWith(false);
  });
});
