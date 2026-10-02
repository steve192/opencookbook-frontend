import {beforeEach, describe, expect, it, vi} from 'vitest';
import {secrets} from './api/__mocks__/secureStorage';
import AppPersistence from './AppPersistence';

vi.mock('./api/secureStorage');
vi.mock('./api/defaultBackendUrl', () => ({defaultBackendUrl: () => 'https://default.test'}));
vi.mock('@react-native-async-storage/async-storage', () => ({default: {}}));

describe('getBackendURL', () => {
  beforeEach(() => secrets.clear());

  it('falls back to the default when nothing is stored', async () => {
    expect(await AppPersistence.getBackendURL()).toBe('https://default.test');
  });

  it('keeps another server', async () => {
    secrets.set('backendUrl', 'https://example.org');
    expect(await AppPersistence.getBackendURL()).toBe('https://example.org');
  });

  it.each(['https://beta.cookpal.io', 'https://BETA.cookpal.io/'])('moves %s to the default instance for good', async (stored) => {
    secrets.set('backendUrl', stored);
    expect(await AppPersistence.getBackendURL()).toBe('https://default.test');
    expect(secrets.get('backendUrl')).toBe('https://default.test');
  });
});
