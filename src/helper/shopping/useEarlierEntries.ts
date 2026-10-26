import {skipToken} from '@reduxjs/toolkit/query';
import {useMemo} from 'react';
import {useGetShoppingEntriesQuery} from '../../api/endpoints/shopping';
import {ShoppingItem, ShoppingList} from '../../api/types/shopping';
import {uniqueBy} from '../arrays';
import {nameKey} from './names';
import {KnownName} from './tiles';

/**
 * What a list held before, most recent first: what this device holds as recently bought, then the list's history,
 * which the server keeps for half a year.
 *
 * @param {ShoppingList} list the list being added to
 * @param {ShoppingItem[]} bought its recently bought items on this device, newest first
 * @return {KnownName[]} each name once
 */
export const useEarlierEntries = (list: ShoppingList | undefined, bought: ShoppingItem[]): KnownName[] => {
  const {data: entries} = useGetShoppingEntriesQuery(list ?? skipToken);
  return useMemo(() => uniqueBy([...bought, ...(entries ?? [])], (known) => nameKey(known.name))
      .map(({name, aisle, icon}) => ({name, aisle, icon})), [bought, entries]);
};
