import {useIsFocused} from '@react-navigation/native';
import {clearSharedPayloads, getSharedPayloads} from 'expo-sharing';
import {useCallback, useEffect, useState} from 'react';
import {AppState, Platform} from 'react-native';
import {SharedContent, sharedContentFromPayloads, WebShare} from './sharedContent';

// The iOS share extension is not built.
export const RECEIVES_SHARES = Platform.OS === 'android';

const waitingShare = (): SharedContent | undefined =>
  RECEIVES_SHARES ? sharedContentFromPayloads(getSharedPayloads()) : undefined;

const dismissShare = () => {
  if (RECEIVES_SHARES) {
    clearSharedPayloads();
  }
};

// Android keeps a share until it is cleared; leaving the screen clears it too, so it is not asked about twice.
export const useIncomingShare = (_params?: WebShare) => {
  const focused = useIsFocused();
  const [share, setShare] = useState(waitingShare);

  // A share into the open app brings it back to the foreground.
  useEffect(() => {
    if (!focused) {
      return undefined;
    }
    setShare(waitingShare());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setShare(waitingShare());
      }
    });
    return () => subscription.remove();
  }, [focused]);

  useEffect(() => dismissShare, []);

  const dismiss = useCallback(() => {
    dismissShare();
    setShare(undefined);
  }, []);

  return {share, dismiss};
};

export const takeWaitingShare = (): {params?: WebShare} | undefined => waitingShare() ? {} : undefined;
