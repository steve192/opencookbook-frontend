import React, {ComponentProps, useEffect, useState} from 'react';
import {GestureResponderEvent, LayoutRectangle, PanResponder} from 'react-native';
import Reanimated, {interpolate, useAnimatedProps, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';
import Svg, {Circle, ClipPath, Defs, G, Image, Line, Mask, Polygon, Rect} from 'react-native-svg';
import CentralStyles from '../styles/CentralStyles';
import {CameraCapturedPicture} from 'expo-camera';

interface Props {
    source: CameraCapturedPicture;
    onPointsChange: (
      point1: {x: number, y:number},
      point2: {x: number, y:number},
      point3: {x: number, y:number},
      point4: {x: number, y:number}) => void
}

const ReanimatedCircle = Reanimated.createAnimatedComponent(Circle);
const ReanimatedLine = Reanimated.createAnimatedComponent(Line);
const ReanimatedPolygon = Reanimated.createAnimatedComponent(Polygon);

export const ImageCropper = (props: Props) => {
  const [imageLayout, setImageLayout] = useState<LayoutRectangle>();

  const leftTopAnimation = useSharedValue({x: 50, y: 50});
  const rightTopAnimation = useSharedValue({x: 50, y: 100});
  const leftBottomAnimation = useSharedValue({x: 100, y: 50});
  const rightBottomAnimation = useSharedValue({x: 100, y: 100});
  const [currentDragging, setCurrentDragging] = useState<{
    startPageX: number,
    startPageY: number,
    startX: number,
    startY: number,
    corner: 'leftTop'| 'leftBottom'|'rightTop'|'rightBottom'|undefined}>({
      startPageX: 0,
      startPageY: 0,
      startX: 0,
      startY: 0,
      corner: undefined,
    });

  useEffect(() => {
    // TODO: Enable and check what crashes
    // sendPointsChanged();
  }, [imageLayout]);

  const onGestureMove = (gestureEvent: GestureResponderEvent) => {
    if (currentDragging.corner === 'leftTop') {
      // leftTopAnimation.value = withTiming( {x: gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX, y: gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY});
      leftTopAnimation.value = {x: gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX, y: gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY};
    } else if (currentDragging.corner === 'rightTop') {
      rightTopAnimation.value = {x: gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX, y: gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY};
    } else if (currentDragging.corner === 'leftBottom') {
      leftBottomAnimation.value = {x: gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX, y: gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY};
    } else if (currentDragging.corner === 'rightBottom') {
      rightBottomAnimation.value = {x: gestureEvent.nativeEvent.pageX - currentDragging.startPageX + currentDragging.startX, y: gestureEvent.nativeEvent.pageY - currentDragging.startPageY + currentDragging.startY};
    }
  };

  const sendPointsChanged = () => {
    props.onPointsChange(
        {
          x: interpolate(leftTopAnimation.value.x - imageLayout!.x, [0, imageLayout!.width], [0, props.source.width]),
          y: interpolate(leftTopAnimation.value.y - imageLayout!.y, [0, imageLayout!.height], [0, props.source.height]),
        },
        {
          x: interpolate(rightTopAnimation.value.x - imageLayout!.x, [0, imageLayout!.width], [0, props.source.width]),
          y: interpolate(rightTopAnimation.value.y - imageLayout!.y, [0, imageLayout!.height], [0, props.source.height]),
        },
        {
          x: interpolate(rightBottomAnimation.value.x - imageLayout!.x, [0, imageLayout!.width], [0, props.source.width]),
          y: interpolate(rightBottomAnimation.value.y - imageLayout!.y, [0, imageLayout!.height], [0, props.source.height]),
        },
        {
          x: interpolate(leftBottomAnimation.value.x - imageLayout!.x, [0, imageLayout!.width], [0, props.source.width]),
          y: interpolate(leftBottomAnimation.value.y - imageLayout!.y, [0, imageLayout!.height], [0, props.source.height]),
        },
    );
  };

  const onGestureRelease = (gestureEvent: GestureResponderEvent) => {
    setCurrentDragging({...currentDragging, corner: undefined});
    sendPointsChanged();
  };

  const isWithinBoundsOfLeftTop = (gestureEvent: GestureResponderEvent) => {
    const x = gestureEvent.nativeEvent.locationX;
    const y = gestureEvent.nativeEvent.locationY;
    if (x > (leftTopAnimation.value.x - 40) && x < (leftTopAnimation.value.x + 40) && y > (leftTopAnimation.value.y - 40 ) && y < (leftTopAnimation.value.y + 40)) {
      return true;
    }
    return false;
  };
  const isWithinBoundsOfRightTop = (gestureEvent: GestureResponderEvent) => {
    const x = gestureEvent.nativeEvent.locationX;
    const y = gestureEvent.nativeEvent.locationY;
    if (x > (rightTopAnimation.value.x - 40) && x < (rightTopAnimation.value.x + 40) && y > (rightTopAnimation.value.y - 40 ) && y < (rightTopAnimation.value.y + 40)) {
      return true;
    }
    return false;
  };
  const isWithinBoundsOfLeftBottom = (gestureEvent: GestureResponderEvent) => {
    const x = gestureEvent.nativeEvent.locationX;
    const y = gestureEvent.nativeEvent.locationY;
    if (x > (leftBottomAnimation.value.x - 40) && x < (leftBottomAnimation.value.x + 40) && y > (leftBottomAnimation.value.y - 40 ) && y < (leftBottomAnimation.value.y + 40)) {
      return true;
    }
    return false;
  };
  const isWithinBoundsOfRightBottom = (gestureEvent: GestureResponderEvent) => {
    const x = gestureEvent.nativeEvent.locationX;
    const y = gestureEvent.nativeEvent.locationY;
    if (x > (rightBottomAnimation.value.x - 40) && x < (rightBottomAnimation.value.x + 40) && y > (rightBottomAnimation.value.y - 40 ) && y < (rightBottomAnimation.value.y + 40)) {
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
          startX: leftTopAnimation.value.x,
          startY: leftTopAnimation.value.y,
          corner: 'leftTop'});
      } else if (isWithinBoundsOfRightTop(event)) {
        setCurrentDragging({
          startPageX: event.nativeEvent.pageX,
          startPageY: event.nativeEvent.pageY,
          startX: rightTopAnimation.value.x,
          startY: rightTopAnimation.value.y,
          corner: 'rightTop'});
      } else if (isWithinBoundsOfLeftBottom(event)) {
        setCurrentDragging({
          startPageX: event.nativeEvent.pageX,
          startPageY: event.nativeEvent.pageY,
          startX: leftBottomAnimation.value.x,
          startY: leftBottomAnimation.value.y,
          corner: 'leftBottom'});
      } else if (isWithinBoundsOfRightBottom(event)) {
        setCurrentDragging({
          startPageX: event.nativeEvent.pageX,
          startPageY: event.nativeEvent.pageY,
          startX: rightBottomAnimation.value.x,
          startY: rightBottomAnimation.value.y,
          corner: 'rightBottom'});
      }
      return true;
    },
    onMoveShouldSetPanResponderCapture: ({nativeEvent}) => {
      return true;
    },
    onPanResponderMove: onGestureMove,
    onPanResponderRelease: onGestureRelease,
    onPanResponderTerminationRequest: () => {
      return true;
    },
    onPanResponderTerminate: onGestureRelease,
  });

  const leftTopAnimatedProps = useAnimatedProps(() => ({
    cx: leftTopAnimation.value.x,
    cy: leftTopAnimation.value.y,
  }));
  const rightTopAnimatedProps = useAnimatedProps(() => ({
    cx: rightTopAnimation.value.x,
    cy: rightTopAnimation.value.y,
  }));
  const leftBottomAnimatedProps = useAnimatedProps(() => ({
    cx: leftBottomAnimation.value.x,
    cy: leftBottomAnimation.value.y,
  }));
  const rightBottomAnimatedProps = useAnimatedProps(() => ({
    cx: rightBottomAnimation.value.x,
    cy: rightBottomAnimation.value.y,
  }));


  const line1Props = useAnimatedProps(() => ({
    x1: leftTopAnimation.value.x,
    y1: leftTopAnimation.value.y,
    x2: rightTopAnimation.value.x,
    y2: rightTopAnimation.value.y,
  }));
  const line2Props = useAnimatedProps(() => ({
    x1: rightTopAnimation.value.x,
    y1: rightTopAnimation.value.y,
    x2: rightBottomAnimation.value.x,
    y2: rightBottomAnimation.value.y,
  }));
  const line3Props = useAnimatedProps(() => ({
    x1: rightBottomAnimation.value.x,
    y1: rightBottomAnimation.value.y,
    x2: leftBottomAnimation.value.x,
    y2: leftBottomAnimation.value.y,
  }));
  const line4Props = useAnimatedProps(() => ({
    x1: leftBottomAnimation.value.x,
    y1: leftBottomAnimation.value.y,
    x2: leftTopAnimation.value.x,
    y2: leftTopAnimation.value.y,
  }));

  const maskProps = useAnimatedProps(() => {
    return {
      points: [
        [leftTopAnimation.value.x, leftTopAnimation.value.y],
        [rightTopAnimation.value.x, rightTopAnimation.value.y],
        [rightBottomAnimation.value.x, rightBottomAnimation.value.y],
        [leftBottomAnimation.value.x, leftBottomAnimation.value.y],
      ],
    };
  });

  return (
    <>
      <Svg>
        <Defs>
          <Mask id="mask1">
            <G>
              <Rect x="0" y="0" width="100%" height="100%" fill="white" />
              <ReanimatedPolygon
                animatedProps={maskProps}
                fill="black"
              />
            </G>
          </Mask>
        </Defs>

        <Image
          onLayout={(layoutEvent) => {
            const layout = layoutEvent.nativeEvent.layout;
            setImageLayout(layout);
            const border = 50;
            leftTopAnimation.value = {
              x: layout.x + border,
              y: layout.y + border,
            };
            rightTopAnimation.value = {
              x: layout.x + layout.width - border,
              y: layout.y + border,
            };

            rightBottomAnimation.value = {
              x: layout.x + layout.width - border,
              y: layout.y + layout.height - border,
            };
            leftBottomAnimation.value = {
              x: layout.x+ border,
              y: layout.y + layout.height - border,
            };
          }}
          x="0"
          y="0"
          width="100%"
          height="100%"
          href={props.source} />
        <Rect height="100%" width="100%" x={0} y={0} stroke="#FF0000" fill="white" fillOpacity={0.3} mask='#mask1'/>
        <ReanimatedLine animatedProps={line1Props} stroke="#FFFFFF" strokeWidth={10}/>
        <ReanimatedLine animatedProps={line2Props} stroke="#FFFFFF" strokeWidth={10}/>
        <ReanimatedLine animatedProps={line3Props} stroke="#FFFFFF" strokeWidth={10}/>
        <ReanimatedLine animatedProps={line4Props} stroke="#FFFFFF" strokeWidth={10}/>
        <ReanimatedCircle animatedProps={leftTopAnimatedProps} r="10" fill="#D9D9D9"/>
        <ReanimatedCircle animatedProps={rightTopAnimatedProps} r="10" fill="#D9D9D9"/>
        <ReanimatedCircle animatedProps={leftBottomAnimatedProps} r="10" fill="#D9D9D9"/>
        <ReanimatedCircle animatedProps={rightBottomAnimatedProps} r="10" fill="#D9D9D9"/>
      </Svg>
      <Reanimated.View style={[CentralStyles.fullscreen, {position: 'absolute'}]} {...gestureHandler.panHandlers} />
    </>
  );
};
