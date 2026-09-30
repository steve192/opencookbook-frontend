import {vi} from 'vitest';

// Stands in for ../client in tests: the real one reaches AppPersistence and expo modules, which do not
// resolve under node. Tests set what the requests answer through the exported mocks.
export const READ_TIMEOUT_MILLIS = 8_000;
export const WRITE_TIMEOUT_MILLIS = 15_000;
export const UPLOAD_TIMEOUT_MILLIS = 60_000;
export const PROBE_TIMEOUT_MILLIS = 5_000;

export const client = {request: vi.fn(), get: vi.fn(), post: vi.fn()};

export const apiUrl = async (path: string): Promise<string> => 'https://cookpal.test/api/v1' + path;

export const bearer = (token: string | null): Record<string, string> =>
  token ? {Authorization: 'Bearer ' + token} : {};
