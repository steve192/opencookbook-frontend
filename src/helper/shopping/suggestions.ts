import XDate from 'xdate';
import {ShoppingItem, ShoppingRegular} from '../../api/types/shopping';
import {toDayKey} from '../weekplan';
import {timeOf} from './listItems';
import {nameKey} from './names';

// Not muted, not on the list, and not bought after lastBoughtAt, as a tick on this device is until the regular
// items are asked for again.
const stillWanted = (regular: ShoppingRegular, items: ShoppingItem[]): boolean => {
  const item = items.find((each) => nameKey(each.name) === nameKey(regular.name));
  return !regular.muted && item?.status !== 'ACTIVE' &&
    !(item?.status === 'BOUGHT' && timeOf(item.boughtAt) > timeOf(regular.lastBoughtAt));
};

const byName = (first: ShoppingRegular, second: ShoppingRegular) => first.name.localeCompare(second.name);

/**
 * What the list buys regularly and is due again now.
 *
 * @param {ShoppingRegular[]} regulars the list's
 * @param {ShoppingItem[]} items the list's, as this device holds them
 * @param {Date} now this device's clock
 * @return {ShoppingRegular[]} the ones to suggest, by name
 */
export const suggestedNow = (regulars: ShoppingRegular[], items: ShoppingItem[], now: Date): ShoppingRegular[] =>
  regulars.filter((regular) => stillWanted(regular, items) && regular.windows.some((window) =>
    timeOf(window.from) <= now.getTime() && now.getTime() < timeOf(window.until))).sort(byName);

/**
 * What the list buys regularly and is due by the end of a day: suggested now or from then on.
 *
 * @param {ShoppingRegular[]} regulars the list's
 * @param {ShoppingItem[]} items the list's, as this device holds them
 * @param {Date} now this device's clock
 * @param {string} lastDay yyyy-MM-dd, on this device's calendar
 * @return {ShoppingRegular[]} the due ones, by name
 */
export const dueBy = (regulars: ShoppingRegular[], items: ShoppingItem[], now: Date, lastDay: string): ShoppingRegular[] =>
  regulars.filter((regular) => stillWanted(regular, items) && regular.windows.some((window) =>
    now.getTime() < timeOf(window.until) && toDayKey(new XDate(window.from)) <= lastDay)).sort(byName);
