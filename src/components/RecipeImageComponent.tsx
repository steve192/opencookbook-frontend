import {Spinner} from '@ui-kitten/components';
import React, {useEffect, useState} from 'react';
import {Image, Platform, StyleSheet, View} from 'react-native';
import {fetchSingleImage} from '../redux/features/imagesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';

interface Props {
    uuid?: string
    forceFitScaling?: boolean
    blurredMode?: boolean
}
export const RecipeImageComponent = (props: Props) => {
  let imageData;
  if (props.uuid) {
    // @ts-ignore
    imageData = useAppSelector((state) => state.images.imageMap[props.uuid]);
  }
  const [requestPending, setRequestPending] = useState<boolean>(false);
  const dispatch = useAppDispatch();


  // Hook for loading images used and putting them in the buffer
  useEffect(() => {
    if (!requestPending && props.uuid) {
      setRequestPending(true);
      dispatch(fetchSingleImage(props.uuid)).finally(() => {
        setRequestPending(false);
      });
    }
  }, [props.uuid]);

  const resizeMode = Platform.OS === 'web' && !props.forceFitScaling ? 'center' : 'cover';

  // Blurring is stronger on web, compensate
  const blurAmount = Platform.OS === 'web' ? 2 : 10;

  return (
    <View style={[styles.recipeImage]}>
      <Image
        blurRadius={props.blurredMode ? blurAmount : undefined}
        source={imageData ? {uri: imageData} : require('../../assets/placeholder.png')}
        style={[styles.recipeImage, {resizeMode: resizeMode}]} >
      </Image>
      {requestPending &&
                <View style={styles.loadingSpinner}>
                  {/* <Spinner size="giant" /> */}
                </View>}

    </View>
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
