/**
 * Turning a photograph the right way up. The file is rewritten rather than displayed at an
 * angle: everything downstream is expressed against the picture that gets uploaded.
 */

import {Crop, CropCorner, orderCorners} from './recipeScanCrop';

export type Turn = 'left' | 'right';

// Moves a crop with the picture, so a turn does not cost somebody the corners they placed.
export const rotateCrop = (crop: Crop, turn: Turn): Crop =>
  orderCorners(crop.map((corner) => rotateCorner(corner, turn)));

const rotateCorner = (corner: CropCorner, turn: Turn): CropCorner =>
  turn === 'right' ?
    {x: 1 - corner.y, y: corner.x} :
    {x: corner.y, y: 1 - corner.x};

// The image manipulator turns clockwise for a positive angle.
export const rotationDegrees = (turn: Turn): number => (turn === 'right' ? 90 : -90);
