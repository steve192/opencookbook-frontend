import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState, useSyncExternalStore} from 'react';
import {isDismissed, notNowUntil} from './installDismissal';
import {PwaInstallMethod, PwaInstallPromptState} from './usePwaInstallPrompt.types';

const DONT_ASK_KEY = 'cookpal.pwa.dontAskAgain';
const NOT_NOW_UNTIL_KEY = 'cookpal.pwa.notNowUntil';

type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed', platform: string}>;
};

interface Installability {
  deferredPrompt: BeforeInstallPromptEvent | null;
  standalone: boolean;
}

const detectStandalone = (): boolean =>
  globalThis.matchMedia?.('(display-mode: standalone)').matches ||
  // iOS Safari's own flag.
  (globalThis.navigator as Navigator & {standalone?: boolean}).standalone === true;

const detectIosSafari = (): boolean => {
  const {userAgent, platform, maxTouchPoints} = globalThis.navigator;
  // iPadOS reports itself as a Mac; touch points tell them apart.
  const ios = /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
  // Only Safari can add to the home screen on iOS, not Chrome, Firefox, Edge or Opera there.
  return ios && /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
};

const iosSafari = detectIosSafari();
let installability: Installability = {deferredPrompt: null, standalone: detectStandalone()};
const listeners = new Set<() => void>();

const update = (change: Partial<Installability>) => {
  installability = {...installability, ...change};
  listeners.forEach((listener) => listener());
};

// Listened for from the start: Chromium fires beforeinstallprompt once per page, usually before any
// screen that offers installing is shown. It never fires once the app is installed.
globalThis.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  update({deferredPrompt: event as BeforeInstallPromptEvent});
});
globalThis.addEventListener('appinstalled', () => update({deferredPrompt: null, standalone: true}));

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const current = () => installability;

export const usePwaInstallPrompt = (): PwaInstallPromptState => {
  const {deferredPrompt, standalone} = useSyncExternalStore(subscribe, current);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet([DONT_ASK_KEY, NOT_NOW_UNTIL_KEY])
        .then(([[, dontAsk], [, until]]) => setDismissed(isDismissed(dontAsk, until, Date.now())))
        .catch(() => setDismissed(false));
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return 'unavailable' as const;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    // The event can prompt only once.
    update({deferredPrompt: null});
    return choice.outcome;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    AsyncStorage.setItem(NOT_NOW_UNTIL_KEY, String(notNowUntil(Date.now()))).catch(() => undefined);
  }, []);

  const dontAskAgain = useCallback(() => {
    setDismissed(true);
    AsyncStorage.setItem(DONT_ASK_KEY, '1').catch(() => undefined);
  }, []);

  let installMethod: PwaInstallMethod | null = null;
  if (!standalone) {
    installMethod = deferredPrompt ? 'native' : iosSafari ? 'ios-safari' : null;
  }
  const canInstall = installMethod !== null;
  return {canInstall, installMethod, available: canInstall && dismissed === false, install, dismiss, dontAskAgain};
};
