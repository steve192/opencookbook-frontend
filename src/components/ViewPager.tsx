import React, {ReactNode, useEffect, useState} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/swiper-bundle.css';

interface Props {
    selectedIndex: number,
    onIndexChange: (index: number) => void,
    style?: StyleProp<ViewStyle>,
    children: ReactNode | ReactNode[],
}


export const ViewPager = (props: Props) => {
  const [swiperInstance, setSwiperInstance] = useState<any>();

  useEffect(() => {
    if (!swiperInstance) {
      return;
    }
    // Guard against swipe -> onSlideChange -> onIndexChange -> setState -> effect
    // -> slideTo loops when the parent's selectedIndex is already in sync.
    if (swiperInstance.activeIndex !== props.selectedIndex) {
      swiperInstance.slideTo(props.selectedIndex);
    }
  }, [props.selectedIndex, swiperInstance]);

  // toArray already assigns stable .key values (".0", ".1", ...) and reuses any
  // explicit keys the caller passed on the child, so we just propagate those
  // instead of fabricating index-based keys here.
  const slides = React.Children.toArray(props.children).map((child) => (
    <SwiperSlide
      key={React.isValidElement(child) && child.key != null ? child.key : undefined}
      style={{height: '100%', width: '100%', overflow: 'hidden'}}>
      {child}
    </SwiperSlide>
  ));

  return (
    <Swiper
      onSwiper={setSwiperInstance}
      style={[{height: '100%', width: '100%', zIndex: -1}, props.style] as any}
      slidesPerView={1}
      spaceBetween={0}
      onSlideChange={(swiper) => {
        if (swiper.activeIndex !== props.selectedIndex) {
          props.onIndexChange(swiper.activeIndex);
        }
      }}
    >
      {slides}
    </Swiper>
  );
};
