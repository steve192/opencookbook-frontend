import {describe, expect, it} from 'vitest';
import {Aisle} from '../../dao/aisles';
import {groupByAisle, iconOf, TileCell, tileCells} from './aisles';

describe('aisles', () => {
  it('groups in the order a shop is walked and leaves empty aisles out', () => {
    const items: {name: string, aisle: Aisle}[] = [
      {name: 'Klopapier', aisle: 'HOUSEHOLD'}, {name: 'Apfel', aisle: 'FRUIT_VEG'}, {name: 'Birne', aisle: 'FRUIT_VEG'}];

    expect(groupByAisle(items).map((group) => [group.aisle, group.items.map((item) => item.name)])).toEqual([
      ['FRUIT_VEG', ['Apfel', 'Birne']], ['HOUSEHOLD', ['Klopapier']]]);
  });

  it('puts a heading before each aisle, or keeps the given order without', () => {
    const items: {name: string, aisle: Aisle}[] = [{name: 'Klopapier', aisle: 'HOUSEHOLD'}, {name: 'Apfel', aisle: 'FRUIT_VEG'}];
    const labelOf = (cell: TileCell<{name: string}>) => 'heading' in cell ? cell.heading : cell.item.name;

    expect(tileCells(items, true).map(labelOf)).toEqual(['FRUIT_VEG', 'Apfel', 'HOUSEHOLD', 'Klopapier']);
    expect(tileCells(items, false).map(labelOf)).toEqual(['Klopapier', 'Apfel']);
  });

  it('shows the aisle icon for an item without its own', () => {
    expect(iconOf(null, 'FROZEN')).toBe('ice');
    expect(iconOf('carrot', 'FROZEN')).toBe('carrot');
  });
});
