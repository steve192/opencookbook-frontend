import {describe, expect, it, vi} from 'vitest';

// expo-constants / expo-application are native modules that do not resolve
// under the node test environment.
const mocks = vi.hoisted(() => ({
  bundled: undefined as string | undefined,
  native: null as string | null,
}));

vi.mock('expo-constants', () => ({
  default: {get expoConfig() {
    return {version: mocks.bundled};
  }},
}));
vi.mock('expo-application', () => ({
  get nativeApplicationVersion() {
    return mocks.native;
  },
}));

const {resolveAppVersion} = await import('./appVersion');

const resolve = (bundled: string | undefined, native: string | null) => {
  mocks.bundled = bundled;
  mocks.native = native;
  return resolveAppVersion();
};

describe('resolveAppVersion', () => {
  // Web has no separate binary: expo-application returns null there.
  it('reports just the bundled version when there is no native version', () => {
    expect(resolve('1.7.4', null)).toEqual({version: '1.7.4'});
  });

  it('reports a single version when binary and bundle agree', () => {
    expect(resolve('1.7.4', '1.7.4')).toEqual({version: '1.7.4'});
  });

  // The case worth surfacing: an OTA update running on an older install.
  it('reports both when an OTA update outruns the installed binary', () => {
    expect(resolve('1.8.0', '1.7.4')).toEqual({version: '1.8.0', build: '1.7.4'});
  });

  it('falls back to the native version when the bundle has none', () => {
    expect(resolve(undefined, '1.7.4')).toEqual({version: '1.7.4'});
  });

  it('reports no version when neither source knows one', () => {
    expect(resolve(undefined, null)).toEqual({version: ''});
  });
});
