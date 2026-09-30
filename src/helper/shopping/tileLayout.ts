import {Aisle} from '../../dao/aisles';
import {headingKey, TileCell} from './aisles';

/** Narrower than this, a tile's name no longer fits in two lines. */
export const MIN_TILE_WIDTH = 88;
export const TILE_GAP = 8;
/** Around the tiles of the list and of the adding sheet. */
export const TILE_AREA_PADDING = 12;

export const columnsFor = (gridWidth: number): number =>
  Math.max(1, Math.floor((gridWidth + TILE_GAP) / (MIN_TILE_WIDTH + TILE_GAP)));

// As many columns as fit, stretched to fill the row; rounded down so a row never wraps.
export const tileWidthFor = (gridWidth: number): number => {
  const columns = columnsFor(gridWidth);
  return Math.floor((gridWidth - TILE_GAP * (columns - 1)) / columns);
};

export type TileRow<T> = {key: string, heading: Aisle} | {key: string, items: T[]};

/**
 * Cells laid out in rows, for a list that renders only the rows in view: each heading a row of its own, the
 * items after it wrapped at the column count.
 *
 * @param {TileCell[]} cells headings and items in order
 * @param {number} columns items per row
 * @param {Function} keyOf an item's key
 * @return {TileRow[]} the rows
 */
export const tileRows = <T, >(cells: TileCell<T>[], columns: number, keyOf: (item: T) => string): TileRow<T>[] => {
  const rows: TileRow<T>[] = [];
  let row: T[] | undefined;
  for (const cell of cells) {
    if ('heading' in cell) {
      rows.push({key: headingKey(cell.heading), heading: cell.heading});
      row = undefined;
    } else if (row && row.length < columns) {
      row.push(cell.item);
    } else {
      row = [cell.item];
      rows.push({key: `row:${keyOf(cell.item)}`, items: row});
    }
  }
  return rows;
};
