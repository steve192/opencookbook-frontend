import React, {Component, ReactNode} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import Slider from 'react-touch-drag-slider';

interface Props {
    selectedIndex: number,
    onIndexChange: (index: number) => void,
    style: StyleProp<ViewStyle>,
    children: ReactNode | ReactNode[],
}

interface State {
  movement: number
}

export class ViewPager extends Component<Props, State> {
  render() {
    return (

      <Slider>
        {this.props.children}
      </Slider>
    );
  }
}


const styles = StyleSheet.create({
  main: {
    'background-color': '#000',
    'overflow': 'hidden',
    'position': 'relative',
  },

  swiper: {
    'display': 'flex',
    'overflow-x': 'visible',
    'transition-property': 'transform',
    'will-change': 'transform',
  },
});
