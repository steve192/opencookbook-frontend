import {describe, expect, it} from 'vitest';
import {
  containedImageRect,
  fractionInImage,
  pointInContainer,
  rectInContainer,
} from './imageFit';

describe('where a contained picture is drawn', () => {
  it('fills a box of the same proportions exactly', () => {
    expect(containedImageRect({width: 300, height: 400}, {width: 600, height: 800}))
        .toEqual({left: 0, top: 0, width: 300, height: 400});
  });

  it('letterboxes a landscape photo in a portrait box', () => {
    // The camera's 4032x3024 in a portrait layout: bars above and below.
    const rect = containedImageRect({width: 300, height: 400}, {width: 4032, height: 3024});

    expect(rect.width).toBe(300);
    expect(rect.height).toBe(225);
    expect(rect.left).toBe(0);
    expect(rect.top).toBe(87.5);
  });

  it('letterboxes a portrait photo in a landscape box', () => {
    const rect = containedImageRect({width: 400, height: 300}, {width: 3024, height: 4032});

    expect(rect.height).toBe(300);
    expect(rect.width).toBe(225);
    expect(rect.top).toBe(0);
    expect(rect.left).toBe(87.5);
  });

  it('is empty before anything has been measured', () => {
    expect(containedImageRect({width: 0, height: 0}, {width: 100, height: 100}))
        .toEqual({left: 0, top: 0, width: 0, height: 0});
    expect(containedImageRect({width: 100, height: 100}, {width: 0, height: 0}))
        .toEqual({left: 0, top: 0, width: 0, height: 0});
  });
});

describe('placing things on the picture', () => {
  // A landscape photo in a portrait box, so the bars are what the maths has to account for.
  const rect = containedImageRect({width: 300, height: 400}, {width: 4032, height: 3024});

  it('puts the middle of the picture in the middle of the picture', () => {
    expect(pointInContainer({x: 0.5, y: 0.5}, rect)).toEqual({left: 150, top: 200});
  });

  it('puts the top left corner on the picture, not in the bar above it', () => {
    expect(pointInContainer({x: 0, y: 0}, rect)).toEqual({left: 0, top: 87.5});
  });

  it('keeps the bottom edge on the picture', () => {
    expect(pointInContainer({x: 1, y: 1}, rect)).toEqual({left: 300, top: 312.5});
  });

  it('places an area without letting it run off the picture', () => {
    const area = rectInContainer({left: 0, top: 0, right: 1, bottom: 1}, rect);

    expect(area).toEqual({left: 0, top: 87.5, width: 300, height: 225});
  });

  it('places a partial area proportionally', () => {
    const area = rectInContainer({left: 0.25, top: 0, right: 0.75, bottom: 0.5}, rect);

    expect(area.left).toBe(75);
    expect(area.width).toBe(150);
    expect(area.height).toBe(112.5);
  });
});

describe('reading a touch back', () => {
  const rect = containedImageRect({width: 300, height: 400}, {width: 4032, height: 3024});

  it('round trips a point through the picture and back', () => {
    const point = {x: 0.3, y: 0.7};
    const placed = pointInContainer(point, rect);

    const read = fractionInImage(placed.left, placed.top, rect);

    expect(read.x).toBeCloseTo(point.x);
    expect(read.y).toBeCloseTo(point.y);
  });

  it('pulls a touch in the letterbox bar back onto the picture', () => {
    // Above the drawn image entirely; a corner belongs on the picture.
    expect(fractionInImage(150, 0, rect)).toEqual({x: 0.5, y: 0});
    expect(fractionInImage(150, 400, rect)).toEqual({x: 0.5, y: 1});
  });

  it('survives being asked before the picture has been measured', () => {
    expect(fractionInImage(10, 10, {left: 0, top: 0, width: 0, height: 0}))
        .toEqual({x: 0, y: 0});
  });
});
