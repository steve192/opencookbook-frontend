import {describe, expect, it} from 'vitest';
import {NETWORK_UNREACHABLE, toApiError} from '../api/ApiError';
import {errorMessageKey} from './apiErrorMessage';

const answered = (status: number, data?: unknown) => ({response: {status, data}});

describe('reading what a failed request means', () => {
  it('takes the code the server sent', () => {
    expect(toApiError(answered(409, {code: 'EMAIL_ALREADY_REGISTERED', retryable: false})))
        .toEqual({code: 'EMAIL_ALREADY_REGISTERED', status: 409, retryable: false});
  });

  it('says so when no server was reached', () => {
    expect(toApiError(new Error('Network Error')).code).toBe(NETWORK_UNREACHABLE);
  });

  it('falls back to the status when the answer carries no code', () => {
    expect(toApiError(answered(404)).code).toBe('RESOURCE_NOT_FOUND');
    expect(toApiError(answered(500, '<html>error</html>')).code).toBe('INTERNAL_ERROR');
  });

  it('takes a gateway error of a proxy for an unreachable server', () => {
    expect(toApiError(answered(502, '<html>bad gateway</html>'))).toEqual({code: NETWORK_UNREACHABLE, retryable: true});
    expect(toApiError(answered(504)).code).toBe(NETWORK_UNREACHABLE);
  });

  it('keeps a gateway status the server named itself', () => {
    expect(toApiError(answered(503, {code: 'SCAN_UNAVAILABLE', retryable: true})))
        .toEqual({code: 'SCAN_UNAVAILABLE', status: 503, retryable: true});
  });

  it('keeps the link a failure points to', () => {
    expect(toApiError(answered(422, {code: 'IMPORT_NO_RECIPE', retryable: false, link: 'https://example.com/pie'})).link)
        .toBe('https://example.com/pie');
    expect(toApiError(answered(422, {code: 'IMPORT_NO_RECIPE', retryable: false})).link).toBeUndefined();
  });

  it('treats a server side failure as worth retrying and a rejected request as not', () => {
    expect(toApiError(answered(500)).retryable).toBe(true);
    expect(toApiError(answered(400)).retryable).toBe(false);
  });
});

describe('choosing what to tell the reader', () => {
  it('explains the codes it knows', () => {
    expect(errorMessageKey(answered(401, {code: 'INVALID_CREDENTIALS'})))
        .toBe('errors.invalidCredentials');
    expect(errorMessageKey(answered(401, {code: 'ACCOUNT_NOT_ACTIVATED'})))
        .toBe('errors.accountNotActivated');
  });

  it('never shows an http status, however unfamiliar the failure', () => {
    expect(errorMessageKey(answered(418, {code: 'A_CODE_FROM_A_NEWER_SERVER'})))
        .toBe('errors.unknown');
  });

  it('lets a screen phrase a failure nobody has named', () => {
    expect(errorMessageKey(answered(500, {code: 'BRAND_NEW'}), 'screens.import.importFailed'))
        .toBe('screens.import.importFailed');
  });

  it('keeps its own wording for a code it knows, fallback or not', () => {
    expect(errorMessageKey(answered(429, {code: 'RATE_LIMITED'}), 'screens.import.importFailed'))
        .toBe('errors.rateLimited');
  });
});
