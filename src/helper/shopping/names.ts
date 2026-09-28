/**
 * A name as typed, trimmed and single-spaced.
 *
 * @param {string} name as typed
 * @return {string} the tidied name
 */
export const tidyName = (name: string): string => name.replace(/\s+/g, ' ').trim();

/**
 * How item names are compared, the way the server does: a list holds each key once, and a person
 * has one staple per key.
 *
 * @param {string} name as typed
 * @return {string} trimmed, single-spaced and lower case
 */
export const nameKey = (name: string): string => tidyName(name).toLowerCase();
