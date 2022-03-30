import * as ImagePicker from 'expo-image-picker';
import React, {useRef, useState} from 'react';
import {Image, Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import PagerView from 'react-native-pager-view';
import {Avatar, IconButton, Text} from 'react-native-paper';
import {Swiper, SwiperSlide} from 'swiper/react/swiper-react';
import RestAPI, {RecipeImage} from '../dao/RestAPI';
import {RecipeImageComponent} from './RecipeImageComponent';


interface Props {
    onImageAdded?: (uuid: string) => void,
    images: RecipeImage[],
    allowEdit?: boolean,
    style: StyleProp<ViewStyle>
}

export const RecipeImageViewPager = (props: Props) => {
  const [shownImageIndex, setShownImageIndex] = useState<number>(0);
  const pagerRef = useRef();

  const selectImage = async () => {
    // Ask the user for the permission to access the media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();


    if (!permissionResult.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({base64: true});
    if (result.cancelled) {
      return;
    }

    await RestAPI.uploadImage(result.uri).then((uuid) => {
      props.onImageAdded?.(uuid);
    }).catch((error) => {
      // TODO: Error handling
      console.error(error);
      alert('Error uploading picture');
    });
  };

  const renderWebViewpager = () => {
    <Swiper
      onActiveIndexChange={(e) => setShownImageIndex(e.activeIndex)}
      tabIndex={shownImageIndex}
    >
      {props.images.map((image, imageIndex) =>
        <SwiperSlide key={image.uuid}>
          <RecipeImageComponent
            key={image.uuid}
            uuid={image.uuid} />
        </SwiperSlide>,
      )}
    </Swiper>;
  };

  return (
    <View style={[styles.recipeImageContainer, props.style]}>
      <PagerView
        ref={pagerRef.current}
        initialPage={shownImageIndex}
        onPageSelected={(event) => setShownImageIndex(event.nativeEvent.position)}
        style={styles.recipeImage}>
        {props.images.length === 0 ?
                    <Image
                      source={require('../../assets/placeholder.png')}
                      style={styles.recipeImage} /> :

                    props.images.map((image, imageIndex) =>
                      <RecipeImageComponent
                        key={image.uuid}
                        uuid={image.uuid} />,
                    )}
      </PagerView>

      {shownImageIndex !== 0 &&
                <Pressable
                  onPress={() => setShownImageIndex(shownImageIndex - 1)}
                  style={styles.backwardButton}>
                  <Avatar.Icon icon="arrow-left" size={50} color="rgb(209,209,209)" />
                </Pressable>
      }

      {shownImageIndex !== props.images.length - 1 &&
                <Pressable
                  style={styles.forwardButton}
                  onPress={() => setShownImageIndex(shownImageIndex + 1)}>
                  <Avatar.Icon icon="arrow-right" size={50} color="rgb(209,209,209)" />
                </Pressable>
      }

      {props.allowEdit &&
          <IconButton
            onPress={selectImage}
            style={styles.imageButton}
            icon="camera-outline"
          />
      }

      <Text style={styles.indexIndicator}>{shownImageIndex + 1} / {props.images.length}</Text>


    </View>
  );
};

const styles = StyleSheet.create({
  backwardButton: {
    position: 'absolute',
    left: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    height: '100%',

  },
  forwardButton: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    height: '100%',
  },
  indexIndicator: {
    // fontWeight: "bold",
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: 'white',
    backgroundColor: 'rgba( 0,0,0,0.3)',
    borderRadius: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 13,
  },
  recipeImageContainer: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(161, 161, 161)',
  },
  imageButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'grey',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
});
