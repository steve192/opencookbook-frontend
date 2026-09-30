import fuzzy from 'fuzzy';

/**
 * The one search of every cookbook: fuzzy on the titles, best matches first.
 *
 * @param {object[]} items what to search
 * @param {string} search what was typed; empty keeps everything
 * @return {object[]} the matches
 */
export const searchByTitle = <T extends {title: string}>(items: T[], search: string): T[] =>
  search === '' ? items : fuzzy.filter(search, items, {extract: (item) => item.title}).map((match) => match.original);
