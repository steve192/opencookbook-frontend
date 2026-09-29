import {useRef} from 'react';
import {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View} from 'react-native';
import {Reveal} from '../../components/shopping/useTileFlights';
import {measureView, PageRect} from '../../helper/measureView';

/**
 * Keeps the end of a scrolled list in view while following, so what was added last stays visible.
 *
 * @param {boolean} following whether to stay at the end as the list grows
 * @param {number} endPadding the list's padding below its last row
 * @return {object} the area's ref, props for the ScrollView, and reveal for a tile flying into the list
 */
export const useFollowNewest = (following: boolean, endPadding: number) => {
  const listRef = useRef<ScrollView>(null);
  const areaRef = useRef<View>(null);
  const scroll = useRef({y: 0, contentHeight: 0, viewportHeight: 0});

  const scrollTo = (y: number) => {
    scroll.current.y = y;
    listRef.current?.scrollTo({y, animated: false});
  };

  // To an end computed from the latest sizes: scrollToEnd can still use the height from before a new row.
  const showEnd = () => {
    if (following) {
      scrollTo(Math.max(0, scroll.current.contentHeight - scroll.current.viewportHeight));
    }
  };

  // Just far enough that the target and the end padding are in the area; the same end as showEnd.
  const reveal: Reveal = async (target: PageRect) => {
    const area = await measureView(areaRef.current);
    const overflow = area ? target.y + target.height + endPadding - (area.y + area.height) : 0;
    if (overflow <= 0) {
      return target;
    }
    scrollTo(scroll.current.y + overflow);
    return {...target, y: target.y - overflow};
  };

  const listProps = {
    ref: listRef,
    scrollEventThrottle: 16,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scroll.current.y = event.nativeEvent.contentOffset.y;
    },
    onContentSizeChange: (_width: number, height: number) => {
      scroll.current.contentHeight = height;
      showEnd();
    },
    onLayout: (event: LayoutChangeEvent) => {
      scroll.current.viewportHeight = event.nativeEvent.layout.height;
      showEnd();
    },
  };

  return {areaRef, listProps, reveal};
};
