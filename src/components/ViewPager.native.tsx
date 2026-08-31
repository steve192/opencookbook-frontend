import React, {ReactNode, useEffect, useRef} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import PagerView from 'react-native-pager-view';

interface Props {
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    style?: StyleProp<ViewStyle>;
    children: ReactNode | ReactNode[];
}

export const ViewPager = (props: Props) => {
  const pagerRef = useRef<PagerView>(null);

  // Where the pager itself actually is. Without it the two sides of the binding fight each
  // other: a settle event for a page the parent has already moved past sends it back, which
  // settles, which reports again. The web pager guards the same loop the same way.
  const shownPage = useRef(props.selectedIndex);

  // ViewPager2 animates its move on a RecyclerView, and asking it for another page while
  // that is still running corrupts the recycler - it crashes with "Scrapped or attached
  // views may not be recycled". So a page asked for mid animation waits for the current one
  // to land, which is what happens when the next button is tapped faster than it animates.
  const scrollState = useRef<'idle' | 'dragging' | 'settling'>('idle');
  const queuedPage = useRef<number | undefined>(undefined);

  const goToPage = (page: number) => {
    if (scrollState.current !== 'idle') {
      queuedPage.current = page;
      return;
    }
    queuedPage.current = undefined;
    pagerRef.current?.setPage(page);
  };

  useEffect(() => {
    if (shownPage.current !== props.selectedIndex) {
      goToPage(props.selectedIndex);
    }
  }, [props.selectedIndex]);

  return (
    <PagerView
      ref={pagerRef}
      initialPage={props.selectedIndex}
      onPageSelected={(event) => {
        const position = event.nativeEvent.position;
        shownPage.current = position;
        // Only report a page the parent does not already know about
        if (position !== props.selectedIndex) {
          props.onIndexChange(position);
        }
      }}
      onPageScrollStateChanged={(event) => {
        scrollState.current = event.nativeEvent.pageScrollState;
        if (scrollState.current !== 'idle') {
          return;
        }
        // Whatever was asked for while it was moving can be acted on now
        const queued = queuedPage.current;
        queuedPage.current = undefined;
        if (queued !== undefined && queued !== shownPage.current) {
          pagerRef.current?.setPage(queued);
        }
      }}
      style={[props.style, {flex: 1}]}>
      {props.children}
    </PagerView>
  );
};
