/**
 * How a tap or a typed number changes an answer, the same in every wizard.
 */

/**
 * Tapping the chosen value again clears it, so an answer can go back to "no preference".
 *
 * @param {T | null | undefined} current the value chosen so far
 * @param {T} tapped the value that was tapped
 * @return {T | null} the value now chosen, or none
 */
export const toggledChoice = <T>(current: T | null | undefined, tapped: T): T | null =>
  current === tapped ? null : tapped;

/**
 * One field of an answer set to the tapped value, or cleared where it already had it.
 *
 * @param {T} answers the answers so far
 * @param {K} field the question that was answered
 * @param {*} tapped the value that was tapped
 * @return {T} the answers with that field changed
 */
export const withToggled = <T, K extends keyof T>(answers: T, field: K, tapped: NonNullable<T[K]>): T =>
  ({...answers, [field]: toggledChoice(answers[field], tapped)});

/**
 * @param {T[] | undefined} chosen the values chosen so far
 * @param {T} tapped the value that was tapped
 * @return {T[]} the values with it added, or removed
 */
export const toggledIn = <T>(chosen: T[] | undefined, tapped: T): T[] => {
  const values = chosen ?? [];
  return values.includes(tapped) ? values.filter((value) => value !== tapped) : [...values, tapped];
};

/**
 * Reads a number the user typed, treating anything that is not one as "not set".
 *
 * @param {string} text what was typed
 * @return {number | undefined} the number, or undefined to clear the field
 */
export const parseOptionalNumber = (text: string): number | undefined => {
  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * An emptied field clears the answer, so the server falls back to its default.
 *
 * @param {string} text what the cook typed
 * @return {number | null} the number, or null when there is none
 */
export const typedNumber = (text: string): number | null => parseOptionalNumber(text) ?? null;
