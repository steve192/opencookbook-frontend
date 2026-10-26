import React, {createContext, useContext, useMemo, useRef} from 'react';
import {ScrollView, ScrollViewProps, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppScrollView} from './AppScrollView';

interface ScrollPosition {
  /** How far the page is scrolled now. */
  current: () => number;
  /** Scrolls the page back to an earlier position. */
  restore: (offset: number) => void;
}

const ScrollPositionContext = createContext<ScrollPosition | undefined>(undefined);

// The scroll position of the page a component is on, where the page tells it.
export const useScrollPosition = () => useContext(ScrollPositionContext);

// A scrolling page that tells its content how far it is scrolled, so something that folds away can bring the reader
// back to where they were. Its end scrolls clear of the system navigation bar, which Android draws over the app.
export const ScrollViewWithPosition = ({children, onScroll, ...props}: ScrollViewProps) => {
  const ref = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const offset = useRef(0);
  const position = useMemo<ScrollPosition>(() => ({
    current: () => offset.current,
    restore: (y) => ref.current?.scrollTo({y, animated: false}),
  }), []);
  // The provider sits outside, as sticky header indices count the scroll view's own children.
  return (
    <ScrollPositionContext.Provider value={position}>
      <AppScrollView ref={ref} scrollEventThrottle={16} {...props} onScroll={(event) => {
        offset.current = event.nativeEvent.contentOffset.y;
        onScroll?.(event);
      }}>
        {children}
        {insets.bottom > 0 && <View style={{height: insets.bottom}} />}
      </AppScrollView>
    </ScrollPositionContext.Provider>
  );
};
