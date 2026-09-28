import {describe, expect, it, vi} from 'vitest';
import {ShoppingItem, ShoppingList} from '../../dao/RestAPI';

// Reached through authSlice; does not resolve under the node test environment.
vi.mock('../../AppPersistence', () => ({default: {clearOfflineData: () => undefined}}));

const {logout} = await import('./authSlice');
const {default: reducer, shoppingChangesReceived, shoppingListsLoaded, shoppingOpQueued} =
  await import('./shoppingSlice');

const list = (id: number): ShoppingList =>
  ({id, name: null, defaultList: id === 1, householdId: null, householdName: null, version: 0});

const item = (id: string): ShoppingItem => ({
  id, name: id, spec: null, aisle: 'OTHER', aisleManual: false, icon: null, status: 'ACTIVE', boughtAt: null,
  addedBy: null, sources: [], deleted: false, version: 1,
});

const start = reducer(undefined, shoppingListsLoaded([list(1), list(2)]));

describe('shoppingSlice', () => {
  it('shows the first list until another is chosen', () => {
    expect(start.activeListId).toBe(1);
  });

  it('forgets what it knew about a list that is gone', () => {
    const synced = reducer(start, shoppingOpQueued({listId: 2, op: {opId: 'a', type: 'BUY', itemId: 'x'}}));
    expect(reducer(synced, shoppingListsLoaded([list(1)])).sync[2]).toBeUndefined();
  });

  it('forgets every list when somebody signs out', () => {
    const state = reducer(start, logout());
    expect(state.lists).toEqual([]);
    expect(state.hydrated).toBe(true);
  });

  it('drops only the ops an answer confirms', () => {
    let state = reducer(start, shoppingOpQueued({listId: 1, op: {opId: 'a', type: 'ADD', itemId: 'x', name: 'Brot'}}));
    state = reducer(state, shoppingOpQueued({listId: 1, op: {opId: 'b', type: 'BUY', itemId: 'x'}}));

    state = reducer(state, shoppingChangesReceived({listId: 1, sent: 1,
      changes: {version: 3, full: false, items: [item('x')]}}));

    expect(state.sync[1].pending.map((op) => op.opId)).toEqual(['b']);
    expect(state.sync[1].version).toBe(3);
    expect(Object.keys(state.sync[1].server)).toEqual(['x']);
  });
});
