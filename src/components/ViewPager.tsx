import React, {ReactNode, useEffect, useState} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {Swiper, SwiperSlide} from 'swiper/react/swiper-react.js';
import 'swiper/swiper-bundle.css';

interface Props {
    selectedIndex: number,
    onIndexChange: (index: number) => void,
    style?: StyleProp<ViewStyle>,
    children: ReactNode | ReactNode[],
}


export const ViewPager = (props: Props) => {
  let slides = [];

  const [swiperInstance, setSwiperInstance] = useState<any>();

  useEffect(() => {
    swiperInstance?.slideTo(props.selectedIndex);
  }, [props.selectedIndex]);


  if (Array.isArray(props.children)) {
    slides = props.children.map((child, index) =>
      <SwiperSlide
        key={index}
        style={{height: '100%', width: '100%', overflow: 'hidden'}}>
        {child}
      </SwiperSlide>);
  } else {
    slides.push(<SwiperSlide
      style={{height: '100%'}}>
      {props.children}
    </SwiperSlide>);
  }
  return (
    <Swiper
      id="swiper"
      onSwiper={(swiper) => setSwiperInstance(swiper)}
      style={{height: '100%', width: '100%', zIndex: -1}}
      slidesPerView={1}
      spaceBetween={0}
      onSlideChange={(swiper) => props.onIndexChange(swiper.activeIndex)}
    >
      {slides}
    </Swiper>
  );
};
