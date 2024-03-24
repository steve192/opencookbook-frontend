import {ComponentProps, useMemo, useRef, useState} from 'react';
import {TouchableOpacity, Image, PanResponder, GestureResponderEvent, Animated, TouchableWithoutFeedback} from 'react-native';
import CentralStyles from '../styles/CentralStyles';
import React from 'react';
import {t} from 'i18next';
import Svg, {Circle} from 'react-native-svg';

interface Props {
    source: ComponentProps<typeof Image>['source'];
}

export const ImageCropper = (props: Props) => {
  const leftTopAnimation = useRef(new Animated.ValueXY({x: 0, y: 0}));
  const [currentDragging, setCurrentDragging] = useState<{
    startPageX: number,
    startPageY: number,
    startX: number,
    startY:number,
    corner: 'leftTop'| 'leftBottom'|'rightTop'|'rightBottom'|undefined}>({
      startPageX: 0,
      startPageY: 0,
      startX: 0,
      startY: 0,
      corner: undefined,
    });

  const [rightTop, setRightTop] = useState<{x: number, y:number}>({x: 50, y: 100});
  const [leftBottom, setLeftBottom] = useState<{x: number, y:number}>({x: 100, y: 50});
  const [rightBottom, setRightBottom] = useState<{x: number, y:number}>({x: 100, y: 100});

  const onGestureMove = (gestureEvent: GestureResponderEvent) => {
    if (currentDragging.corner === 'leftTop') {
      leftTopAnimation.current.x.setValue(gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX);
      leftTopAnimation.current.y.setValue( gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY);
    }
  };

  const onGestureRelease = (gestureEvent: GestureResponderEvent) => {
    if (currentDragging.corner === 'leftTop') {
      console.log('Stopped dragging. Started at', currentDragging.startX, currentDragging.startY);
      console.log('Moved by', gestureEvent.nativeEvent.pageX - currentDragging.startPageX, gestureEvent.nativeEvent.pageY - currentDragging.startPageY);
      console.log('Resulting in ', gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX, gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY );
      setCurrentDragging({...currentDragging, corner: undefined});
      leftTopAnimation.current.x.setValue(gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX);
      leftTopAnimation.current.y.setValue( gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY);
    }
  };

  const isWithinBoundsOfLeftTop = (gestureEvent: GestureResponderEvent) => {
    const x = gestureEvent.nativeEvent.locationX;
    const y = gestureEvent.nativeEvent.locationY;
    if (x > (leftTopAnimation.current.x._value - 40) && x < (leftTopAnimation.current.x._value + 40) && y > (leftTopAnimation.current.y._value - 40 ) && y < (leftTopAnimation.current.y._value + 40)) {
      return true;
    }
    return false;
  };


  const gestureHandler = PanResponder.create({
    onStartShouldSetPanResponderCapture: (event, gestureState) => {
      if (isWithinBoundsOfLeftTop(event)) {
        setCurrentDragging({
          startPageX: event.nativeEvent.pageX,
          startPageY: event.nativeEvent.pageY,
          startX: leftTopAnimation.current.x._value,
          startY: leftTopAnimation.current.y._value,
          corner: 'leftTop'});
        console.log('Started dragging', leftTopAnimation.current.x._value, leftTopAnimation.current.y._value);
      }
      return true;
    //   return event.nativeEvent.touches.length === 1;
    },
    onMoveShouldSetPanResponderCapture: ({nativeEvent}) => {
      return true;
    //   return nativeEvent.touches.length === 1;
    },
    onPanResponderMove: onGestureMove,
    onPanResponderRelease: onGestureRelease,
    onPanResponderTerminationRequest: () => {
      return true;
    //   return gestureInProgress.current == undefined;
    },
    onPanResponderTerminate: onGestureRelease,
  });

  const animatedStyle = {
    transform: leftTopAnimation.current.getTranslateTransform(),
  };

  const leftTopStyle = [
    {
      position: 'absolute',
      zIndex: 10,
      // These were saved when the touching started
      // This is not determed via onLayout since the images can be off screen (pagerview) when onLayout is called
      width: 50,
      height: 50,
      opacity: 1,
    },
    animatedStyle,,
    leftTopAnimation.current.getLayout()
  ];

  return (
    <>
      <Animated.View style={[CentralStyles.fullscreen, {position: 'absolute'}]} {...gestureHandler.panHandlers} >
        {/* <TouchableWithoutFeedback>
          <Animated.Image style={leftTopStyle} source={require('../../assets/placeholder.png')}/>
        </TouchableWithoutFeedback> */}
        <Image style={[CentralStyles.fullscreen]} source={props.source} />
        {/* <TouchableOpacity {...gestureHandler.panHandlers}
          style={{position: 'absolute', backgroundColor: 'grey', width: 25, height: 25, borderRadius: 20, top: leftTop.y, left: leftTop.x}}/> */}
        {/* <TouchableOpacity style={{position: 'absolute', backgroundColor: 'grey', width: 25, height: 25, borderRadius: 20, top: rightTop.y, left: rightTop.x}}/>
        <TouchableOpacity style={{position: 'absolute', backgroundColor: 'grey', width: 25, height: 25, borderRadius: 20, top: leftBottom.y, left: leftBottom.x}}/>
    <TouchableOpacity style={{position: 'absolute', backgroundColor: 'grey', width: 25, height: 25, borderRadius: 20, top: rightBottom.y, left: rightBottom.x}}/> */}
      </Animated.View>
      <Svg>
        <Circle cx="100" cy="100" r="100" fill="#D9D9D9"/>
      </Svg>
    </>
  );
};
