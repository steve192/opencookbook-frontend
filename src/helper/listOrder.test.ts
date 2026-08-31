import {describe, expect, it} from 'vitest';
import {moveItem} from './listOrder';

describe('moveItem', () => {
  it('moves an item up', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 0)).toEqual(['b', 'a', 'c']);
  });

  it('moves an item down', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('moves across several positions', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
  });

  // The first row offers no "move up"; guarding here spares every caller from knowing that
  it('leaves the list alone when moving past the start', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 0, -1)).toBe(items);
  });

  it('leaves the list alone when moving past the end', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 1, 2)).toBe(items);
  });

  it('leaves the list alone when moving onto itself', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 1, 1)).toBe(items);
  });

  it('does not modify the list it was given', () => {
    const items = ['a', 'b', 'c'];
    moveItem(items, 0, 2);
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('handles an empty list', () => {
    expect(moveItem([], 0, 1)).toEqual([]);
  });
});
