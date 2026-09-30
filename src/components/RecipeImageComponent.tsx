import React from 'react';
import {Animated, Image, Platform, StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {useRecipeImage} from '../offline/useRecipeImage';
import {usePinchToZoom} from './usePinchToZoom';

interface Props {
    uuid?: string
    forceFitScaling?: boolean
    useThumbnail?: boolean
    blurredMode?: boolean
    zoomable?: boolean
}

// Memoized so that scroll-induced parent re-renders don't re-create the gesture
// handlers / fire a new fetch for already-loaded thumbnails. Props are flat
// primitives so the default shallow comparison is sufficient.
export const RecipeImageComponent = React.memo(function RecipeImageComponent(props: Props) {
  const imageData = useRecipeImage(props.uuid, props.useThumbnail ? 'thumbnail' : 'full');

  const {imageRef, panHandlers, opacity, isDragging, overlayStyle} = usePinchToZoom();

  const resizeMode = Platform.OS === 'web' && !props.forceFitScaling ? 'center' : 'cover';

  // Blurring is stronger on web, compensate
  const blurAmount = Platform.OS === 'web' ? 2 : 10;

  const source = imageData ? {uri: imageData} : require('../../assets/placeholder.png');

  return (
    <>
      <View style={[styles.recipeImage]}>
        <Animated.View
          {...(props.zoomable ? panHandlers : null)}
          style={[{opacity: opacity}, styles.recipeImage]}
        >
          <Image
            ref={imageRef}
            blurRadius={props.blurredMode ? blurAmount : undefined}
            source={source}
            style={[styles.recipeImage, {resizeMode: resizeMode}]} />
        </Animated.View>
      </View>
      {isDragging &&
        <Portal>
          <View style={StyleSheet.absoluteFill}>
            <Animated.Image style={overlayStyle} source={source} />
          </View>
        </Portal>}
    </>
  );
});


const styles = StyleSheet.create({
  recipeImage: {
    width: '100%',
    height: '100%',
    flex: 1,

  },
});
