import {describe, expect, it} from 'vitest';
import reducer, {changeBackendUrl, changeTheme} from './settingsSlice';

const initialState = () => reducer(undefined, {type: '@@INIT'});

describe('settingsSlice', () => {
  it('starts on the system theme with no backend url', () => {
    expect(initialState()).toEqual({theme: 'system', backendUrl: ''});
  });

  it.each(['light', 'dark', 'system'] as const)('stores the %s theme', (theme) => {
    expect(reducer(initialState(), changeTheme(theme)).theme).toBe(theme);
  });

  it('leaves the theme untouched when the backend url changes', () => {
    const withTheme = reducer(initialState(), changeTheme('dark'));
    expect(reducer(withTheme, changeBackendUrl('https://example.test'))).toEqual(
        {theme: 'dark', backendUrl: 'https://example.test'});
  });
});
