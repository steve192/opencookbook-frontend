import {AxiosError, AxiosResponse} from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {secrets} from './__mocks__/secureStorage';
import {client} from './client';
import {sendRequest} from './session';

vi.mock('./client');
vi.mock('./secureStorage');
// Another tab holds the lock first and renews while this one waits for it.
vi.mock('../helper/tabLock', () => ({
  withTabLock: async (_name: string, renew: () => Promise<void>) => {
    secrets.set('refreshToken', 'session.renewed-elsewhere');
    secrets.set('authToken', 'access-from-the-other-tab');
    return renew();
  },
}));

const request = vi.mocked(client.request);
const post = vi.mocked(client.post);

describe('session', () => {
  beforeEach(() => {
    request.mockReset();
    post.mockReset();
    secrets.clear();
    secrets.set('authToken', 'expired-access');
    secrets.set('refreshToken', 'session.old-refresh');
  });

  // Presenting the replaced refresh token again would end the sign in by reuse detection.
  it('takes the renewal another tab made instead of spending the refresh token again', async () => {
    request.mockImplementation(async (config) => {
      if (config.headers?.Authorization === 'Bearer expired-access') {
        throw new AxiosError('expired', undefined, undefined, undefined, {status: 401} as AxiosResponse);
      }
      return {data: config.headers?.Authorization};
    });

    expect((await sendRequest({url: '/x'})).data).toBe('Bearer access-from-the-other-tab');
    expect(post).not.toHaveBeenCalled();
  });
});
