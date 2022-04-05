import React, {ReactNode, useRef} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import PagerView from 'react-native-pager-view';

interface Props {
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    style?: StyleProp<ViewStyle>;
    children: ReactNode | ReactNode[];
}

export const ViewPager = (props: Props) => {
  const pagerRef = useRef();

  return <PagerView
    ref={pagerRef.current}
    initialPage={props.selectedIndex}
    onPageSelected={(event) => props.onIndexChange(event.nativeEvent.position)}
    style={props.style}>
    {props.children}
  </PagerView>;
};
