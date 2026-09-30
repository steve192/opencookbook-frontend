import {useEffect, useMemo} from 'react';
import {useIsOnline} from '../../offline/useIsOnline';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {loadShoppingVocabulary} from './shoppingSync';

/**
 * The tiles and unit words to add with, as this device last received them, so adding works offline.
 * Asked for when the device has none yet.
 *
 * @return {object} the tiles, and the unit words normalised
 */
export const useShoppingVocabulary = () => {
  const dispatch = useAppDispatch();
  const isOnline = useIsOnline();
  const tiles = useAppSelector((state) => state.shopping.tiles);
  const words = useAppSelector((state) => state.shopping.unitWords);

  useEffect(() => {
    if (isOnline && words.length === 0) {
      dispatch(loadShoppingVocabulary()).catch(() => undefined);
    }
  }, [isOnline]);

  const unitWords = useMemo<ReadonlySet<string>>(() => new Set(words), [words]);
  return {tiles, unitWords};
};
