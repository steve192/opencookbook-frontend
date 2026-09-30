import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {withTabLock} from '../helper/tabLock';
import {apiUrl, bearer, client, WRITE_TIMEOUT_MILLIS} from './client';
import {readSecure, removeSecure, writeSecure} from './secureStorage';

export interface IssuedTokens {
  token: string;
  refreshToken: string;
}

let renewal: Promise<void> | null = null;
let rejected: () => void = () => undefined;

/**
 * Tells the app when the server refused the refresh token, the one failure that ends a sign in.
 *
 * @param {Function} listener called once per refusal
 */
export const onSessionRejected = (listener: () => void) => {
  rejected = listener;
};

export const hasStoredSignIn = async (): Promise<boolean> => !!await readSecure('refreshToken');

export const storeTokens = async (tokens: IssuedTokens) => {
  // The refresh token first: an access token without it would be renewed with the replaced one.
  await writeSecure('refreshToken', tokens.refreshToken);
  await writeSecure('authToken', tokens.token);
};

export const clearTokens = async () => {
  await removeSecure('authToken');
  await removeSecure('refreshToken');
};

// 400 is a token the server cannot read, 401 one it will not accept: both are final.
const isRefusal = (error: unknown) => [400, 401].includes((error as AxiosError).response?.status ?? 0);

const renewOnce = async () => {
  const presented = await readSecure('refreshToken');
  // Tabs renewing with the same refresh token at once would end the sign in by reuse detection.
  await withTabLock('cookpal-token-renewal', async () => {
    const current = await readSecure('refreshToken');
    if (current !== presented) {
      return;
    }
    try {
      const response = await client.post<IssuedTokens>(await apiUrl('/users/refreshToken'),
          {refreshToken: current}, {timeout: WRITE_TIMEOUT_MILLIS});
      await storeTokens(response.data);
    } catch (error) {
      if (isRefusal(error)) {
        rejected();
      }
      throw error;
    }
  });
};

/**
 * Renews the access token. Requests that all find their token expired at once share one renewal,
 * and a renewal another tab made meanwhile is taken instead of spending the refresh token again.
 *
 * @return {Promise<void>} when the new tokens are stored
 */
export const renewTokens = (): Promise<void> => {
  renewal ??= renewOnce().finally(() => {
    renewal = null;
  });
  return renewal;
};

// An expired access token is renewed once, then the request is sent again.
const sendAuthorized = async <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  const send = async () =>
    client.request<T>({...config, headers: {...config.headers, ...bearer(await readSecure('authToken'))}});
  try {
    return await send();
  } catch (error) {
    if ((error as AxiosError).response?.status !== 401) {
      throw error;
    }
    await renewTokens();
    return send();
  }
};

/**
 * Sends a request as the signed in account, or without the access token when anonymous.
 *
 * @param {AxiosRequestConfig} config the request
 * @param {boolean} anonymous whether to leave out the access token
 * @return {Promise} what the request answered
 */
export const sendRequest = <T>(config: AxiosRequestConfig, anonymous = false): Promise<AxiosResponse<T>> =>
  anonymous ? client.request<T>(config) : sendAuthorized<T>(config);

export const currentAccessToken = (): Promise<string | null> => readSecure('authToken');

/** Ends the sign in on the server too. Not waited for: an unreachable server lets it run out on its own. */
export const endSignInOnServer = async () => {
  const refreshToken = await readSecure('refreshToken');
  if (refreshToken) {
    client.post(await apiUrl('/users/logout'), {refreshToken}, {timeout: WRITE_TIMEOUT_MILLIS})
        .catch(() => undefined);
  }
};
