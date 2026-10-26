import {describe, expect, it} from 'vitest';
import {ShoppingTile} from '../../api/types/shopping';
import {indexTiles, KnownName, offersFor, tileName, TYPED_TILE_KEY} from './tiles';

const tile = (key: string, de: string[], en: string[]): ShoppingTile =>
  ({key, aisle: 'OTHER', icon: key, names: {de, en}});

const TILES = [
  tile('milk', ['Milch', 'Vollmilch'], ['milk']),
  tile('oat-milk', ['Hafermilch', 'Haferdrink'], ['oat milk']),
  tile('flour', ['Mehl', 'Weizenmehl'], ['flour']),
  tile('rice', ['Reis', 'Reis poliert', 'Milchreis', 'Basmatireis'], ['rice']),
  tile('pasta', ['Nudeln', 'Spaghetti'], ['pasta']),
  tile('ice-cream', ['Eis', 'Speiseeis'], ['ice cream']),
  tile('vanilla-ice-cream', ['Vanilleeis'], ['vanilla ice cream']),
  tile('pork', ['Schweinefleisch'], ['pork']),
];
const UNITS = new Set(['kg']);
const known = (name: string): KnownName => ({name, aisle: 'DAIRY_EGGS', icon: null});

const INDEX = indexTiles(TILES, 'de');
const offers = (typed: string, earlier: KnownName[] = []) => offersFor(typed, UNITS, INDEX, earlier);
const names = (list: {name: string}[] = []) => list.map((offer) => offer.name);

describe('tiles', () => {
  it('names a tile in the app language', () => {
    expect(tileName(TILES[0], 'en')).toBe('milk');
    expect(tileName(TILES[0], 'fr')).toBe('Milch');
  });

  it('offers nothing for an empty field', () => {
    expect(offers('  ')).toBeUndefined();
  });

  it('puts a tile of exactly the typed name first, under that name', () => {
    expect(offers('milchreis')?.typed).toEqual({key: 'rice', name: 'Milchreis', aisle: 'OTHER', icon: 'rice',
      placed: true});
  });

  it('puts the typed text first when nothing has that name, for the server to place', () => {
    expect(offers('Zauberpulver')?.typed).toEqual({key: TYPED_TILE_KEY, name: 'Zauberpulver', aisle: 'OTHER',
      icon: null, placed: false});
  });

  it('puts an earlier entry of exactly the typed name first', () => {
    expect(offers('hafermilch barista', [known('Hafermilch Barista')])?.typed)
        .toMatchObject({name: 'Hafermilch Barista', aisle: 'DAIRY_EGGS', placed: true});
  });

  it('keeps the typed amount for whichever offer is taken', () => {
    expect(offers('2 kg Mehl')).toMatchObject({spec: '2 kg', typed: {key: 'flour', name: 'Mehl'}});
  });

  it('shows each tile under the name that matched, starts before mere mentions', () => {
    expect(names(offers('milch')?.fitting)).toEqual(['Milchreis', 'Hafermilch']);
    expect(names(offers('spag')?.fitting)).toEqual(['Spaghetti']);
  });

  it('offers earlier entries that fit, without the one typed', () => {
    const earlier = [known('Milch'), known('Milchschnitte'), known('Brot')];

    expect(names(offers('milch', earlier)?.earlier)).toEqual(['Milchschnitte']);
  });

  it('finds a compound by its last word but not by chance inside a word', () => {
    expect(offers('eis')?.typed.key).toBe('ice-cream');
    expect(names(offers('eis')?.fitting)).toEqual(['Reis', 'Vanilleeis']);
  });

  it('shows a tile found inside a word under its own name', () => {
    expect(names(offers('drink')?.fitting)).toEqual(['Hafermilch']);
  });

  it('shows no tile under a name an earlier entry already offers', () => {
    expect(names(offers('mil', [known('Milch')])?.fitting)).not.toContain('Milch');
  });
});
