import {randomUUID} from 'expo-crypto';
import {useEffect} from 'react';
import {GoogleClients} from '../api/types/account';
import {addBasePath} from '../navigation/basePath';
import {googleAuthorizationUrl, GoogleRedirect, idTokenFromReturn, isGoogleReturn} from './googleRedirect';

const STARTED_KEY = 'cookpal.googleSignIn';

const takeReturn = (): {idToken: string, invitation?: string} | undefined => {
  const fragment = globalThis.location.hash;
  if (!isGoogleReturn(fragment)) {
    return undefined;
  }
  // A reload must not sign in again.
  globalThis.history.replaceState(globalThis.history.state, '', globalThis.location.pathname + globalThis.location.search);
  const stored = sessionStorage.getItem(STARTED_KEY);
  sessionStorage.removeItem(STARTED_KEY);
  const started: GoogleRedirect | undefined = stored ? JSON.parse(stored) : undefined;
  const idToken = idTokenFromReturn(fragment, started);
  return idToken ? {idToken, invitation: started?.invitation} : undefined;
};

// Taken on load, before React Navigation rewrites the address and drops the fragment.
let returned = takeReturn();

export const googleClientId = (clients: GoogleClients | null): string | undefined => clients?.clientId;

export const useGoogleIdToken = (clientId: string, invitation: string | undefined,
    onIdToken: (idToken: string, invitation?: string) => void) => {
  useEffect(() => {
    if (returned) {
      const {idToken, invitation: startedWith} = returned;
      returned = undefined;
      onIdToken(idToken, startedWith);
    }
  }, []);

  const start = () => {
    const started: GoogleRedirect = {state: randomUUID(), nonce: randomUUID(), invitation};
    sessionStorage.setItem(STARTED_KEY, JSON.stringify(started));
    // Registered with Google as the redirect URI, so it has to stay exactly this.
    const redirectUri = globalThis.location.origin + addBasePath('/login');
    globalThis.location.assign(googleAuthorizationUrl(clientId, redirectUri, started));
  };
  return {ready: true, start};
};
