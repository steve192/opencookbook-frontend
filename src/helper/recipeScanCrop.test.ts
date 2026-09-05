import {describe, expect, it} from 'vitest';
import {
  buildScanPayload,
  clampCorner,
  Crop,
  cropFromDetection,
  fullPageCrop,
  isTooSmall,
  isUncropped,
  orderCorners,
  ScanPage,
} from './recipeScanCrop';

const crop = (...corners: [number, number][]): Crop =>
  corners.map(([x, y]) => ({x, y})) as Crop;

const page = (uri: string, region: Crop = fullPageCrop()): ScanPage => ({uri, crop: region});

describe('the default crop', () => {
  it('starts just inside the picture so every handle can be grabbed', () => {
    const untouched = fullPageCrop();

    expect(untouched).toHaveLength(4);
    untouched.forEach((corner) => {
      expect(corner.x).toBeGreaterThan(0);
      expect(corner.x).toBeLessThan(1);
    });
  });

  it('is recognised as not having been moved', () => {
    expect(isUncropped(fullPageCrop())).toBe(true);
  });

  it('stops being untouched once a corner is dragged', () => {
    const moved = fullPageCrop();
    moved[0] = {x: 0.3, y: 0.3};

    expect(isUncropped(moved)).toBe(false);
  });
});

describe('dragging a corner', () => {
  it('keeps it on the picture', () => {
    expect(clampCorner({x: -0.4, y: 1.7})).toEqual({x: 0, y: 1});
  });

  it('leaves a corner that is already on the picture alone', () => {
    expect(clampCorner({x: 0.25, y: 0.75})).toEqual({x: 0.25, y: 0.75});
  });
});

describe('ordering the corners', () => {
  it('puts them clockwise from the top left', () => {
    const dragged = [
      {x: 0.9, y: 0.9},
      {x: 0.1, y: 0.1},
      {x: 0.1, y: 0.9},
      {x: 0.9, y: 0.1},
    ];

    expect(orderCorners(dragged)).toEqual([
      {x: 0.1, y: 0.1},
      {x: 0.9, y: 0.1},
      {x: 0.9, y: 0.9},
      {x: 0.1, y: 0.9},
    ]);
  });

  it('does not depend on the order they were dragged in', () => {
    const corners = [{x: 0.2, y: 0.1}, {x: 0.8, y: 0.15}, {x: 0.85, y: 0.9}, {x: 0.15, y: 0.85}];
    const shuffled = [corners[2], corners[0], corners[3], corners[1]];

    expect(orderCorners(shuffled)).toEqual(orderCorners(corners));
  });
});

describe('a crop that is too small to read', () => {
  it('is rejected when it is a sliver', () => {
    expect(isTooSmall(crop([0.1, 0.1], [0.15, 0.1], [0.15, 0.9], [0.1, 0.9]))).toBe(true);
  });

  it('accepts a crop that covers a reasonable part of the page', () => {
    expect(isTooSmall(crop([0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]))).toBe(false);
  });
});

describe('the payload sent with the photographs', () => {
  it('sends no crop for a page nobody adjusted', () => {
    const payload = JSON.parse(buildScanPayload([page('one.jpg')]));

    expect(payload.pages).toEqual([{}]);
  });

  it('sends the corners for a page that was cropped', () => {
    const adjusted = crop([0.2, 0.1], [0.8, 0.1], [0.8, 0.9], [0.2, 0.9]);

    const payload = JSON.parse(buildScanPayload([page('one.jpg', adjusted)]));

    expect(payload.pages[0].crop).toEqual([[0.2, 0.1], [0.8, 0.1], [0.8, 0.9], [0.2, 0.9]]);
  });

  it('describes one entry per page, in order', () => {
    const adjusted = crop([0.2, 0.1], [0.8, 0.1], [0.8, 0.9], [0.2, 0.9]);

    const payload = JSON.parse(buildScanPayload([page('one.jpg'), page('two.jpg', adjusted)]));

    expect(payload.pages).toHaveLength(2);
    expect(payload.pages[0]).toEqual({});
    expect(payload.pages[1].crop).toBeDefined();
  });

  it('ignores a crop that selects almost nothing', () => {
    const sliver = crop([0.1, 0.1], [0.12, 0.1], [0.12, 0.9], [0.1, 0.9]);

    expect(JSON.parse(buildScanPayload([page('one.jpg', sliver)])).pages).toEqual([{}]);
  });

  it('carries a language hint only when there is one', () => {
    expect(JSON.parse(buildScanPayload([page('one.jpg')], 'de')).language).toBe('de');
    expect(JSON.parse(buildScanPayload([page('one.jpg')])).language).toBeUndefined();
  });

  it('sends the corners in the order the server reads them', () => {
    const dragged = crop([0.8, 0.9], [0.2, 0.1], [0.8, 0.1], [0.2, 0.9]);

    const [topLeft, topRight, bottomRight, bottomLeft] =
      JSON.parse(buildScanPayload([page('one.jpg', dragged)])).pages[0].crop;

    expect(topLeft).toEqual([0.2, 0.1]);
    expect(topRight).toEqual([0.8, 0.1]);
    expect(bottomRight).toEqual([0.8, 0.9]);
    expect(bottomLeft).toEqual([0.2, 0.9]);
  });
});


describe('starting the crop from what the server found', () => {
  const detection = (detected: boolean, corners: [number, number][]) => ({detected, corners});

  it('uses the detected page', () => {
    const crop = cropFromDetection(
        detection(true, [[0.1, 0.2], [0.9, 0.15], [0.85, 0.9], [0.15, 0.95]]));

    expect(boxOf(crop)).toEqual({left: 0.1, top: 0.15, right: 0.9, bottom: 0.95});
  });

  it('puts the corners in reading order however they arrive', () => {
    const crop = cropFromDetection(
        detection(true, [[0.85, 0.9], [0.1, 0.2], [0.15, 0.95], [0.9, 0.15]]));

    expect(crop[0]).toEqual({x: 0.1, y: 0.2});
    expect(crop[2]).toEqual({x: 0.85, y: 0.9});
  });

  it('falls back to the whole frame when nothing was found', () => {
    // A confident looking crop around the wrong thing is worse than none.
    expect(cropFromDetection(detection(false, [[0, 0], [1, 0], [1, 1], [0, 1]])))
        .toEqual(fullPageCrop());
  });

  it('falls back when the server said nothing at all', () => {
    expect(cropFromDetection(undefined)).toEqual(fullPageCrop());
  });

  it('falls back on a malformed answer rather than trusting it', () => {
    expect(cropFromDetection(detection(true, [[0.1, 0.2], [0.9, 0.15]])))
        .toEqual(fullPageCrop());
  });

  it('keeps corners on the picture', () => {
    const crop = cropFromDetection(
        detection(true, [[-0.4, 0.2], [1.7, 0.15], [0.85, 0.9], [0.15, 0.95]]));

    expect(crop.every((corner) => corner.x >= 0 && corner.x <= 1)).toBe(true);
  });
});

const boxOf = (crop: Crop) => ({
  left: Math.min(...crop.map((c) => c.x)),
  top: Math.min(...crop.map((c) => c.y)),
  right: Math.max(...crop.map((c) => c.x)),
  bottom: Math.max(...crop.map((c) => c.y)),
});
