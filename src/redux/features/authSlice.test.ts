import {beforeEach, describe, expect, it, vi} from 'vitest';

// AppPersistence reaches for expo-secure-store / AsyncStorage, which do not
// resolve under the node test environment.
const clearOfflineData = vi.fn();
vi.mock('../../AppPersistence', () => ({
  default: {clearOfflineData: () => clearOfflineData()},
}));

const {login, logout} = await import('./authSlice');
const reducer = (await import('./authSlice')).default;

const initialState = () => reducer(undefined, {type: '@@INIT'});

describe('authSlice', () => {
  beforeEach(() => clearOfflineData.mockClear());

  // isLoading starts true so the splash screen stays up until the startup
  // auth check resolves one way or the other.
  it('starts logged out and loading', () => {
    expect(initialState()).toEqual({loggedIn: false, isLoading: true});
  });

  it('clears the loading flag on login', () => {
    expect(reducer(initialState(), login())).toEqual({loggedIn: true, isLoading: false});
  });

  it('clears the loading flag on logout', () => {
    const loggedIn = reducer(initialState(), login());
    expect(reducer(loggedIn, logout())).toEqual({loggedIn: false, isLoading: false});
  });

  // Offline caches outlive the session, so failing to drop them on logout would
  // leak the previous user's recipes to the next one.
  it('drops cached offline data on logout', () => {
    reducer(reducer(initialState(), login()), logout());
    expect(clearOfflineData).toHaveBeenCalledOnce();
  });

  it('does not touch offline data on login', () => {
    reducer(initialState(), login());
    expect(clearOfflineData).not.toHaveBeenCalled();
  });
});
