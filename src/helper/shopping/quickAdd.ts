import {nameKey, tidyName} from './names';

const AMOUNT = String.raw`(?:\d+(?:[.,]\d+)?(?:\s*/\s*\d+)?|[½¼¾])`;
const LEADING = new RegExp(String.raw`^(${AMOUNT})\s*([^\s\d]+)?\s+(.+)$`);
const TRAILING = new RegExp(String.raw`^(.+?)\s+(${AMOUNT})\s*([^\s\d]+)?$`);

export interface QuickAdd {
  name: string;
  /** What was said about the amount, as typed; null when nothing was. */
  spec: string | null;
}

/**
 * Splits what somebody typed into a name and an amount: "2 kg Kartoffeln" and "Kartoffeln 2 kg"
 * are both Kartoffeln, 2 kg.
 *
 * @param {string} typed as typed
 * @param {Set} unitWords the catalogue's unit words, which make "2 kg" an amount and not the start of a
 *     name as in "2 pizza doughs"
 * @return {QuickAdd} the name, and the amount as typed
 */
export const parseQuickAdd = (typed: string, unitWords: ReadonlySet<string>): QuickAdd => {
  const isUnit = (word: string | undefined) => word !== undefined && unitWords.has(nameKey(word));
  const text = tidyName(typed);
  const leading = LEADING.exec(text);
  if (leading) {
    const [, amount, word, rest] = leading;
    return isUnit(word) ?
      {name: rest, spec: text.slice(0, text.length - rest.length).trim()} :
      {name: word ? `${word} ${rest}` : rest, spec: amount};
  }
  const trailing = TRAILING.exec(text);
  if (trailing && (trailing[3] === undefined || isUnit(trailing[3]))) {
    return {name: trailing[1], spec: text.slice(trailing[1].length).trim()};
  }
  return {name: text, spec: null};
};
