import {describe, expect, it} from 'vitest';
import {cornerAt, EDGE_THICKNESS, edgePlacement, outlinePlacements} from './quadEdges';

describe('drawing one edge', () => {
  it('spans the distance between the two corners', () => {
    const placement = edgePlacement({x: 0, y: 0}, {x: 1, y: 0}, 400, 200);

    expect(placement.width).toBe(400);
    expect(placement.left).toBe(0);
  });

  it('points along the edge', () => {
    expect(edgePlacement({x: 0, y: 0}, {x: 1, y: 0}, 400, 200).rotation).toBe(0);
    expect(edgePlacement({x: 0, y: 0}, {x: 0, y: 1}, 400, 200).rotation).toBe(90);
    expect(edgePlacement({x: 1, y: 0}, {x: 0, y: 0}, 400, 200).rotation).toBe(180);
  });

  it('measures a diagonal, not just its sides', () => {
    const placement = edgePlacement({x: 0, y: 0}, {x: 1, y: 1}, 300, 400);

    expect(placement.width).toBeCloseTo(500);
    expect(placement.rotation).toBeCloseTo(53.13, 1);
  });

  it('centres the line on the corners rather than hanging it below them', () => {
    expect(edgePlacement({x: 0, y: 0.5}, {x: 1, y: 0.5}, 400, 200).top)
        .toBe(100 - EDGE_THICKNESS / 2);
  });

  // The bar is turned about its own centre, so it is placed centred on the edge rather than
  // starting at the first corner.
  it('sits centred on the midpoint of the edge it draws', () => {
    const placement = edgePlacement({x: 0, y: 0}, {x: 0, y: 1}, 400, 200);

    expect(placement.left + placement.width / 2).toBeCloseTo(0);
    expect(placement.top + EDGE_THICKNESS / 2).toBeCloseTo(100);
  });
});

describe('drawing the whole outline', () => {
  const square = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}];

  it('draws one edge per corner', () => {
    expect(outlinePlacements(square, 200, 200)).toHaveLength(4);
  });

  it('closes the shape by joining the last corner back to the first', () => {
    const edges = outlinePlacements(square, 200, 200);

    // The final edge runs up the left side, which is 270 degrees clockwise from pointing right.
    expect(edges[3].rotation).toBe(-90);
    expect(edges[3].width).toBe(200);
  });

  it('survives being asked before the image has been laid out', () => {
    expect(outlinePlacements(square, 0, 0).every((edge) => edge.width === 0)).toBe(true);
  });
});

describe('cornerAt', () => {
  // The picture is drawn 200x100, offset 10 from the left and 20 from the top of the box.
  const imageRect = {left: 10, top: 20, width: 200, height: 100};
  const square = [
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 0, y: 1},
  ];

  it('finds the corner a touch landed on', () => {
    // Bottom right is at (10 + 200, 20 + 100).
    expect(cornerAt(210, 120, square, imageRect, 24)).toBe(2);
  });

  it('allows for a finger that lands near a corner rather than exactly on it', () => {
    expect(cornerAt(15, 25, square, imageRect, 24)).toBe(0);
  });

  it('takes the nearer of two corners', () => {
    // Just past halfway along the top edge, so the top right is closer than the top left.
    expect(cornerAt(120, 20, square, imageRect, 500)).toBe(1);
  });

  it('grabs nothing when the touch is not near any corner', () => {
    // The middle of the picture, which is a pan of the photograph rather than a drag.
    expect(cornerAt(110, 70, square, imageRect, 24)).toBeUndefined();
  });

  it('measures from where the picture is drawn, not from the box around it', () => {
    // The box's own origin is 10,20 away from the picture's, and the top left corner is at
    // the picture's origin - so a touch at 0,0 is outside the grab radius.
    expect(cornerAt(0, 0, square, imageRect, 10)).toBeUndefined();
    expect(cornerAt(10, 20, square, imageRect, 10)).toBe(0);
  });
});
