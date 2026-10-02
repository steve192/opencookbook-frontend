import {AxiosError, AxiosResponse} from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {secrets} from './__mocks__/secureStorage';
import {baseQuery} from './baseQuery';
import {client} from './client';
import {onSessionRejected} from './session';

vi.mock('./client');
vi.mock('./secureStorage');

const request = vi.mocked(client.request);
const post = vi.mocked(client.post);

const answer = (data: unknown) => ({data});
const failure = (status?: number, data: unknown = {}) => new AxiosError('failed', undefined, undefined, undefined,
    status === undefined ? undefined : {status, data} as AxiosResponse);

const run = async (state: {online?: boolean, loggedIn?: boolean} = {}, url = '/recipes', anonymous = false) => {
  const dispatch = vi.fn();
  const result = await baseQuery({url, anonymous}, {
    getState: () => ({connectivity: {online: state.online ?? true}, auth: {loggedIn: state.loggedIn ?? true}}),
    dispatch,
  } as never, {});
  return {result, dispatch};
};

describe('baseQuery', () => {
  const rejected = vi.fn();

  beforeEach(() => {
    request.mockReset();
    post.mockReset();
    rejected.mockReset();
    secrets.clear();
    secrets.set('authToken', 'old-access');
    secrets.set('refreshToken', 'session.old-refresh');
    onSessionRejected(rejected);
  });

  it('sends nothing while offline, so the cache is shown at once', async () => {
    const {result} = await run({online: false});
    expect(result.error).toMatchObject({code: 'NETWORK_UNREACHABLE'});
    expect(request).not.toHaveBeenCalled();
  });

  it('reads nothing as an account that signed out', async () => {
    const {result} = await run({loggedIn: false});
    expect(result.error).toMatchObject({code: 'AUTHENTICATION_REQUIRED'});
    expect(request).not.toHaveBeenCalled();
  });

  it('still sends public requests while signed out', async () => {
    request.mockResolvedValue(answer({sharingEnabled: true}));
    const {result} = await run({loggedIn: false}, '/instance', true);
    expect(result.data).toEqual({sharingEnabled: true});
    expect(request.mock.calls[0][0].headers?.Authorization).toBeUndefined();
  });

  it('takes a request that timed out or never arrived for being offline', async () => {
    request.mockRejectedValue(failure());
    const {result, dispatch} = await run();
    expect(result.error).toMatchObject({code: 'NETWORK_UNREACHABLE'});
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'connectivity/wentOffline'}));
  });

  it('takes a proxy that cannot reach the server for being offline', async () => {
    request.mockRejectedValue(failure(502, 'Bad Gateway'));
    const {result, dispatch} = await run();
    expect(result.error).toMatchObject({code: 'NETWORK_UNREACHABLE'});
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'connectivity/wentOffline'}));
  });

  it('stays online for a failure that never was a request', async () => {
    request.mockRejectedValue(new Error('disk full'));
    const {dispatch} = await run();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('gives reads less time than writes', async () => {
    request.mockResolvedValue(answer([]));
    await run();
    expect(request.mock.calls[0][0].timeout).toBe(8_000);
  });

  it('renews an expired access token once and sends the request again', async () => {
    request.mockRejectedValueOnce(failure(401)).mockResolvedValue(answer(['recipe']));
    post.mockResolvedValue(answer({token: 'new-access', refreshToken: 'session.new-refresh'}));

    const {result} = await run();

    expect(result.data).toEqual(['recipe']);
    expect(request.mock.calls[1][0].headers).toEqual({Authorization: 'Bearer new-access'});
    expect(secrets.get('refreshToken')).toBe('session.new-refresh');
  });

  it('renews once for requests that all found the token expired', async () => {
    request.mockImplementation(async (config) => {
      if (config.headers?.Authorization === 'Bearer old-access') {
        throw failure(401);
      }
      return answer([]);
    });
    post.mockResolvedValue(answer({token: 'new-access', refreshToken: 'session.new-refresh'}));

    await Promise.all([run(), run(), run()]);

    expect(post).toHaveBeenCalledOnce();
  });

  it('ends the sign in only when the server refuses the refresh token', async () => {
    request.mockRejectedValue(failure(401));
    post.mockRejectedValue(failure(401));

    const {result} = await run();

    expect(result.error).toMatchObject({code: 'AUTHENTICATION_REQUIRED'});
    expect(rejected).toHaveBeenCalledOnce();
  });

  it('keeps the sign in when the renewal cannot reach the server', async () => {
    request.mockRejectedValue(failure(401));
    post.mockRejectedValue(failure());

    const {result} = await run();

    expect(result.error).toMatchObject({code: 'NETWORK_UNREACHABLE'});
    expect(rejected).not.toHaveBeenCalled();
    expect(secrets.get('refreshToken')).toBe('session.old-refresh');
  });

  it('keeps the sign in when the server fails while renewing', async () => {
    request.mockRejectedValue(failure(401));
    post.mockRejectedValue(failure(503));

    await run();

    expect(rejected).not.toHaveBeenCalled();
  });

  it('leaves a failure that is not about the token as the server said it', async () => {
    request.mockRejectedValue(failure(404));
    const {result} = await run();
    expect(result.error).toMatchObject({code: 'RESOURCE_NOT_FOUND', status: 404});
    expect(post).not.toHaveBeenCalled();
  });
});
