import {useState} from 'react';
import {usePwaInstallPrompt} from './usePwaInstallPrompt';

/**
 * Installing the web app wherever it is offered: the browser's dialog, or on iOS the steps to follow.
 *
 * @return {object} the prompt's state, what installing does, and whether the iOS steps are shown
 */
export const useInstallApp = () => {
  const prompt = usePwaInstallPrompt();
  const [iosStepsShown, setIosStepsShown] = useState(false);
  const install = () => {
    if (prompt.installMethod === 'ios-safari') {
      setIosStepsShown(true);
    } else {
      void prompt.install();
    }
  };
  return {prompt, install, iosStepsShown, hideIosSteps: () => setIosStepsShown(false)};
};
