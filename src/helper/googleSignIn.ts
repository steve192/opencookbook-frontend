import {useIdTokenAuthRequest} from 'expo-auth-session/providers/google';
import {useEffect} from 'react';
import {Platform} from 'react-native';
import {GoogleClients} from '../api/types/account';

// There is no iPhone app; iPhones use the web app.
export const googleClientId = (clients: GoogleClients | null): string | undefined =>
  Platform.OS === 'android' ? clients?.androidClientId ?? undefined : undefined;

// A Custom Tab rather than Google's native account picker, which did not work for us.
export const useGoogleIdToken = (clientId: string, invitation: string | undefined,
    onIdToken: (idToken: string, invitation?: string) => void) => {
  const [request, response, promptAsync] = useIdTokenAuthRequest({clientId});

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      onIdToken(response.params.id_token, invitation);
    }
  }, [response]);

  return {ready: request !== null, start: () => promptAsync()};
};
