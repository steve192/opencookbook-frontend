import AppPersistence from '../AppPersistence';
import {endSignInOnServer, hasStoredSignIn} from '../api/session';
import {logout, sessionRestored} from './features/authSlice';
import {changeBackendUrl} from './features/settingsSlice';
import type {AppDispatch} from './store';

// A stored sign in is enough to start: whether it still holds is found out by the first request.
export const bootstrap = () => async (dispatch: AppDispatch) => {
  dispatch(changeBackendUrl(await AppPersistence.getBackendURL()));
  dispatch(sessionRestored(await hasStoredSignIn()));
};

export const signOut = () => async (dispatch: AppDispatch) => {
  await endSignInOnServer();
  dispatch(logout());
};

// Nothing read from one server may be shown as another's.
export const switchServer = (url: string) => async (dispatch: AppDispatch) => {
  await AppPersistence.setBackendURL(url);
  dispatch(changeBackendUrl(url));
  dispatch(logout());
};
