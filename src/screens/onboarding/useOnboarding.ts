import {useEffect, useState} from 'react';
import RestAPI from '../../dao/RestAPI';

/**
 * Whether the signed in account has been through the first-run screen. Unreachable counts as yes,
 * so an offline start is not held at a screen it cannot get past.
 *
 * @return {object} what is known, and a way to record that the screen has been answered
 */
export const useOnboarding = () => {
  // Undefined while loading.
  const [onboarded, setOnboarded] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    RestAPI.getUserInfo()
        .then((userInfo) => setOnboarded(userInfo.onboarded !== false))
        .catch(() => setOnboarded(true));
  }, []);

  return {onboarded, markOnboarded: () => setOnboarded(true)};
};
