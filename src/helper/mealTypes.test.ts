import {describe, expect, it} from 'vitest';
import {mealTypeAt, toggledMealType} from './mealTypes';

describe('toggledMealType', () => {
  it('adds a meal that was not there', () => {
    expect(toggledMealType([], 'DINNER')).toEqual(['DINNER']);
  });

  it('removes one that was', () => {
    expect(toggledMealType(['LUNCH', 'DINNER'], 'DINNER')).toEqual(['LUNCH']);
  });

  it('starts from nothing when the recipe has no meals yet', () => {
    expect(toggledMealType(undefined, 'BREAKFAST')).toEqual(['BREAKFAST']);
  });

  // Otherwise the chips would reorder themselves under the finger that tapped them
  it('keeps the order of a day rather than the order they were tapped', () => {
    expect(toggledMealType(['DESSERT'], 'BREAKFAST')).toEqual(['BREAKFAST', 'DESSERT']);
  });
});

describe('mealTypeAt', () => {
  it('guesses the meal from the hour', () => {
    expect(mealTypeAt(7)).toBe('BREAKFAST');
    expect(mealTypeAt(12)).toBe('LUNCH');
    expect(mealTypeAt(19)).toBe('DINNER');
  });
});
