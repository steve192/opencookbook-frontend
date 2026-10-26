/**
 * Reading inputs back from a shared link or from storage. Both may hold anything, so every value is
 * checked and falls back to the tool's default.
 */

export type RawInputs = Record<string, unknown>;

/**
 * The object a link or the storage held, or nothing usable.
 *
 * @param {unknown} raw what was read
 * @return {RawInputs} its fields, empty when it was no object
 */
export const asRawInputs = (raw: unknown): RawInputs =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? raw as RawInputs : {};

/**
 * The inputs of a shared link: JSON in its `i` parameter.
 *
 * @param {string | undefined} parameter the parameter as the address holds it
 * @return {unknown} what it held, undefined when nothing readable
 */
export const decodeInputsParameter = (parameter: string | undefined): unknown => {
  if (!parameter) {
    return undefined;
  }
  try {
    return JSON.parse(parameter);
  } catch {
    return undefined;
  }
};

export const readOptionalNumber = (raw: RawInputs, key: string, min: number, max: number): number | undefined => {
  const value = raw[key];
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
};

export const readNumber = (raw: RawInputs, key: string, fallback: number, min: number, max: number): number =>
  readOptionalNumber(raw, key, min, max) ?? fallback;

export const readChoice = <T extends string>(raw: RawInputs, key: string, allowed: readonly T[], fallback: T): T => {
  const value = raw[key];
  return allowed.includes(value as T) ? value as T : fallback;
};

export const readBoolean = (raw: RawInputs, key: string, fallback: boolean): boolean => {
  const value = raw[key];
  return typeof value === 'boolean' ? value : fallback;
};

/**
 * A list of objects, each read by its own reader, at most `max` long.
 *
 * @param {RawInputs} raw the inputs
 * @param {string} key the list's key
 * @param {Function} read reads one entry
 * @param {number} max how many entries are kept
 * @param {Array} fallback used when there is no list
 * @return {Array} the entries read
 */
export const readList = <T>(raw: RawInputs, key: string, read: (entry: RawInputs) => T, max: number,
  fallback: T[]): T[] => {
  const value = raw[key];
  return Array.isArray(value) && value.length > 0 ? value.slice(0, max).map((entry) => read(asRawInputs(entry))) :
    fallback;
};
