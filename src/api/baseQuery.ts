import type {BaseQueryFn} from '@reduxjs/toolkit/query';
import {AxiosRequestConfig} from 'axios';
import {selectLoggedIn} from '../redux/features/authSlice';
import {selectIsOnline, wentOffline} from '../offline/connectivitySlice';
import type {RootState} from '../redux/store';
import {ApiError, NETWORK_UNREACHABLE, toApiError, wasUnreachable} from './ApiError';
import {apiUrl, READ_TIMEOUT_MILLIS, WRITE_TIMEOUT_MILLIS} from './client';
import {sendRequest} from './session';

export interface ApiRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  /** Sent without the access token: public endpoints and signing in. */
  anonymous?: boolean;
  /** Sent with the access token when signed in and without it otherwise: endpoints that also serve visitors. */
  signInOptional?: boolean;
}

const OFFLINE: ApiError = {code: NETWORK_UNREACHABLE, retryable: true};
const SIGNED_OUT: ApiError = {code: 'AUTHENTICATION_REQUIRED', retryable: false};

export const baseQuery: BaseQueryFn<ApiRequest, unknown, ApiError> = async (request, api) => {
  const state = api.getState() as RootState;
  // Nothing is sent while offline, so screens show what is cached at once instead of waiting.
  if (!selectIsOnline(state)) {
    return {error: OFFLINE};
  }
  const signedIn = selectLoggedIn(state);
  // Nothing is read as an account that signed out, not even by a screen still on its way out.
  if (!request.anonymous && !request.signInOptional && !signedIn) {
    return {error: SIGNED_OUT};
  }
  const method = request.method ?? 'GET';
  const config: AxiosRequestConfig = {
    url: await apiUrl(request.url),
    method,
    data: request.body,
    headers: request.headers,
    timeout: request.timeout ?? (method === 'GET' ? READ_TIMEOUT_MILLIS : WRITE_TIMEOUT_MILLIS),
  };
  try {
    const response = await sendRequest(config, request.anonymous || !signedIn);
    return {data: response.data};
  } catch (error) {
    if (wasUnreachable(error)) {
      api.dispatch(wentOffline('unreachable'));
    }
    return {error: toApiError(error)};
  }
};
