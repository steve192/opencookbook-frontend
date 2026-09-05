import {StyleProp, ViewStyle} from 'react-native';
import {Crop} from '../helper/recipeScanCrop';

/**
 * Shared by both platform implementations, so the two can only ever differ in how a drag is
 * detected - never in what they are for.
 */
export interface QuadCropperProps {
  /** The photograph being cropped. */
  imageUri: string;
  /** Which region is selected, as fractions of the picture. */
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  style?: StyleProp<ViewStyle>;
}

/** How big the visible grab handles are drawn. */
export const HANDLE_SIZE = 26;

/** How big the area that responds to a touch is. */
export const TOUCH_TARGET_SIZE = 48;

/** The magnifier shown while a corner is being dragged. */
export const LOUPE_SIZE = 96;
export const LOUPE_ZOOM = 2.5;

/**
 * How far above the corner the magnifier sits, so the finger holding the corner is not covering
 * the very thing the magnifier exists to show.
 */
export const LOUPE_LIFT = 76;
