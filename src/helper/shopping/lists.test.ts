import {describe, expect, it} from 'vitest';
import {ShoppingList} from '../../dao/RestAPI';
import {defaultListFor, listName} from './lists';

const list = (id: number, householdId: string | null, defaultList = true, name: string | null = null): ShoppingList =>
  ({id, name, defaultList, householdId, householdName: householdId ? 'Familie' : null, version: 0});

describe('lists', () => {
  it('shops for a plan on that plan\'s default list', () => {
    const lists = [list(1, null), list(2, 'h1'), list(3, 'h1', false)];
    expect(defaultListFor(lists, 'h1')?.id).toBe(2);
    expect(defaultListFor(lists)?.id).toBe(1);
  });

  it('names an unrenamed default list after its household, or as your own', () => {
    expect(listName(list(1, null), 'My list')).toBe('My list');
    expect(listName(list(2, 'h1'), 'My list')).toBe('Familie');
    expect(listName(list(3, null, false, 'Baumarkt'), 'My list')).toBe('Baumarkt');
  });
});
