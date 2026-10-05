import {describe, expect, it} from 'vitest';
import {googleAuthorizationUrl, GoogleRedirect, idTokenFromReturn, isGoogleReturn} from './googleRedirect';

const started: GoogleRedirect = {state: 'a-state', nonce: 'a-nonce'};

const base64Url = (text: string) => btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const idToken = (claims: object) => [base64Url('{}'), base64Url(JSON.stringify(claims)), 'sig'].join('.');

describe('googleRedirect', () => {
  it('asks Google for an ID token for the address only, letting the user pick the account', () => {
    const url = new URL(googleAuthorizationUrl('web.apps.googleusercontent.com',
        'https://cookbook.example.com/app/login', started));

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'web.apps.googleusercontent.com',
      redirect_uri: 'https://cookbook.example.com/app/login',
      response_type: 'id_token',
      scope: 'openid email',
      prompt: 'select_account',
      state: 'a-state',
      nonce: 'a-nonce',
    });
  });

  it('recognises Google coming back, with a token or without', () => {
    expect(isGoogleReturn('#state=a-state&id_token=a-token')).toBe(true);
    expect(isGoogleReturn('#error=access_denied&state=a-state')).toBe(true);
    expect(isGoogleReturn('')).toBe(false);
    expect(isGoogleReturn('#section')).toBe(false);
  });

  it('takes the token of the sign in this browser started', () => {
    const token = idToken({nonce: 'a-nonce'});
    expect(idTokenFromReturn(`#state=a-state&id_token=${token}`, started)).toBe(token);
  });

  it('reads the url-safe alphabet of a token', () => {
    const token = idToken({nonce: '~~~???>>>'});
    expect(token).toMatch(/[-_]/);
    expect(idTokenFromReturn(`#state=a-state&id_token=${token}`, {...started, nonce: '~~~???>>>'})).toBe(token);
  });

  it('ignores a token for a sign in this browser did not start', () => {
    const token = idToken({nonce: 'a-nonce'});
    expect(idTokenFromReturn(`#state=other-state&id_token=${token}`, started)).toBeUndefined();
    expect(idTokenFromReturn(`#state=a-state&id_token=${token}`)).toBeUndefined();
  });

  it('ignores a token issued for another nonce, or one it cannot read', () => {
    expect(idTokenFromReturn(`#state=a-state&id_token=${idToken({nonce: 'other-nonce'})}`, started)).toBeUndefined();
    expect(idTokenFromReturn(`#state=a-state&id_token=${idToken({})}`, started)).toBeUndefined();
    expect(idTokenFromReturn('#state=a-state&id_token=not-a-token', started)).toBeUndefined();
  });

  it('has no token when the user turned Google down', () => {
    expect(idTokenFromReturn('#error=access_denied&state=a-state', started)).toBeUndefined();
  });
});
