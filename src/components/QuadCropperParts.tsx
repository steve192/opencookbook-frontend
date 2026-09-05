/**
 * Everything the two cropper implementations have in common: where the picture ends up, and the
 * outline, handles and magnifier drawn over it. Only recognising a drag differs by platform.
 */

import React, {useEffect, useState} from 'react';
import {Image, LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {loupePlacement} from '../helper/cropperLoupe';
import {containedImageRect, Rect, Size} from '../helper/imageFit';
import {EDGE_THICKNESS, outlinePlacements} from '../helper/quadEdges';
import {Crop, CropCorner} from '../helper/recipeScanCrop';
import {HANDLE_SIZE, LOUPE_LIFT, LOUPE_SIZE, LOUPE_ZOOM, TOUCH_TARGET_SIZE} from './QuadCropper.types';

const NO_SIZE: Size = {width: 0, height: 0};

// The picture's own proportions, which decide where a `contain` drawn picture lands.
const useNaturalImageSize = (imageUri?: string): Size => {
  const [natural, setNatural] = useState<Size>(NO_SIZE);

  useEffect(() => {
    if (!imageUri) {
      setNatural(NO_SIZE);
      return undefined;
    }
    let current = true;
    Image.getSize(imageUri, (width, height) => {
      if (current) {
        setNatural({width, height});
      }
    }, () => undefined);
    return () => {
      current = false;
    };
  }, [imageUri]);

  return natural;
};

// Where the picture is drawn inside the box it was given, and how to keep that up to date.
export const useImageRect = (imageUri?: string) => {
  const [container, setContainer] = useState<Size>(NO_SIZE);
  const natural = useNaturalImageSize(imageUri);

  const onLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setContainer({width, height});
  };

  return {container, imageRect: containedImageRect(container, natural), onLayout};
};

interface OutlineProps {
  crop: Crop;
  imageRect: Rect;
  colour: string;
}

export const CropOutline = ({crop, imageRect, colour}: OutlineProps) => (
  <>
    {outlinePlacements(crop, imageRect.width, imageRect.height).map((edge, index) => (
      <View
        key={`edge-${index}`}
        pointerEvents="none"
        style={[styles.edge, {
          backgroundColor: colour,
          left: imageRect.left + edge.left,
          top: imageRect.top + edge.top,
          width: edge.width,
          transform: [{rotate: `${edge.rotation}deg`}],
        }]} />
    ))}
  </>
);

interface HandlesProps {
  crop: Crop;
  imageRect: Rect;
  colour: string;
  /** Web hands each handle its own pointer listeners; native drives the drag from the picture. */
  handleListeners?: (index: number) => object;
}

export const CornerHandles = ({crop, imageRect, colour, handleListeners}: HandlesProps) => (
  <>
    {crop.map((corner: CropCorner, index: number) => (
      <View
        key={`corner-${index}`}
        pointerEvents={handleListeners ? 'auto' : 'none'}
        {...handleListeners?.(index)}
        style={[styles.touchTarget, {
          left: imageRect.left + corner.x * imageRect.width - TOUCH_TARGET_SIZE / 2,
          top: imageRect.top + corner.y * imageRect.height - TOUCH_TARGET_SIZE / 2,
        }]}>
        <View pointerEvents="none" style={[styles.handle, {borderColor: colour}]} />
      </View>
    ))}
  </>
);

interface LoupeProps {
  corner: CropCorner;
  imageRect: Rect;
  container: Size;
  imageUri: string;
  colour: string;
}

// Shows what the finger is covering, just above where it is covering it.
export const Loupe = ({corner, imageRect, container, imageUri, colour}: LoupeProps) => {
  const placement = loupePlacement(corner, imageRect, container,
      {size: LOUPE_SIZE, zoom: LOUPE_ZOOM, lift: LOUPE_LIFT});

  return (
    <View
      pointerEvents="none"
      style={[styles.loupe, {left: placement.left, top: placement.top, borderColor: colour}]}>
      <Image
        source={{uri: imageUri}}
        resizeMode="stretch"
        style={[styles.loupeImage, {
          width: placement.image.width,
          height: placement.image.height,
          left: placement.image.left,
          top: placement.image.top,
        }]} />
      <View style={[styles.crossHorizontal, {backgroundColor: colour}]} />
      <View style={[styles.crossVertical, {backgroundColor: colour}]} />
    </View>
  );
};

const CROSS_LENGTH = 28;

export const cropperStyles = StyleSheet.create({
  container: {position: 'relative', overflow: 'hidden'},
  image: {width: '100%', height: '100%'},
});

const styles = StyleSheet.create({
  edge: {position: 'absolute', height: EDGE_THICKNESS},
  touchTarget: {
    position: 'absolute',
    width: TOUCH_TARGET_SIZE,
    height: TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 3,
  },
  handle: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  loupe: {
    position: 'absolute',
    width: LOUPE_SIZE,
    height: LOUPE_SIZE,
    borderRadius: LOUPE_SIZE / 2,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: 'black',
    zIndex: 4,
  },
  loupeImage: {position: 'absolute'},
  crossHorizontal: {
    position: 'absolute', height: 1, width: CROSS_LENGTH,
    left: LOUPE_SIZE / 2 - CROSS_LENGTH / 2, top: LOUPE_SIZE / 2,
  },
  crossVertical: {
    position: 'absolute', width: 1, height: CROSS_LENGTH,
    left: LOUPE_SIZE / 2, top: LOUPE_SIZE / 2 - CROSS_LENGTH / 2,
  },
});
