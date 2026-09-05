import {describe, expect, it} from 'vitest';
import {Crop} from './recipeScanCrop';
import {rotateCrop, rotationDegrees} from './recipeScanRotation';

const crop = (...corners: [number, number][]): Crop =>
  corners.map(([x, y]) => ({x, y})) as Crop;

describe('rotateCrop', () => {
  it('carries the corners round with the picture', () => {
    // A tall region down the left of the picture. Turned right, it lies along the top.
    const upright = crop([0.1, 0.2], [0.4, 0.2], [0.4, 0.9], [0.1, 0.9]);

    const turned = rotateCrop(upright, 'right');

    expect(turned.map((corner) => [
      Number(corner.x.toFixed(4)), Number(corner.y.toFixed(4)),
    ])).toEqual([[0.1, 0.1], [0.8, 0.1], [0.8, 0.4], [0.1, 0.4]]);
  });

  it('comes back to where it started after four turns', () => {
    const original = crop([0.13, 0.27], [0.81, 0.22], [0.86, 0.94], [0.09, 0.91]);

    let turned = original;
    for (let index = 0; index < 4; index++) {
      turned = rotateCrop(turned, 'right');
    }

    turned.forEach((corner, index) => {
      expect(corner.x).toBeCloseTo(original[index].x, 6);
      expect(corner.y).toBeCloseTo(original[index].y, 6);
    });
  });

  it('undoes a turn in the other direction', () => {
    const original = crop([0.2, 0.3], [0.7, 0.3], [0.7, 0.8], [0.2, 0.8]);

    const there = rotateCrop(original, 'right');
    const back = rotateCrop(there, 'left');

    back.forEach((corner, index) => {
      expect(corner.x).toBeCloseTo(original[index].x, 6);
      expect(corner.y).toBeCloseTo(original[index].y, 6);
    });
  });

  it('keeps every corner on the picture', () => {
    const edge = crop([0, 0], [1, 0], [1, 1], [0, 1]);

    rotateCrop(edge, 'left').forEach((corner) => {
      expect(corner.x).toBeGreaterThanOrEqual(0);
      expect(corner.x).toBeLessThanOrEqual(1);
      expect(corner.y).toBeGreaterThanOrEqual(0);
      expect(corner.y).toBeLessThanOrEqual(1);
    });
  });
});

describe('rotationDegrees', () => {
  it('turns clockwise for the direction that reads as right', () => {
    expect(rotationDegrees('right')).toBe(90);
    expect(rotationDegrees('left')).toBe(-90);
  });
});
