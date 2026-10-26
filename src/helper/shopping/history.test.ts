import {describe, expect, it} from 'vitest';
import {ShoppingListEvent} from '../../api/types/shopping';
import {historyDays} from './history';

const event = (id: number, at: Date): ShoppingListEvent => ({
  id, at: at.toISOString(), kind: 'ADDED', name: 'Milch', aisle: 'DAIRY_EGGS', icon: null, spec: null,
  previousName: null, actor: 'Anna', byViewer: false, sources: [],
});

describe('history', () => {
  it('puts events under the local day they happened on, keeping their order', () => {
    const days = historyDays([
      event(3, new Date(2026, 9, 26, 9, 0)),
      event(2, new Date(2026, 9, 26, 0, 30)),
      event(1, new Date(2026, 9, 25, 23, 45)),
    ]);

    expect(days.map((day) => [day.day, day.data.map((each) => each.id)])).toEqual([
      ['2026-10-26', [3, 2]],
      ['2026-10-25', [1]],
    ]);
  });
});
