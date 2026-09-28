import {Aisle, AISLES} from '../../dao/aisles';
import aisleIcons from './aisleIcons.json';

export interface AisleGroup<T> {
  aisle: Aisle;
  items: T[];
}

/**
 * The icon to show: the item's own, or its aisle's.
 *
 * @param {string} icon the item's Fluent Emoji name, if it has one
 * @param {Aisle} aisle where it is sold
 * @return {string} a Fluent Emoji name
 */
export const iconOf = (icon: string | null | undefined, aisle: Aisle): string => icon ?? aisleIcons[aisle];

/**
 * Items in the order a shop is walked, aisles without any left out.
 *
 * @param {T[]} items anything placed in an aisle
 * @return {AisleGroup[]} one group per aisle that has items, in their given order
 */
export const groupByAisle = <T extends {aisle: Aisle}>(items: T[]): AisleGroup<T>[] =>
  AISLES.map((aisle) => ({aisle, items: items.filter((item) => item.aisle === aisle)}))
      .filter((group) => group.items.length > 0);
