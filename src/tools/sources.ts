/** A range as it is published, such as 1:15 to 1:17. */
export interface Range {
  low: number;
  high: number;
}

/**
 * The median of the published values.
 *
 * @param {number[]} values the values
 * @return {number | undefined} their median; undefined when there are none
 */
export const median = (values: readonly number[]): number | undefined => {
  if (values.length === 0) {
    return undefined;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * The median of values a calculation cannot do without.
 *
 * @param {number[]} values the published values
 * @param {string} what what they are, for the error
 * @return {number} their median
 */
export const requiredMedian = (values: readonly number[], what: string): number => {
  const value = median(values);
  if (value === undefined) {
    throw new Error(`No source gives ${what}`);
  }
  return value;
};

/**
 * The middle of a range.
 *
 * @param {Range} range the range
 * @return {number} halfway between its ends
 */
export const midpoint = (range: Range): number => (range.low + range.high) / 2;

/**
 * The median of each end of the published ranges.
 *
 * @param {Range[]} ranges the ranges
 * @return {Range} the median low and the median high
 */
export const medianRange = (ranges: readonly Range[]): Range => ({
  low: median(ranges.map((range) => range.low))!,
  high: median(ranges.map((range) => range.high))!,
});
