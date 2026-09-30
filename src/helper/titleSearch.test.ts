import {describe, expect, it} from 'vitest';
import {searchByTitle} from './titleSearch';

const recipes = [{title: 'Kartoffelgratin'}, {title: 'Linsensuppe'}, {title: 'Lasagne'}];

describe('searchByTitle', () => {
  it('keeps everything for an empty search', () => {
    expect(searchByTitle(recipes, '')).toEqual(recipes);
  });

  it('finds titles by the letters typed, in order', () => {
    expect(searchByTitle(recipes, 'gratin')).toEqual([{title: 'Kartoffelgratin'}]);
    expect(searchByTitle(recipes, 'lsa')).toEqual([{title: 'Lasagne'}]);
  });

  it('finds nothing for letters no title has', () => {
    expect(searchByTitle(recipes, 'xyz')).toEqual([]);
  });
});
