import {describe, expect, it} from 'vitest';
import {ShoppingItem, ShoppingRegular} from '../../api/types/shopping';
import {suggestedNow} from './suggestions';

const NOW = new Date('2026-10-07T12:00:00Z');
const OPEN = {from: '2026-10-07T08:00:00Z', until: '2026-10-10T20:00:00Z'};

const regular = (name: string, extra: Partial<ShoppingRegular> = {}): ShoppingRegular => ({
  id: 1, name, aisle: 'DAIRY_EGGS', icon: null, everyDays: 7, lastBoughtAt: '2026-10-01T10:00:00Z', muted: false,
  windows: [OPEN], ...extra,
});
const item = (name: string, extra: Partial<ShoppingItem>): ShoppingItem => ({
  id: name, name, spec: null, aisle: 'DAIRY_EGGS', aisleManual: false, icon: null, status: 'BOUGHT',
  boughtAt: '2026-10-01T10:00:00Z', addedBy: null, sources: [], deleted: false, version: 1, ...extra,
});
const names = (regulars: ShoppingRegular[]) => regulars.map((each) => each.name);

describe('suggestions', () => {
  it('suggests what is in an open window, by name', () => {
    const regulars = [regular('Milch'), regular('Butter'),
      regular('Eier', {windows: [{from: '2026-10-08T08:00:00Z', until: '2026-10-11T20:00:00Z'}]}),
      regular('Quark', {windows: [{from: '2026-10-01T08:00:00Z', until: '2026-10-04T20:00:00Z'}]})];

    expect(names(suggestedNow(regulars, [], NOW))).toEqual(['Butter', 'Milch']);
  });

  it('leaves out what is on the list or muted', () => {
    const regulars = [regular('Milch'), regular('Butter', {muted: true, windows: []})];

    expect(names(suggestedNow(regulars, [item('Milch', {status: 'ACTIVE', boughtAt: null})], NOW))).toEqual([]);
  });

  it('leaves out what was ticked since the rhythm was learned, until the regular items are asked for again', () => {
    expect(names(suggestedNow([regular('Milch')], [item('milch', {boughtAt: '2026-10-07T11:00:00Z'})], NOW))).toEqual([]);
    expect(names(suggestedNow([regular('Milch')], [item('Milch', {})], NOW))).toEqual(['Milch']);
  });
});
