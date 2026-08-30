import * as ImagePicker from 'expo-image-picker';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Avatar, IconButton, Text} from 'react-native-paper';
import RestAPI, {RecipeImage} from '../dao/RestAPI';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {PromptUtil} from '../helper/Prompt';
import {TITLE_IMAGE_INDEX, moveImage} from '../helper/recipeImages';
import {RecipeImageComponent} from './RecipeImageComponent';
import {ViewPager} from './ViewPager';

interface Props {
    onImageAdded?: (uuid: string) => void,
    /** Called with the image the user chose to remove. Only reachable when allowEdit is set. */
    onImageRemoved?: (uuid: string) => void,
    /** Called with the images in their new order. Only reachable when allowEdit is set. */
    onImagesReordered?: (images: RecipeImage[]) => void,
    images: RecipeImage[],
    allowEdit?: boolean,
    style: StyleProp<ViewStyle>
}

export const RecipeImageViewPager = (props: Props) => {
  const [shownImageIndex, setShownImageIndex] = useState<number>(0);

  const {t} = useTranslation('translation');

  // Clamp the active index when the image list changes (e.g. delete, swap, or
  // navigate to a different recipe).  Without this the indicator can read
  // "5 / 2" until the user touches the pager.
  useEffect(() => {
    if (shownImageIndex > 0 && shownImageIndex >= props.images.length) {
      setShownImageIndex(Math.max(0, props.images.length - 1));
    }
  }, [props.images.length, shownImageIndex]);

  const hasImages = props.images.length > 0;
  const showBackward = hasImages && shownImageIndex > 0;
  const showForward = hasImages && shownImageIndex < props.images.length - 1;

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({base64: true});
    if (result.canceled) {
      return;
    }

    try {
      const uuid = await RestAPI.uploadImage(result.assets[0].uri);
      props.onImageAdded?.(uuid);
    } catch (error) {
      console.error('Error uploading image', error);
      SnackbarUtil.show({message: t('screens.editRecipe.imageUploadFailed')});
    }
  };

  // Only unlinks the image here. The recipe still has to be saved for it to be gone, so
  // abandoning the form leaves the image on the recipe it still belongs to.
  const removeShownImage = () => {
    const shownImage = props.images[shownImageIndex];
    if (!shownImage) {
      return;
    }

    PromptUtil.show({
      title: t('screens.editRecipe.deleteImageTitle'),
      message: t('screens.editRecipe.deleteImageMessage'),
      button1: t('common.delete'),
      button1Callback: () => props.onImageRemoved?.(shownImage.uuid),
      button2: t('common.cancel'),
    });
  };

  // Keeps the pager on the image that was moved, so repeated presses walk it along
  const moveShownImage = (offset: number) => {
    const reordered = moveImage(props.images, shownImageIndex, offset);
    if (reordered === props.images) {
      return;
    }

    props.onImagesReordered?.(reordered);
    setShownImageIndex(shownImageIndex + offset);
  };

  return (
    <View
      testID='recipe-image-viewpager'
      style={[styles.recipeImageContainer, props.style]}>
      <ViewPager
        selectedIndex={shownImageIndex}
        onIndexChange={setShownImageIndex}
        style={styles.recipeImage}>
        {hasImages ?
          props.images.map((image) =>
            <RecipeImageComponent
              zoomable={true}
              useThumbnail={false}
              key={image.uuid}
              uuid={image.uuid} />,
          ) :
          <Image
            source={require('../../assets/placeholder.png')}
            style={styles.recipeImage} />
        }
      </ViewPager>

      {showBackward &&
        <Pressable
          testID='recipe-image-viewpager-back'
          onPress={() => setShownImageIndex((i) => Math.max(0, i - 1))}
          style={styles.backwardButton}>
          <Avatar.Icon icon="arrow-left" size={50} color="rgb(209,209,209)" />
        </Pressable>
      }

      {showForward &&
        <Pressable
          testID='recipe-image-viewpager-forward'
          style={styles.forwardButton}
          onPress={() => setShownImageIndex((i) => Math.min(props.images.length - 1, i + 1))}>
          <Avatar.Icon icon="arrow-right" size={50} color="rgb(209,209,209)" />
        </Pressable>
      }

      {props.allowEdit &&
        <View style={styles.editButtonRow}>
          {hasImages && <>
            <IconButton
              testID='recipe-image-viewpager-move-back'
              onPress={() => moveShownImage(-1)}
              disabled={!showBackward}
              style={styles.imageButton}
              icon="arrow-left-bold"
            />
            <IconButton
              testID='recipe-image-viewpager-move-forward'
              onPress={() => moveShownImage(1)}
              disabled={!showForward}
              style={styles.imageButton}
              icon="arrow-right-bold"
            />
            <IconButton
              testID='recipe-image-viewpager-remove'
              onPress={removeShownImage}
              style={styles.imageButton}
              icon="delete-outline"
            />
          </>}
          <IconButton
            testID='recipe-image-viewpager-add'
            onPress={selectImage}
            style={styles.imageButton}
            icon="camera-outline"
          />
        </View>
      }

      {props.allowEdit && hasImages && shownImageIndex === TITLE_IMAGE_INDEX &&
        <Text
          testID='recipe-image-viewpager-title-image'
          style={[styles.badge, styles.titleImageBadge]}>
          {t('screens.editRecipe.titleImage')}
        </Text>
      }

      {hasImages &&
        <Text
          testID='recipe-image-viewpager-indicator'
          style={[styles.badge, styles.indexIndicator]}>
          {shownImageIndex + 1} / {props.images.length}
        </Text>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  backwardButton: {
    position: 'absolute',
    left: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100%',
  },
  forwardButton: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 13,
  },
  indexIndicator: {
    bottom: 10,
    left: 10,
  },
  titleImageBadge: {
    top: 10,
    left: 10,
  },
  recipeImageContainer: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(161, 161, 161)',
  },
  // One row so the buttons lay themselves out instead of each carrying its own offset
  editButtonRow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
  imageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'grey',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
});
