/**
 * The web app signs in with Google by leaving for Google and coming back with an ID token in the
 * address fragment. Popups and Google's own script break too easily on self-hosted servers.
 */

const AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

/** What the browser keeps while it is away at Google. */
export interface GoogleRedirect {
  /** Proves on return that this browser started the sign in. */
  state: string;
  /** Comes back inside the ID token, which ties the token to this sign in. */
  nonce: string;
  /** The invitation an account is created with, if the sign in started from one. */
  invitation?: string;
}

export const googleAuthorizationUrl = (clientId: string, redirectUri: string, started: GoogleRedirect): string =>
  `${AUTHORIZATION_ENDPOINT}?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token',
    scope: 'openid email',
    prompt: 'select_account',
    state: started.state,
    nonce: started.nonce,
  })}`;

const fragmentParams = (fragment: string) => new URLSearchParams(fragment.replace(/^#/, ''));

// The server checks the signature; this only reads the claim back.
const nonceOf = (idToken: string): unknown => {
  try {
    return JSON.parse(atob(idToken.split('.')[1].replaceAll('-', '+').replaceAll('_', '/'))).nonce;
  } catch {
    return undefined;
  }
};

// Whether Google is sending the browser back, signed in or not.
export const isGoogleReturn = (fragment: string): boolean => fragmentParams(fragment).has('state');

// The ID token Google sent back, if it answers the sign in this browser started.
export const idTokenFromReturn = (fragment: string, started?: GoogleRedirect): string | undefined => {
  const params = fragmentParams(fragment);
  const idToken = params.get('id_token');
  return started && idToken && params.get('state') === started.state && nonceOf(idToken) === started.nonce ?
    idToken : undefined;
};
