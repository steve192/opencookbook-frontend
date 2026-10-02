import {describe, expect, it} from 'vitest';
import {addBasePath, BASE_PATH, restoreBasePathInState, stripBasePath} from './basePath';

describe('stripBasePath', () => {
  it.each([
    ['/app/share/x', '/share/x'],
    ['/app', '/'],
    ['/app/', '/'],
    ['/app?a=1', '/?a=1'],
    ['/app#top', '/#top'],
    ['/app/login?x=1', '/login?x=1'],
  ])('maps %s to %s', (path, expected) => {
    expect(stripBasePath(path)).toBe(expected);
  });

  it.each(['/share/x', '/application', '/', '/x/app/y'])('leaves %s alone', (path) => {
    expect(stripBasePath(path)).toBe(path);
  });
});

describe('addBasePath', () => {
  it('prefixes a path with or without a leading slash', () => {
    expect(addBasePath('/recipe?recipeId=1')).toBe('/app/recipe?recipeId=1');
    expect(addBasePath('login')).toBe('/app/login');
  });

  it('undoes stripBasePath', () => {
    expect(addBasePath(stripBasePath(`${BASE_PATH}/settings`))).toBe('/app/settings');
  });
});

describe('restoreBasePathInState', () => {
  it('restores the path of the focused leaf route only', () => {
    const state = {
      index: 1,
      routes: [
        {path: '/other'},
        {state: {routes: [{path: '/settings'}]}},
      ],
    };
    const restored = restoreBasePathInState(state);
    expect(restored.routes[0].path).toBe('/other');
    expect(restored.routes[1].state?.routes[0].path).toBe('/app/settings');
  });

  it('keeps a route without a stored path', () => {
    expect(restoreBasePathInState({routes: [{}]}).routes[0]).toEqual({});
  });
});
