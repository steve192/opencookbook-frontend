/** Image plus caption plus the tile's own margins. */
export const RECIPE_TILE_HEIGHT = 246;

const TILE_TARGET_WIDTH = 300;
const MAX_COLUMNS = 4;

/**
 * @param {number} width how wide the list is
 * @return {number} how many tiles fit side by side
 */
export const columnsFor = (width: number): number =>
  Math.max(1, Math.min(MAX_COLUMNS, Math.ceil(width / TILE_TARGET_WIDTH)));

/**
 * The width of one tile, as a share rather than flex, so a short last row does not stretch.
 *
 * @param {number} columns how many fit side by side
 * @return {string} the width of one cell
 */
export const columnWidth = (columns: number): `${number}%` =>
  `${100 / columns}%`;
