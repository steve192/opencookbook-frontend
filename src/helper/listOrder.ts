/**
 * Moves one item of a list to another position.
 *
 * Positions outside the list leave it untouched, so callers can wire up "move up" on the
 * first row and "move down" on the last without guarding the ends themselves.
 *
 * @param {T[]} items the list to reorder, left untouched
 * @param {number} fromIndex position of the item to move
 * @param {number} toIndex position it should end up at
 * @return {T[]} a new list in the new order, or the same list when nothing moved
 */
export const moveItem = <T>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const isOutside = (index: number) => index < 0 || index >= items.length;
  if (fromIndex === toIndex || isOutside(fromIndex) || isOutside(toIndex)) {
    return items;
  }

  const reordered = [...items];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered;
};
