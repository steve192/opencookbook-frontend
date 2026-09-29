import {describe, expect, it} from 'vitest';
import {uniqueBy} from './arrays';

describe('uniqueBy', () => {
  it('keeps the first item of each key in order', () => {
    const items = [{id: 1, key: 'a'}, {id: 2, key: 'b'}, {id: 3, key: 'a'}];
    expect(uniqueBy(items, (item) => item.key).map((item) => item.id)).toEqual([1, 2]);
  });
});
