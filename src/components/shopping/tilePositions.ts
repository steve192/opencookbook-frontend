import {useCallback} from 'react';
import {View} from 'react-native';
import {measureView} from '../../helper/measureView';
import {useKeyedRefs} from '../../helper/useKeyedRefs';

/**
 * Tiles by key, to find out where one is on the page.
 *
 * @return {object} register, whose result goes to a tile's viewRef, and measure
 */
export const useTilePositions = () => {
  const {register, values: views} = useKeyedRefs<View>();
  const measure = useCallback((key: string) => measureView(views.get(key)), [views]);
  return {register, measure};
};
