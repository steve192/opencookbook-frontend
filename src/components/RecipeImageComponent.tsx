import React, {useEffect, useState} from 'react';
import {Animated, Image, Platform, StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {fetchSingleImage, fetchSingleThumbnailImage} from '../redux/features/imagesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {RootState} from '../redux/store';
import {useImageAccess} from './ImageAccessContext';
import {usePinchToZoom} from './usePinchToZoom';

interface Props {
    uuid?: string
    forceFitScaling?: boolean
    useThumbnail?: boolean
    blurredMode?: boolean
    zoomable?: boolean
}

/**
 * @param {string} [uuid] the image to read, absent while a recipe has none
 * @param {boolean} [useThumbnail] whether the small copy is enough
 * @return {Function} reads that image out of the buffer, undefined until it has been loaded
 */
const bufferedImage = (uuid?: string, useThumbnail?: boolean) => (state: RootState): string | undefined => {
  if (!uuid) {
    return undefined;
  }
  return useThumbnail ? state.images.thumbnailImageMap[uuid] : state.images.imageMap[uuid];
};

// Memoized so that scroll-induced parent re-renders don't re-create the gesture
// handlers / fire a new fetch for already-loaded thumbnails. Props are flat
// primitives so the default shallow comparison is sufficient.
export const RecipeImageComponent = React.memo(function RecipeImageComponent(props: Props) {
  const imageData = useAppSelector(bufferedImage(props.uuid, props.useThumbnail));

  const [requestPending, setRequestPending] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  // Set when this image belongs to a recipe somebody shared, in which case it has to be read
  // through the share: the viewer may well have no account at all.
  const viaShare = useImageAccess();

  const {imageRef, panHandlers, opacity, isDragging, overlayStyle} = usePinchToZoom();

  // Hook for loading images used and putting them in the buffer
  useEffect(() => {
    if (!requestPending && props.uuid) {
      setRequestPending(true);
      const request = {uuid: props.uuid, viaShare: viaShare};
      const load = props.useThumbnail ? fetchSingleThumbnailImage(request) : fetchSingleImage(request);
      dispatch(load).finally(() => {
        setRequestPending(false);
      });
    }
  }, [props.uuid, viaShare]);

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
        {requestPending &&
                <View style={styles.loadingSpinner}>
                  {/* <Spinner size="giant" /> */}
                </View>}

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
