/**
 * The first item of each key, in the given order.
 *
 * @param {T[]} items the items
 * @param {Function} keyOf what makes two items the same
 * @return {T[]} a new list without later duplicates
 */
export const uniqueBy = <T>(items: T[], keyOf: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
