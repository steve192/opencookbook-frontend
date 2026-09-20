import {AxiosError} from 'axios';

/**
 * A failure, reduced to the one thing worth branching on.
 *
 * The server names what went wrong with a stable code rather than leaving the app to guess from
 * an http status, and never sends a description of its own internals - so everything the reader
 * sees is written here, in their language.
 */
export interface ApiError {
  code: string;
  /** Absent when the request never reached a server. */
  status?: number;
  /** Whether sending the very same request again could succeed. */
  retryable: boolean;
}

/** The one failure no server can report, because none was reached. */
export const NETWORK_UNREACHABLE = 'NETWORK_UNREACHABLE';

/** What the server sends. Anything else in the body is none of the app's business. */
interface ErrorBody {
  code?: unknown;
  retryable?: unknown;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * Reads whatever a failed request threw as an {@link ApiError}.
 *
 * Written to survive answers it does not recognise: a server that is older than this app, a
 * proxy that returned html, or a failure that never was a request at all.
 *
 * @param {unknown} error what the call rejected with
 * @return {ApiError} what to tell the reader, as a code
 */
export const toApiError = (error: unknown): ApiError => {
  const response = (error as AxiosError<ErrorBody>)?.response;
  if (!response) {
    return {code: NETWORK_UNREACHABLE, retryable: true};
  }

  const body = response.data;
  const code = typeof body?.code === 'string' ? body.code : statusCode(response.status);
  const retryable = typeof body?.retryable === 'boolean' ?
    body.retryable :
    RETRYABLE_STATUS.has(response.status);

  return {code, status: response.status, retryable};
};

// What to call a failure from a server that did not name it - an old one, or a proxy.
const statusCode = (status: number): string => {
  switch (status) {
    case 401: return 'AUTHENTICATION_REQUIRED';
    case 403: return 'ACCESS_DENIED';
    case 404: return 'RESOURCE_NOT_FOUND';
    case 409: return 'CONFLICT';
    case 413: return 'FILE_TOO_LARGE';
    case 429: return 'RATE_LIMITED';
    default: return status >= 500 ? 'INTERNAL_ERROR' : 'MALFORMED_REQUEST';
  }
};
