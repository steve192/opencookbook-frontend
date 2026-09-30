import {describe, expect, it} from 'vitest';
import {cacheVersionOf, keepOnlyVersion} from './cacheVersion';

describe('cacheVersion', () => {
  it('orders app versions as numbers', () => {
    expect(cacheVersionOf('1.19.0')).toBe(1019000);
    expect(cacheVersionOf('1.20.0')).toBeGreaterThan(cacheVersionOf('1.19.12'));
  });

  it('keeps what the same app version stored', async () => {
    const stored = {_persist: {version: 1019000, rehydrated: true}};
    expect(await keepOnlyVersion(1019000)(stored)).toBe(stored);
  });

  it('drops what another app version stored', async () => {
    expect(await keepOnlyVersion(1020000)({_persist: {version: 1019000, rehydrated: true}})).toBeUndefined();
  });
});
