/** Where a picture actually ends up inside the box it is drawn in. */

export interface Size {
  width: number;
  height: number;
}

/** A rectangle in the coordinates of whatever contains it. */
export interface Rect extends Size {
  left: number;
  top: number;
}

/** A point as a fraction of the picture, which is how the server talks about them. */
export interface FractionPoint {
  x: number;
  y: number;
}

/** An area as fractions of the picture, which is how the server talks about them. */
export interface FractionBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const EMPTY: Rect = {left: 0, top: 0, width: 0, height: 0};

// A `contain` drawn picture is centred and letterboxed, so it rarely fills its box: everything
// drawn on top of it has to be placed against this rather than against the box.
export const containedImageRect = (container: Size, image: Size): Rect => {
  if (!container.width || !container.height || !image.width || !image.height) {
    return EMPTY;
  }
  const scale = Math.min(container.width / image.width, container.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    left: (container.width - width) / 2,
    top: (container.height - height) / 2,
    width,
    height,
  };
};

export const pointInContainer = (
    point: FractionPoint, imageRect: Rect,
): {left: number; top: number} => ({
  left: imageRect.left + point.x * imageRect.width,
  top: imageRect.top + point.y * imageRect.height,
});

export const fractionInImage = (x: number, y: number, imageRect: Rect): FractionPoint => {
  if (!imageRect.width || !imageRect.height) {
    return {x: 0, y: 0};
  }
  return {
    x: clamp((x - imageRect.left) / imageRect.width),
    y: clamp((y - imageRect.top) / imageRect.height),
  };
};

export const rectInContainer = (box: FractionBox, imageRect: Rect): Rect => {
  const topLeft = pointInContainer({x: box.left, y: box.top}, imageRect);
  const bottomRight = pointInContainer({x: box.right, y: box.bottom}, imageRect);
  return {
    left: topLeft.left,
    top: topLeft.top,
    width: Math.max(0, bottomRight.left - topLeft.left),
    height: Math.max(0, bottomRight.top - topLeft.top),
  };
};

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
