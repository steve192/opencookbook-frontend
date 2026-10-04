import {findFocusedRoute, getStateFromPath, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCallback, useMemo} from 'react';
import {stripBasePath} from '../navigation/basePath';
import {LINKING_SCREENS} from '../navigation/linking';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {detectStandalone} from '../pwa/usePwaInstallPrompt.web';
import {sharedContentFromWebShare, WebShare} from './sharedContent';

// Chrome hands shares to an installed web app on Android only.
export const RECEIVES_SHARES = detectStandalone() && /Android/i.test(globalThis.navigator.userAgent);

// The share target's parameters arrive in the address; dismissing takes them out, so a reload does not ask again.
export const useIncomingShare = (params?: WebShare) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainNavigationProps, 'ImportScreen'>>();
  const {title, text, url} = params ?? {};
  const share = useMemo(() => sharedContentFromWebShare({title, text, url}), [title, text, url]);
  const dismiss = useCallback(
      () => navigation.setParams({title: undefined, text: undefined, url: undefined}), [navigation]);
  return {share, dismiss};
};

const shareInAddress = (): WebShare | undefined => {
  const {pathname, search} = globalThis.location;
  const config = {screens: LINKING_SCREENS} as Parameters<typeof getStateFromPath>[1];
  const state = getStateFromPath(stripBasePath(pathname + search), config);
  const route = state && findFocusedRoute(state);
  const params = route?.name === 'ImportScreen' ? route.params as WebShare | undefined : undefined;
  return params && sharedContentFromWebShare(params) ? params : undefined;
};

// Read before the sign in screen replaces the address.
let waitingShare = shareInAddress();

export const takeWaitingShare = (): {params?: WebShare} | undefined => {
  const params = waitingShare;
  waitingShare = undefined;
  return params && {params};
};
