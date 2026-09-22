import {describe, expect, it} from 'vitest';
import {columnsFor, columnWidth} from './recipeGrid';

describe('columnsFor', () => {
  it('fits more tiles as the list gets wider', () => {
    expect(columnsFor(320)).toBe(2);
    expect(columnsFor(600)).toBe(2);
    expect(columnsFor(900)).toBe(3);
  });

  // A list that has not been measured yet reports zero, and zero columns is a division by zero
  it('never answers fewer than one', () => {
    expect(columnsFor(0)).toBe(1);
    expect(columnsFor(1)).toBe(1);
  });

  it('stops widening once the tiles would be too small to read', () => {
    expect(columnsFor(4000)).toBe(4);
  });
});

describe('columnWidth', () => {
  it('splits the width evenly, whatever a row happens to hold', () => {
    expect(columnWidth(1)).toBe('100%');
    expect(columnWidth(2)).toBe('50%');
    expect(columnWidth(4)).toBe('25%');
  });
});
