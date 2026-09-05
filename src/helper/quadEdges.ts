/** Drawing the outline of a four cornered crop. */

import {pointInContainer, Rect} from './imageFit';
import {CropCorner} from './recipeScanCrop';

/** How thick the outline is drawn, in pixels. Both the offset below and the renderers use it. */
export const EDGE_THICKNESS = 2;

/**
 * Where to put the bar that draws one edge, in the laid out image's own pixels.
 *
 * Placed as an unrotated bar centred on the edge's midpoint and then turned about its own
 * centre, which is the one rotation origin every platform agrees on without being told.
 */
export interface EdgePlacement {
  left: number;
  top: number;
  width: number;
  /** Degrees, clockwise from pointing right. */
  rotation: number;
}

export const edgePlacement = (
    from: CropCorner, to: CropCorner, width: number, height: number,
): EdgePlacement => {
  const startX = from.x * width;
  const startY = from.y * height;
  const endX = to.x * width;
  const endY = to.y * height;
  const length = Math.hypot(endX - startX, endY - startY);

  return {
    left: (startX + endX) / 2 - length / 2,
    // Half the thickness up, so the line is centred on the two corners rather than hanging
    // below them.
    top: (startY + endY) / 2 - EDGE_THICKNESS / 2,
    width: length,
    rotation: (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI,
  };
};

// One placement per edge, closing the shape.
export const outlinePlacements = (
    corners: CropCorner[], width: number, height: number,
): EdgePlacement[] =>
  corners.map((corner, index) =>
    edgePlacement(corner, corners[(index + 1) % corners.length], width, height));

/**
 * Which corner a touch is grabbing, if any.
 *
 * The handles move as they are dragged, so a gesture attached to one of them would report
 * positions against a target that is itself moving. This lets the gesture live on the picture,
 * which does not move, and work out from one fixed point which corner was taken hold of.
 *
 * @param {number} x where the touch was, in the container's coordinates
 * @param {number} y where the touch was, in the container's coordinates
 * @param {CropCorner[]} corners the crop, in order
 * @param {Rect} imageRect where the picture is drawn
 * @param {number} radius how far from a corner still counts as grabbing it
 * @return {number | undefined} the corner's index, or undefined for a touch that missed
 */
export const cornerAt = (
    x: number, y: number, corners: CropCorner[], imageRect: Rect, radius: number,
): number | undefined => {
  let closest: number | undefined = undefined;
  let closestDistance = radius;

  corners.forEach((corner, index) => {
    const at = pointInContainer(corner, imageRect);
    const distance = Math.hypot(x - at.left, y - at.top);
    // Strictly nearer, so two corners on top of each other resolve to the first rather than
    // flickering between them.
    if (distance < closestDistance) {
      closest = index;
      closestDistance = distance;
    }
  });

  return closest;
};
