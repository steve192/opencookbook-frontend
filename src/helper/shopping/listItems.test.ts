import {describe, expect, it} from 'vitest';
import {ShoppingItem, ShoppingOp} from '../../dao/RestAPI';
import {ItemMap, recentlyBought, visibleItems, withChanges, withOp} from './listItems';

const NOW = '2026-10-05T10:00:00Z';

const item = (id: string, name: string, extra: Partial<ShoppingItem> = {}): ShoppingItem => ({
  id, name, spec: null, aisle: 'OTHER', aisleManual: false, icon: null, status: 'ACTIVE', boughtAt: null,
  addedBy: null, sources: [], deleted: false, version: 1, ...extra,
});

const add = (itemId: string, name: string, spec: string | null = null): ShoppingOp =>
  ({opId: `op-${itemId}`, type: 'ADD', itemId, name, spec});

const listOf = (...items: ShoppingItem[]): ItemMap => Object.fromEntries(items.map((each) => [each.id, each]));

describe('listItems', () => {
  it('asks for more of a name already on the list', () => {
    const items = withOp(listOf(item('a', 'Milch', {spec: '1 l'})), add('b', 'milch', '500 ml'), NOW);
    expect(Object.values(items)).toEqual([expect.objectContaining({id: 'a', spec: '1 l + 500 ml'})]);
  });

  it('brings a bought name back with only what is asked for now', () => {
    const items = withOp(listOf(item('a', 'Eier', {status: 'BOUGHT', spec: '6'})), add('b', 'Eier', '10'), NOW);
    expect(items.a).toMatchObject({status: 'ACTIVE', spec: '10'});
  });

  it('ticks off and puts back', () => {
    const bought = withOp(listOf(item('a', 'Brot')), {opId: '1', type: 'BUY', itemId: 'a'}, NOW);
    expect(bought.a).toMatchObject({status: 'BOUGHT', boughtAt: NOW});
    const back = withOp(bought, {opId: '2', type: 'RESTORE', itemId: 'a'}, NOW);
    expect(back.a).toMatchObject({status: 'ACTIVE', boughtAt: null});
  });

  it('keeps a rename onto a name another item has from making it twice', () => {
    const items = withOp(listOf(item('a', 'Milch'), item('b', 'Brot')),
        {opId: '1', type: 'UPDATE', itemId: 'b', name: 'Milch'}, NOW);
    expect(items.b.name).toBe('Brot');
  });

  it('remembers an aisle chosen by hand', () => {
    const items = withOp(listOf(item('a', 'Mehl')), {opId: '1', type: 'UPDATE', itemId: 'a', aisle: 'BAKING'}, NOW);
    expect(items.a).toMatchObject({aisle: 'BAKING', aisleManual: true});
  });

  it('ignores an op on an item that is gone', () => {
    const items = listOf(item('a', 'Brot'));
    expect(withOp(items, {opId: '1', type: 'BUY', itemId: 'gone'}, NOW)).toBe(items);
  });

  it('lays what the device did over what the server said', () => {
    const shown = visibleItems({server: listOf(item('a', 'Brot')), version: 1,
      pending: [add('b', 'Butter'), {opId: '2', type: 'DELETE', itemId: 'a'}]}, NOW);
    expect(Object.values(shown).map((each) => each.name)).toEqual(['Butter']);
  });

  it('replaces the list with a full answer and patches it with a partial one', () => {
    const held = listOf(item('a', 'Brot'), item('b', 'Butter'));
    expect(Object.keys(withChanges(held, {version: 5, full: true, items: [item('c', 'Käse')]}))).toEqual(['c']);
    expect(Object.keys(withChanges(held, {version: 5, full: false, items: [item('a', 'Brot', {deleted: true}),
      item('c', 'Käse')]}))).toEqual(['b', 'c']);
  });

  it('shows the newest purchases first', () => {
    const items = listOf(item('a', 'Alt', {status: 'BOUGHT', boughtAt: '2026-10-01T00:00:00Z'}),
        item('b', 'Neu', {status: 'BOUGHT', boughtAt: '2026-10-04T00:00:00Z'}), item('c', 'Offen'));
    expect(recentlyBought(items).map((each) => each.name)).toEqual(['Neu', 'Alt']);
  });
});
