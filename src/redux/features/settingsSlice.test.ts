import {beforeEach, describe, expect, it, vi} from 'vitest';

// RestAPI pulls in axios, expo-secure-store and react-native, none of which
// resolve under the node test environment. The slice only ever calls
// setIsOnline, so a stub is enough and keeps the test on the reducer logic.
const setIsOnline = vi.fn();
vi.mock('../../dao/RestAPI', () => ({
  default: {setIsOnline: (value: boolean) => setIsOnline(value)},
}));

const {changeBackendUrl, changeOcrImportEnabled, changeOnlineState, changeSharingEnabled,
  changeTheme} =
  await import('./settingsSlice');
const reducer = (await import('./settingsSlice')).default;

const initialState = () => reducer(undefined, {type: '@@INIT'});

describe('settingsSlice', () => {
  beforeEach(() => setIsOnline.mockClear());

  it('starts on the system theme, online, with no backend url', () => {
    expect(initialState()).toEqual({
      theme: 'system', backendUrl: '', isOnline: true, sharingEnabled: true,
      ocrImportEnabled: false,
    });
  });

  // Assumed on until the instance says otherwise: the alternative is that a slow or failed
  // lookup silently removes a feature the instance does offer.
  it('assumes sharing is available before the instance has been asked', () => {
    expect(initialState().sharingEnabled).toBe(true);
  });

  it.each([true, false])('stores that the instance has sharing %s', (enabled) => {
    expect(reducer(initialState(), changeSharingEnabled(enabled)).sharingEnabled).toBe(enabled);
  });

  // The opposite default to sharing, and deliberately so: most instances have no machine
  // learning subsystem at all, and offering a scan that cannot work is worse than offering
  // it a moment late.
  it('assumes recipe scanning is unavailable until the instance says otherwise', () => {
    expect(initialState().ocrImportEnabled).toBe(false);
  });

  it.each([true, false])('stores that the instance can scan recipes: %s', (enabled) => {
    expect(reducer(initialState(), changeOcrImportEnabled(enabled)).ocrImportEnabled)
        .toBe(enabled);
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
      ocrImportEnabled: false,
    });
  });

  // The online flag is mirrored into RestAPI because the request layer reads it
  // outside of React. Losing that propagation would silently break offline mode.
  it('propagates the online state to RestAPI', () => {
    const state = reducer(initialState(), changeOnlineState(false));
    expect(state.isOnline).toBe(false);
    expect(setIsOnline).toHaveBeenCalledWith(false);
  });
});
