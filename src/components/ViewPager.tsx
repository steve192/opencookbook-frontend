import React, {ReactNode} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {Swiper, SwiperSlide} from 'swiper/react/swiper-react';

interface Props {
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    style: StyleProp<ViewStyle>;
    children: ReactNode | ReactNode[];
}

export const ViewPager = (props: Props) => {
  return <Swiper
    autoHeight={false}
    onActiveIndexChange={(e) => props.onIndexChange(e.activeIndex)}
    tabIndex={props.selectedIndex}
  >

    {Array.isArray(props.children) ? props.children.map((child, index) =>
      <SwiperSlide
        key={index}>
        {child}
      </SwiperSlide>,
    ): <SwiperSlide
    >
      {props.children}
    </SwiperSlide>}
  </Swiper>;
};
