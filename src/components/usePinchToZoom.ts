import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, GestureResponderEvent, GestureResponderHandlers, Image, ImageStyle, NativeTouchEvent, PanResponder, PanResponderGestureState, StyleProp} from 'react-native';

const SCALE_MULTIPLIER = 1;

function pow2abs(a: number, b: number) {
  return Math.pow(Math.abs(a - b), 2);
}

function getDistanceBetween2Touches(touches: NativeTouchEvent[]) {
  const [a, b] = touches;
  if (a == null || b == null) {
    return 0;
  }
  return Math.sqrt(pow2abs(a.pageX, b.pageX) + pow2abs(a.pageY, b.pageY));
}

function getMiddleBetween2Touches(touches: NativeTouchEvent[]) {
  const [a, b] = touches;
  if (a == null || b == null) {
    return {x: 0, y: 0};
  }
  return {x: a.pageX, y: a.pageY};
}

function getDeltaTranslation(position: {x: number, y:number}, initial: {x: number, y:number}) {
  return {x: position.x - initial.x, y: position.y - initial.y};
}

function calculateScale(currentDistance: number, initialDistance: number) {
  return (currentDistance / initialDistance) * SCALE_MULTIPLIER;
}

function calculateScaleFromTouches(touches: NativeTouchEvent[], initialTouches: NativeTouchEvent[]) {
  const distanceBetweenFingers = getDistanceBetween2Touches(touches);
  const initialDistanceBetweenFingers = getDistanceBetween2Touches(initialTouches);
  return calculateScale(distanceBetweenFingers, initialDistanceBetweenFingers);
}

/** What a picture needs to take part in being pinched. */
export interface PinchToZoom {
  /** Belongs on the picture: where it sits on screen is where the zoomed copy starts from. */
  imageRef: React.RefObject<Image | null>;
  /** Spread onto the view wrapping the picture. */
  panHandlers: GestureResponderHandlers;
  /** The picture itself fades out while the zoomed copy stands in for it. */
  opacity: Animated.Value;
  isDragging: boolean;
  /** For the copy drawn above everything else while two fingers are down. */
  overlayStyle: StyleProp<ImageStyle>;
}

/**
 * Pinching a picture to zoom it.
 *
 * The picture cannot grow where it sits, since it is clipped by whatever holds it, so a
 * copy is drawn over the whole screen and follows the fingers while the original fades
 * out underneath. Once the fingers lift, the copy animates back onto the original.
 *
 * @return {PinchToZoom} the handlers and animated values to render with
 */
export const usePinchToZoom = (): PinchToZoom => {
  const [isDragging, setIsDragging] = useState(false);

  const gestureInProgress = useRef<number | undefined>(undefined);
  const initialTouches = useRef<NativeTouchEvent[] | undefined>(undefined);
  const initialImageSize = useRef<{width: number, height: number} | undefined>(undefined);
  const imageRef = useRef<Image>(null);

  const pinchImagePosition = useRef(new Animated.ValueXY());
  const scaleValue = useRef(new Animated.Value(1));
  const opacity = useRef(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(opacity.current, {
      useNativeDriver: true,
      toValue: isDragging ? 0 : 1,
      duration: 200,
    }).start();
  }, [isDragging]);

  const onStartGesture = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureInProgress.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const {touches} = event.nativeEvent;

    imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      pinchImagePosition.current.setValue({x: 0, y: 0});
      pinchImagePosition.current.setOffset({x: pageX, y: pageY});
      initialImageSize.current = {width: width, height: height};
      initialTouches.current = touches;
      gestureInProgress.current = gestureState.stateID;
      setIsDragging(true);
    });
  };

  // The copy has arrived back over the picture: park it there and, a frame later once it
  // is gone, show the picture again. Swapping both in one go shows neither for a frame.
  const handBackTo = (pageX: number, pageY: number) => {
    pinchImagePosition.current.setOffset({x: pageX, y: pageY});
    requestAnimationFrame(() => {
      opacity.current.setValue(1);
      setIsDragging(false);
    });
  };

  const onGestureRelease = (): void => {
    if (!gestureInProgress.current) {
      return;
    }
    gestureInProgress.current = undefined;
    imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      initialTouches.current = [];
      Animated.parallel(backToPlace(pinchImagePosition.current, scaleValue.current))
          .start(() => handBackTo(pageX, pageY));
    });
  };

  const onGestureMove = (event: GestureResponderEvent) => {
    const {touches} = event.nativeEvent;
    if (!gestureInProgress.current) {
      return;
    }

    if (touches.length < 2) {
      onGestureRelease();
      return;
    }

    const currentTouchPosition = getMiddleBetween2Touches(touches);
    const initialTouchPosition = getMiddleBetween2Touches(initialTouches.current!);

    const {x, y} = getDeltaTranslation(currentTouchPosition, initialTouchPosition);
    pinchImagePosition.current.x.setValue(x);
    pinchImagePosition.current.y.setValue(y);

    const newScale = calculateScaleFromTouches(touches, initialTouches.current!);
    scaleValue.current.setValue(Math.max(newScale, 1));
  };

  const panHandlers = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: ({nativeEvent}) => nativeEvent.touches.length === 2,
    onMoveShouldSetPanResponderCapture: ({nativeEvent}) => nativeEvent.touches.length === 2,
    onPanResponderGrant: onStartGesture,
    onPanResponderMove: onGestureMove,
    onPanResponderRelease: onGestureMove,
    onPanResponderTerminationRequest: () => gestureInProgress.current == undefined,
    onPanResponderTerminate: onGestureRelease,
  }).panHandlers, []);

  const overlayStyle: StyleProp<ImageStyle> = [
    {
      position: 'absolute',
      zIndex: 10,
      // Saved when touching started. We avoid onLayout since images can be off-screen
      // (pager view) when onLayout fires.
      width: initialImageSize.current?.width,
      height: initialImageSize.current?.height,
      opacity: 1,
    },
    {
      transform: [
        ...pinchImagePosition.current.getTranslateTransform(),
        {scale: scaleValue.current},
      ],
    },
  ];

  return {imageRef, panHandlers, opacity: opacity.current, isDragging, overlayStyle};
};

/**
 * @param {Animated.ValueXY} position where the copy has been dragged to
 * @param {Animated.Value} scale how far it has been zoomed
 * @return {Animated.CompositeAnimation[]} the animations that put it back over the original
 */
const backToPlace = (position: Animated.ValueXY, scale: Animated.Value): Animated.CompositeAnimation[] => {
  const settle = (value: Animated.Value, toValue: number) => Animated.timing(value, {
    useNativeDriver: true,
    toValue: toValue,
    duration: 100,
    easing: Easing.linear,
  });
  return [settle(position.x, 0), settle(position.y, 0), settle(scale, 1)];
};
