import {describe, expect, it} from 'vitest';
import {ShoppingItem, ShoppingTile} from '../../dao/RestAPI';
import {searchTiles, tileName, tileNamed, typedEntry} from './tiles';

const tile = (key: string, de: string[], en: string[]): ShoppingTile =>
  ({key, aisle: 'OTHER', icon: null, names: {de, en}});

const TILES = [
  tile('milk', ['Milch', 'Vollmilch'], ['milk']),
  tile('oat-milk', ['Haferdrink', 'Hafermilch'], ['oat milk']),
  tile('flour', ['Mehl', 'Weizenmehl'], ['flour']),
];

describe('tiles', () => {
  it('names a tile in the app language', () => {
    expect(tileName(TILES[0], 'en')).toBe('milk');
    expect(tileName(TILES[0], 'fr')).toBe('Milch');
  });

  it('offers the whole name before names that merely contain it', () => {
    expect(searchTiles(TILES, 'milch', 'de').map((match) => match.key)).toEqual(['milk', 'oat-milk']);
  });

  it('finds a word inside a name', () => {
    expect(searchTiles(TILES, 'milk', 'en').map((match) => match.key)).toEqual(['milk', 'oat-milk']);
  });

  it('offers nothing for an empty field', () => {
    expect(searchTiles(TILES, '  ', 'de')).toEqual([]);
  });

  it('knows a tile by any of its names', () => {
    expect(tileNamed(TILES, 'weizenmehl')?.key).toBe('flour');
    expect(tileNamed(TILES, 'Zauberpulver')).toBeUndefined();
  });

  it('reads the field as one item, with the tile or recent purchase already standing for it', () => {
    const units = new Set(['kg']);
    const eggs = {id: 'e', name: 'Eier'} as ShoppingItem;

    expect(typedEntry('2 kg Mehl', units, TILES, [])).toEqual({name: 'Mehl', spec: '2 kg', tile: TILES[2],
      recent: undefined});
    expect(typedEntry('eier', units, TILES, [eggs])).toMatchObject({name: 'eier', tile: undefined, recent: eggs});
    expect(typedEntry('Zauberpulver', units, TILES, [])).toMatchObject({tile: undefined, recent: undefined});
    expect(typedEntry('  ', units, TILES, [])).toBeUndefined();
  });
});
