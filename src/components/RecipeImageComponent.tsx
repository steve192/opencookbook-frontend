import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, GestureResponderEvent, Image, NativeTouchEvent, PanResponder, PanResponderGestureState, Platform, StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {fetchSingleImage, fetchSingleThumbnailImage} from '../redux/features/imagesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {RootState} from '../redux/store';

interface Props {
    uuid?: string
    forceFitScaling?: boolean
    useThumbnail?: boolean
    blurredMode?: boolean
    zoomable?: boolean
}
export const RecipeImageComponent = (props: Props) => {
  const selector = !props.uuid ?
      () => undefined :
      props.useThumbnail ?
      (state: RootState) => state.images.thumbnailImageMap[props.uuid!] :
      (state: RootState) => state.images.imageMap[props.uuid!];

  const imageData = useAppSelector(selector);

  const [requestPending, setRequestPending] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const [isDragging, setIsDragging] = useState(false);

  const gestureInProgress = useRef<number>();
  const initialTouches = useRef<NativeTouchEvent[]>();
  const initialImageSize = useRef<{width: number, height:number}>();
  const imageRef = useRef<Image>(null);

  const pinchImagePosition = useRef(new Animated.ValueXY());
  const scaleValue = useRef(new Animated.Value(1));


  // Hook for loading images used and putting them in the buffer
  useEffect(() => {
    if (!requestPending && props.uuid) {
      setRequestPending(true);
      if (props.useThumbnail) {
        dispatch(fetchSingleThumbnailImage(props.uuid)).finally(() => {
          setRequestPending(false);
        });
      } else {
        dispatch(fetchSingleImage(props.uuid)).finally(() => {
          setRequestPending(false);
        });
      }
    }
  }, [props.uuid]);

  const resizeMode = Platform.OS === 'web' && !props.forceFitScaling ? 'center' : 'cover';

  // Blurring is stronger on web, compensate
  const blurAmount = Platform.OS === 'web' ? 2 : 10;

  useEffect(() => {
    Animated.timing(opacity.current, {
      useNativeDriver: true,
      toValue: isDragging ? 0 : 1,
      duration: 200,
    }).start();
  }, [isDragging]);

  const onStartGesture = (event: GestureResponderEvent, gestureState: PanResponderGestureState ) => {
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

  const onGestureMove = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const {touches} = event.nativeEvent;
    if (!gestureInProgress.current) {
      return;
    }

    if (touches.length < 2) {
      onGestureRelease(event, gestureState);
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

  const onGestureRelease = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    return new Promise<void>((resolve) => {
      if (!gestureInProgress.current) {
        return;
      }
      gestureInProgress.current = undefined;
      imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
        initialTouches.current = [];

        Animated.parallel([
          Animated.timing(pinchImagePosition.current.x, {
            useNativeDriver: true,
            toValue: 0,
            duration: 100,
            easing: Easing.linear,
          }),
          Animated.timing(pinchImagePosition.current.y, {
            useNativeDriver: true,
            toValue: 0,
            duration: 100,
            easing: Easing.linear,
          }),
          Animated.timing(scaleValue.current, {
            useNativeDriver: true,
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
          }),
        ]).start(() => {
          pinchImagePosition.current.setOffset({
            x: pageX,
            y: pageY,
          });
          requestAnimationFrame(() => {
            console.log('done');
            opacity.current.setValue(1);
            setIsDragging(false);
          });
        });
        resolve();
      });
    });
  };

  useEffect(() => {

  }, []);


  const gestureHandler = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponderCapture: ({nativeEvent}) => {
        return nativeEvent.touches.length === 2;
      },
      onMoveShouldSetPanResponderCapture: ({nativeEvent}) => {
        return nativeEvent.touches.length === 2;
      },
      onPanResponderGrant: onStartGesture,
      onPanResponderMove: onGestureMove,
      onPanResponderRelease: onGestureMove,
      onPanResponderTerminationRequest: () => {
        return gestureInProgress.current == undefined;
      },
      onPanResponderTerminate: (event, gestureState) => {
        onGestureRelease(event, gestureState);
      },
    });
  }, []);


  const opacity = useRef(new Animated.Value(1));

  const animatedViewProps = props.zoomable ? gestureHandler.panHandlers: null;
  const image =
  <Animated.View
    {...animatedViewProps}
    style={[{
      opacity: opacity.current,
    }, styles.recipeImage]}
  >
    <Image
      ref={imageRef}
      blurRadius={props.blurredMode ? blurAmount : undefined}
      source={imageData ? {uri: imageData} : require('../../assets/placeholder.png')}
      style={[styles.recipeImage, {resizeMode: resizeMode}]} />
  </Animated.View>;


  let overlayImage;
  if (isDragging) {
    const animatedStyle = {
      transform: pinchImagePosition.current.getTranslateTransform(),
    };
    animatedStyle.transform.push({
      scale: scaleValue.current,
    });

    const imageStyle = [
      {
        position: 'absolute',
        zIndex: 10,
        // These were saved when the touching started
        // This is not determed via onLayout since the images can be off screen (pagerview) when onLayout is called
        width: initialImageSize.current?.width,
        height: initialImageSize.current?.height,
        opacity: 1,
      },
      animatedStyle,
    ];

    overlayImage =
     <Portal>
       <View style={{
         position: 'absolute',
         top: 0,
         left: 0,
         bottom: 0,
         right: 0,
       }}>
         <Animated.View style={{
           position: 'absolute',
           top: 0,
           left: 0,
           bottom: 0,
           right: 0,

         }}>
           <Animated.Image
             style={imageStyle}
             source={imageData ? {uri: imageData} : require('../../assets/placeholder.png')}>
           </Animated.Image>
         </Animated.View>
       </View>
     </Portal>;
  }

  return (
    <>
      <View style={[styles.recipeImage]}>
        {image}
        {requestPending &&
                <View style={styles.loadingSpinner}>
                  {/* <Spinner size="giant" /> */}
                </View>}

      </View>
      { isDragging && overlayImage }
    </>
  );
};


const styles = StyleSheet.create({
  loadingSpinner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    flex: 1,

  },
});


function calculateScaleFromTouches(touches: NativeTouchEvent[], initialTouches: NativeTouchEvent[]) {
  const distanceBetweenFingers = getDistanceBetween2Touches(touches);
  const initialDistanceBetweenFingers = getDistanceBetween2Touches(initialTouches);
  const scale = calculateScale(distanceBetweenFingers, initialDistanceBetweenFingers);
  return scale;
}

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

const SCALE_MULTIPLIER = 1;

function calculateScale(currentDistance: number, initialDistance: number) {
  return (currentDistance / initialDistance) * SCALE_MULTIPLIER;
}
