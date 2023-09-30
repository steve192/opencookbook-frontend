import React, {Fragment, ReactNode, useRef, useEffect} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {ScrollView} from 'react-native';
import PagerView from 'react-native-pager-view';

interface Props {
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    style?: StyleProp<ViewStyle>;
    children: ReactNode | ReactNode[];
}

export const ViewPager = (props: Props) => {
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    pagerRef.current?.setPage(props.selectedIndex);
  }, [props.selectedIndex]);

  return <PagerView
    ref={pagerRef}
    initialPage={props.selectedIndex}
    onPageSelected={(event) => props.onIndexChange(event.nativeEvent.position)}
    style={[props.style, {flex: 1}]}>
      {props.children}
    {/* {props.children?.map((childview) => {
      return {childview};
    })} */}
  </PagerView>;
};
