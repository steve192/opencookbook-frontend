import {describe, expect, it} from 'vitest';
import {parseQuickAdd} from './quickAdd';

/** A few of the catalogue's unit words, as the server sends them. */
const UNITS = new Set(['g', 'kg', 'l', 'netz']);

describe('parseQuickAdd', () => {
  it.each([
    ['2 kg Kartoffeln', 'Kartoffeln', '2 kg'],
    ['Kartoffeln 2 kg', 'Kartoffeln', '2 kg'],
    ['500g Mehl', 'Mehl', '500g'],
    ['1,5 l Milch', 'Milch', '1,5 l'],
    ['3 Äpfel', 'Äpfel', '3'],
    ['Eier 10', 'Eier', '10'],
    ['1 Netz Zwiebeln', 'Zwiebeln', '1 Netz'],
  ])('reads "%s" as %s, %s', (typed, name, spec) => {
    expect(parseQuickAdd(typed, UNITS)).toEqual({name, spec});
  });

  it('keeps a word after a number in the name when it is no unit', () => {
    expect(parseQuickAdd('2 pizza doughs', UNITS)).toEqual({name: 'pizza doughs', spec: '2'});
  });

  it('leaves a name without an amount alone', () => {
    expect(parseQuickAdd('  Klopapier ', UNITS)).toEqual({name: 'Klopapier', spec: null});
  });

  it('does not take a number inside a name for an amount', () => {
    expect(parseQuickAdd('Typ 405 Mehl', UNITS)).toEqual({name: 'Typ 405 Mehl', spec: null});
  });
});
