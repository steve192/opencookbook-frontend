import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import RestAPI, {Household} from '../../dao/RestAPI';
import {useAppSelector} from '../../redux/hooks';

/**
 * The signed in account's households, reloaded on every focus. Empty without households.
 *
 * @return {object} the list, whether it is still loading, and a way to load it again
 */
export const useHouseholds = () => {
  const householdsEnabled = useAppSelector((state) => state.settings.householdsEnabled);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(householdsEnabled);

  const reload = useCallback(() => {
    if (!householdsEnabled) {
      setHouseholds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    RestAPI.getHouseholds()
        .then(setHouseholds)
        .catch(() => setHouseholds([]))
        .finally(() => setLoading(false));
  }, [householdsEnabled]);

  useFocusEffect(reload);

  return {households, loading, reload};
};
