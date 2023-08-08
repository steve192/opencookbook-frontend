import React, {Fragment, ReactNode, useRef, useEffect, Children, useState} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import PagerView from 'react-native-pager-view';

interface Props {
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    style?: StyleProp<ViewStyle>;
    children: ReactNode | ReactNode[];
}

export const ViewPager = (props: Props) => {
  const pagerRef = useRef<PagerView>();

  useEffect(() => {
    pagerRef.current?.setPage(props.selectedIndex);
  }, [props.selectedIndex]);

  return <PagerView
    ref={pagerRef}
    overlap
    initialPage={props.selectedIndex}
    onPageSelected={(event) => props.onIndexChange(event.nativeEvent.position)}
    style={[props.style]}>
    {props.children}
  </PagerView>;
};
