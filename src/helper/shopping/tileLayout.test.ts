import {describe, expect, it} from 'vitest';
import {tileCells} from './aisles';
import {columnsFor, MIN_TILE_WIDTH, TILE_GAP, tileRows, tileWidthFor} from './tileLayout';

describe('columnsFor and tileWidthFor', () => {
  it('fits more columns into a wider grid', () => {
    expect(columnsFor(336)).toBe(3);
    expect(columnsFor(387)).toBe(4);
    expect(columnsFor(1000)).toBe(10);
  });

  it('stretches the tiles so a row fills the grid', () => {
    const width = tileWidthFor(387);
    expect(width).toBeGreaterThanOrEqual(MIN_TILE_WIDTH);
    expect(4 * width + 3 * TILE_GAP).toBeLessThanOrEqual(387);
    expect(4 * (width + 1) + 3 * TILE_GAP).toBeGreaterThan(387);
  });

  it('keeps one column in a grid narrower than a tile', () => {
    expect(tileWidthFor(60)).toBe(60);
  });
});

describe('tileRows', () => {
  it('gives each heading a row and wraps the items after it at the column count', () => {
    const cells = tileCells([{key: 'a', aisle: 'FRUIT_VEG' as const}, {key: 'b', aisle: 'FRUIT_VEG' as const},
      {key: 'c', aisle: 'FRUIT_VEG' as const}, {key: 'd', aisle: 'FROZEN' as const}], true);

    expect(tileRows(cells, 2, (item) => item.key).map((row) => 'heading' in row ? row.heading :
      row.items.map((item) => item.key).join(''))).toEqual(['FRUIT_VEG', 'ab', 'c', 'FROZEN', 'd']);
  });
});
