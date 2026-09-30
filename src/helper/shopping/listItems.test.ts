import {describe, expect, it} from 'vitest';
import {ShoppingItem, ShoppingOp} from '../../api/types/shopping';
import {
  activeItems,
  copyOf,
  ItemMap,
  MAX_SOURCES_PER_ADD,
  recentlyBought,
  visibleItems,
  withChanges,
  withOp,
} from './listItems';

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
      pending: [{op: add('b', 'Butter'), at: NOW}, {op: {opId: '2', type: 'DELETE', itemId: 'a'}, at: NOW}]});
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

  it('compares instants as times, however many fraction digits they were written with', () => {
    const items = listOf(item('a', 'Device', {addedAt: '2026-10-05T10:00:00.500Z'}),
        item('b', 'Server', {addedAt: '2026-10-05T10:00:00Z'}));
    expect(activeItems(items).map((each) => each.name)).toEqual(['Server', 'Device']);
  });

  it('shows what was added last at the end, asking for more or bringing back included', () => {
    const items = listOf(item('a', 'Milch', {addedAt: '2026-10-01T00:00:00Z'}),
        item('b', 'Brot', {addedAt: '2026-10-02T00:00:00Z'}),
        item('c', 'Eier', {status: 'BOUGHT', addedAt: '2026-09-01T00:00:00Z'}));
    const names = (held: ItemMap) => activeItems(held).map((each) => each.name);

    expect(names(items)).toEqual(['Milch', 'Brot']);
    expect(names(withOp(items, add('x', 'milch', '1 l'), NOW))).toEqual(['Brot', 'Milch']);
    expect(names(withOp(items, {opId: '1', type: 'RESTORE', itemId: 'c'}, NOW))).toEqual(['Milch', 'Brot', 'Eier']);
  });

  it('shows prioritized items first and forgets the priority once bought', () => {
    const items = listOf(item('a', 'Milch', {addedAt: '2026-10-01T00:00:00Z'}),
        item('b', 'Brot', {addedAt: '2026-10-02T00:00:00Z'}));
    const prioritized = withOp(items, {opId: '1', type: 'UPDATE', itemId: 'b', prioritized: true}, NOW);
    expect(activeItems(prioritized).map((each) => each.name)).toEqual(['Brot', 'Milch']);

    const bought = withOp(prioritized, {opId: '2', type: 'BUY', itemId: 'b'}, NOW);
    expect(bought.b.prioritized).toBe(false);
  });

  it('keeps a priority when more of a name is asked for, and takes one along', () => {
    const items = listOf(item('a', 'Milch', {prioritized: true}));
    expect(withOp(items, add('b', 'Milch'), NOW).a.prioritized).toBe(true);
    const urgent: ShoppingOp = {opId: '1', type: 'ADD', itemId: 'b', name: 'Milch', prioritized: true};
    expect(withOp(listOf(item('a', 'Milch')), urgent, NOW).a.prioritized).toBe(true);
  });

  it('copies an item for another list with as many meals as an add carries', () => {
    const sources = Array.from({length: MAX_SOURCES_PER_ADD + 2}, (_, index) => ({title: `Meal ${index}`, planDate: null}));
    const copy = copyOf(item('a', 'Mehl', {spec: '1 kg', aisle: 'BAKING', prioritized: true, sources}), 'b');

    expect(copy).toMatchObject({type: 'ADD', itemId: 'b', name: 'Mehl', spec: '1 kg', aisle: 'BAKING', prioritized: true});
    expect(copy.sources).toEqual(sources.slice(2));
  });

  it('orders changes made offline by when they were made', () => {
    const shown = visibleItems({server: {}, version: 1, pending: [
      {op: add('a', 'Brot'), at: '2026-10-05T10:00:00Z'}, {op: add('b', 'Butter'), at: '2026-10-05T10:00:01Z'}]});
    expect(activeItems(shown).map((each) => each.name)).toEqual(['Brot', 'Butter']);
  });
});
