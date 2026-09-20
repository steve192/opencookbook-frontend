import {describe, expect, it} from 'vitest';
import {ownIngredients} from './ownIngredients';

describe('ownIngredients', () => {
  // The server sends catalogue names with a null id, not a missing one
  it('drops catalogue names, whether their id is null or missing', () => {
    const all = [{id: 1, name: 'Tomate'}, {id: null as unknown as undefined, name: 'Tomatenmark'}, {name: 'Feta'}];

    expect(ownIngredients(all)).toEqual([{id: 1, name: 'Tomate'}]);
  });
});
