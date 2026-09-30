import NetInfo from '@react-native-community/netinfo';
import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useAppDispatch} from '../redux/hooks';
import {probeRequested, wentOffline} from './connectivitySlice';

/**
 * Tells connectivity what the device notices: a lost network at once, and a returning network or
 * a return to the app as a reason to ask the server again. Only the server's answer means online.
 *
 * @return {null} nothing to render
 */
export const ConnectivityWatcher = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const stopNetInfo = NetInfo.addEventListener((state) =>
      dispatch(state.isConnected === false ? wentOffline('no-network') : probeRequested()));
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        dispatch(probeRequested());
      }
    });
    return () => {
      stopNetInfo();
      appState.remove();
    };
  }, [dispatch]);
  return null;
};
