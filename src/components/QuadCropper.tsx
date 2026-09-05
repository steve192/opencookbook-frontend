import React, {useRef, useState} from 'react';
import {Image, View} from 'react-native';
import {fractionInImage} from '../helper/imageFit';
import {Crop} from '../helper/recipeScanCrop';
import {useAppTheme} from '../styles/CentralStyles';
import {QuadCropperProps} from './QuadCropper.types';
import {CornerHandles, cropperStyles, CropOutline, Loupe, useImageRect} from './QuadCropperParts';

/**
 * The web cropper. A pointer is precise enough to grab the handle itself, so each one listens
 * for its own drag rather than the picture working out which was taken hold of.
 *
 * @param {QuadCropperProps} props the photograph and the region selected on it
 * @return {JSX.Element} the cropper
 */
export const QuadCropper = (props: QuadCropperProps) => {
  const theme = useAppTheme();
  const {container, imageRect, onLayout} = useImageRect(props.imageUri);
  const [dragging, setDragging] = useState<number | undefined>(undefined);

  // Read by the pointer listeners below, which would otherwise see whichever corner was held
  // when the drag began.
  const held = useRef<number | undefined>(undefined);
  const surface = useRef<HTMLDivElement | null>(null);

  const moveTo = (clientX: number, clientY: number) => {
    const index = held.current;
    const bounds = surface.current?.getBoundingClientRect();
    if (index === undefined || !bounds) {
      return;
    }
    const moved = [...props.crop] as Crop;
    moved[index] = fractionInImage(clientX - bounds.left, clientY - bounds.top, imageRect);
    props.onCropChange(moved);
  };

  const endDrag = () => {
    held.current = undefined;
    setDragging(undefined);
  };

  const handleListeners = (index: number) => ({
    onPointerDown: (event: React.PointerEvent) => {
      held.current = index;
      setDragging(index);
      // So the drag keeps reaching this handle once the pointer has left it.
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (held.current !== undefined) {
        moveTo(event.clientX, event.clientY);
      }
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  });

  return (
    <View style={[cropperStyles.container, props.style]} onLayout={onLayout}>
      <div ref={surface} style={SURFACE_STYLE}>
        <Image source={{uri: props.imageUri}} style={cropperStyles.image} resizeMode="contain" />

        <CropOutline crop={props.crop} imageRect={imageRect} colour={theme.colors.primary} />
        <CornerHandles
          crop={props.crop}
          imageRect={imageRect}
          colour={theme.colors.primary}
          handleListeners={handleListeners} />

        {dragging !== undefined && imageRect.width > 0 &&
          <Loupe
            corner={props.crop[dragging]}
            imageRect={imageRect}
            container={container}
            imageUri={props.imageUri}
            colour={theme.colors.primary} />
        }
      </div>
    </View>
  );
};

// Fills the laid out container, so a pointer's page coordinates are measured against the same
// box the crop fractions are. Without touchAction the browser pans the page rather than
// letting a touch drag a corner.
const SURFACE_STYLE = {
  position: 'absolute', inset: 0, touchAction: 'none', userSelect: 'none',
} as const;
