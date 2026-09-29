import {useCallback, useState} from 'react';
import {LayoutChangeEvent} from 'react-native';

/**
 * The width a view was laid out at.
 *
 * @return {object} the width, undefined before the first layout, and the onLayout to pass the view
 */
export const useLayoutWidth = () => {
  const [width, setWidth] = useState<number>();
  const onLayout = useCallback((event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width), []);
  return {width, onLayout};
};
