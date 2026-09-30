import {PwaInstallPromptState} from './usePwaInstallPrompt.types';

const NOTHING_TO_INSTALL: PwaInstallPromptState = {
  canInstall: false,
  installMethod: null,
  available: false,
  install: async () => 'unavailable',
  dismiss: () => undefined,
  dontAskAgain: () => undefined,
};

// The native app is installed already.
export const usePwaInstallPrompt = (): PwaInstallPromptState => NOTHING_TO_INSTALL;
