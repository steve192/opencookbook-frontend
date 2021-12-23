import {LinearGradient} from 'expo-linear-gradient';
import React, {useEffect, useState} from 'react';
import {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollViewProps, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';


export const SideScroller = (props: ScrollViewProps) => {
  const [rightFadeShown, setRightFadeShown] = useState(false);
  const [leftFadeShown, setLeftFadeShown] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);
  const [width, setWidth] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setContentOffset(event.nativeEvent.contentOffset.x);

    // Showing / hiding fadeouts
    if (event.nativeEvent.layoutMeasurement.width <
            event.nativeEvent.contentSize.width) {
      // Content is scrollable

      if (event.nativeEvent.layoutMeasurement.width + event.nativeEvent.contentOffset.x === event.nativeEvent.contentSize.width) {
        // Scroll end
        setRightFadeShown(false);
      } else {
        setRightFadeShown(true);
      }

      if (event.nativeEvent.contentOffset.x === 0) {
        setLeftFadeShown(false);
      } else {
        setLeftFadeShown(true);
      }
    }
  };

  const onContentSizeChange = (w: number, h: number) => {
    setContentWidth(w);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    // Initial state of fades
    if (contentWidth > width) {
      setRightFadeShown(true);
    }
  }, [width, contentWidth]);

  const scrollIndicatorSize =
        contentWidth > width ?
            (width / contentWidth) * width :
            width;


  const percentageScrolled = (contentOffset) / (contentWidth - width);
  const scollbarOffset = (width - scrollIndicatorSize) * percentageScrolled;

  const scrollIndicatorShown = contentWidth > width;


  return (
    <View>

      <ScrollView
        {...props}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 14}}
        horizontal={true}>
        {props.children}
      </ScrollView>
      {scrollIndicatorShown &&
                <View
                  style={{
                    width: '100%',
                    height: 6,
                    backgroundColor: 'rgba(179, 179, 179, 0.4)',
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      height: 6,
                      borderRadius: 8,
                      backgroundColor: 'rgb(141,141, 141)',
                      width: scrollIndicatorSize,
                      marginLeft: scollbarOffset,
                    }}
                  />
                </View>
      }
      {rightFadeShown &&
                <Pressable
                  style={{
                    position: 'absolute',
                    right: 0,
                    width: 80,
                    height: '100%',
                  }} >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent']}
                    start={[1, 0]}
                    end={[0, 0]}
                    style={{'width': '100%', 'height': '100%'}}
                  />
                </Pressable>
      }

      {leftFadeShown &&
                <Pressable
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: 80,
                    height: '100%',
                  }} >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)']}
                    start={[1, 0]}
                    end={[0, 0]}
                    style={{'width': '100%', 'height': '100%'}}
                  />
                </Pressable>
      }
    </View>
  );
};
