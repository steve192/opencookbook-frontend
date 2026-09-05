/** The magnifier shown while a corner of the crop is being dragged. */

import {FractionPoint, Rect, Size} from './imageFit';

/** Where to draw the magnifier, and how to place the picture inside it. */
export interface LoupePlacement {
  /** The magnifier circle, in the cropper's coordinates. */
  left: number;
  top: number;
  /** The photograph inside the circle, positioned so the corner is at its centre. */
  image: Rect;
}

export const loupePlacement = (
    corner: FractionPoint,
    imageRect: Rect,
    container: Size,
    options: {size: number; zoom: number; lift: number},
): LoupePlacement => {
  const {size, zoom, lift} = options;
  const centreX = imageRect.left + corner.x * imageRect.width;
  const centreY = imageRect.top + corner.y * imageRect.height;

  // Above the finger by default, and below it near the top edge, where there is no room above
  // and the magnifier would be clipped off the screen.
  const above = centreY - lift - size / 2;
  const top = above >= 0 ? above : centreY + lift - size / 2;

  return {
    left: clampTo(centreX - size / 2, container.width - size),
    top: clampTo(top, Math.max(0, container.height - size)),
    image: {
      width: imageRect.width * zoom,
      height: imageRect.height * zoom,
      // Shifted so the magnified corner lands exactly at the circle's centre.
      left: size / 2 - corner.x * imageRect.width * zoom,
      top: size / 2 - corner.y * imageRect.height * zoom,
    },
  };
};

const clampTo = (value: number, maximum: number): number =>
  Math.min(Math.max(0, value), Math.max(0, maximum));
