import React, {useRef, useState} from 'react';
import {Image, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {fractionInImage} from '../helper/imageFit';
import {cornerAt} from '../helper/quadEdges';
import {Crop} from '../helper/recipeScanCrop';
import {useAppTheme} from '../styles/CentralStyles';
import {QuadCropperProps, TOUCH_TARGET_SIZE} from './QuadCropper.types';
import {CornerHandles, cropperStyles, CropOutline, Loupe, useImageRect} from './QuadCropperParts';

/**
 * Dragging out the part of a photograph that holds the recipe.
 *
 * @param {QuadCropperProps} props the photograph and the region selected on it
 * @return {JSX.Element} the cropper
 */
export const QuadCropper = (props: QuadCropperProps) => {
  const theme = useAppTheme();
  const {container, imageRect, onLayout} = useImageRect(props.imageUri);
  const [dragging, setDragging] = useState<number | undefined>(undefined);

  // Which corner this drag took hold of. A ref rather than state because the gesture's own
  // callbacks read it, and they would otherwise see whatever it was when the drag began.
  const held = useRef<number | undefined>(undefined);

  const moveCorner = (index: number, x: number, y: number) => {
    const moved = [...props.crop] as Crop;
    moved[index] = fractionInImage(x, y, imageRect);
    props.onCropChange(moved);
  };

  // On the picture rather than on the handles: a handle moves as it is dragged, and a gesture
  // reports positions relative to the view it is attached to, so a moving target would feed
  // back into itself. The picture stays where it is.
  // eslint-disable-next-line new-cap -- Gesture.Pan is a factory, not a constructor
  const pan = Gesture.Pan()
      .onBegin((event) => {
        held.current = cornerAt(event.x, event.y, props.crop, imageRect, TOUCH_TARGET_SIZE / 2);
        setDragging(held.current);
      })
      .onUpdate((event) => {
        if (held.current !== undefined) {
          moveCorner(held.current, event.x, event.y);
        }
      })
      .onFinalize(() => {
        held.current = undefined;
        setDragging(undefined);
      })
      .runOnJS(true);

  return (
    <GestureDetector gesture={pan}>
      <View style={[cropperStyles.container, props.style]} onLayout={onLayout}>
        <Image source={{uri: props.imageUri}} style={cropperStyles.image} resizeMode="contain" />

        <CropOutline crop={props.crop} imageRect={imageRect} colour={theme.colors.primary} />
        <CornerHandles crop={props.crop} imageRect={imageRect} colour={theme.colors.primary} />

        {dragging !== undefined && imageRect.width > 0 &&
          <Loupe
            corner={props.crop[dragging]}
            imageRect={imageRect}
            container={container}
            imageUri={props.imageUri}
            colour={theme.colors.primary} />
        }
      </View>
    </GestureDetector>
  );
};
