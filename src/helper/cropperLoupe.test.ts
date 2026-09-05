import {describe, expect, it} from 'vitest';
import {loupePlacement} from './cropperLoupe';
import {containedImageRect} from './imageFit';

const CONTAINER = {width: 300, height: 400};
// A landscape photo in a portrait cropper, which is what a phone camera gives you.
const IMAGE_RECT = containedImageRect(CONTAINER, {width: 4032, height: 3024});
const OPTIONS = {size: 96, zoom: 2.5, lift: 76};

describe('the magnifier', () => {
  it('sits above the corner, clear of the finger holding it', () => {
    const placement = loupePlacement({x: 0.5, y: 0.6}, IMAGE_RECT, CONTAINER, OPTIONS);

    const cornerTop = IMAGE_RECT.top + 0.6 * IMAGE_RECT.height;
    expect(placement.top + OPTIONS.size).toBeLessThan(cornerTop);
  });

  it('drops below the corner when there is no room above', () => {
    const placement = loupePlacement({x: 0.5, y: 0}, IMAGE_RECT, CONTAINER, OPTIONS);

    const cornerTop = IMAGE_RECT.top;
    expect(placement.top).toBeGreaterThan(cornerTop);
  });

  it('stays on screen at the left and right edges', () => {
    const atLeft = loupePlacement({x: 0, y: 0.5}, IMAGE_RECT, CONTAINER, OPTIONS);
    const atRight = loupePlacement({x: 1, y: 0.5}, IMAGE_RECT, CONTAINER, OPTIONS);

    expect(atLeft.left).toBeGreaterThanOrEqual(0);
    expect(atRight.left + OPTIONS.size).toBeLessThanOrEqual(CONTAINER.width);
  });

  it('puts the magnified corner at the centre of the circle', () => {
    const corner = {x: 0.25, y: 0.75};

    const {image} = loupePlacement(corner, IMAGE_RECT, CONTAINER, OPTIONS);

    // Where the corner lands inside the circle, measured from the circle's own origin.
    expect(image.left + corner.x * image.width).toBeCloseTo(OPTIONS.size / 2);
    expect(image.top + corner.y * image.height).toBeCloseTo(OPTIONS.size / 2);
  });

  it('enlarges the picture by the zoom factor', () => {
    const {image} = loupePlacement({x: 0.5, y: 0.5}, IMAGE_RECT, CONTAINER, OPTIONS);

    expect(image.width).toBeCloseTo(IMAGE_RECT.width * OPTIONS.zoom);
    expect(image.height).toBeCloseTo(IMAGE_RECT.height * OPTIONS.zoom);
  });
});
