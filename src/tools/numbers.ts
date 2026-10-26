/** A range, such as 1:15 to 1:17. */
export interface Range {
  low: number;
  high: number;
}

/**
 * The median of the values.
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
 * @param {number[]} values the values
 * @param {string} what what they are, for the error
 * @return {number} their median
 */
export const requiredMedian = (values: readonly number[], what: string): number => {
  const value = median(values);
  if (value === undefined) {
    throw new Error(`No value for ${what}`);
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
 * The median of each end of the ranges.
 *
 * @param {Range[]} ranges the ranges
 * @return {Range} the median low and the median high
 */
export const medianRange = (ranges: readonly Range[]): Range => ({
  low: median(ranges.map((range) => range.low))!,
  high: median(ranges.map((range) => range.high))!,
});

/**
 * The multiples of a step from one end to the other, either way round, to two decimals.
 *
 * @param {number} from the first end
 * @param {number} to the last end
 * @param {number} step the step
 * @return {number[]} the values, from `from` to `to`
 */
export const stepsBetween = (from: number, to: number, step: number): number[] => {
  const first = Math.round(from / step);
  const last = Math.round(to / step);
  const direction = last < first ? -1 : 1;
  return Array.from({length: Math.abs(last - first) + 1},
      (_, index) => Math.round((first + direction * index) * step * 100) / 100);
};

/**
 * The value nearest a given one.
 *
 * @param {number[]} values the values to choose from
 * @param {number} target any value
 * @return {number} the nearest of them, the first on a tie
 */
export const nearest = (values: readonly number[], target: number): number =>
  values.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best, values[0]);
