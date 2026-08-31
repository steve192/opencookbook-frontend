import {describe, expect, it} from 'vitest';
import {Recipe, WeekplanDay} from '../dao/RestAPI';
import {
  countMeals,
  emptyWeekplanDay,
  withMealMoved,
  withMealRemoved,
  withRecipeAdded,
  withSimpleMealAdded,
} from './weekplanDay';

const dayWith = (...titles: string[]): WeekplanDay => ({
  day: '2026-08-31',
  recipes: titles.map((title, index) => ({id: index, title, type: 'NORMAL_RECIPE' as const})),
});

const titlesOf = (day: WeekplanDay) => day.recipes.map((meal) => meal.title);

const recipe = (id: number, title: string): Recipe => ({
  id, title, neededIngredients: [], preparationSteps: [], images: [],
  servings: 1, recipeGroups: [], type: 'Recipe',
});

describe('weekplanDay', () => {
  it('creates an empty day for a date', () => {
    expect(emptyWeekplanDay('2026-08-31')).toEqual({day: '2026-08-31', recipes: []});
  });

  describe('withRecipeAdded', () => {
    it('appends the recipe as a normal meal', () => {
      const day = withRecipeAdded(dayWith('first'), recipe(7, 'second'));
      expect(titlesOf(day)).toEqual(['first', 'second']);
      expect(day.recipes[1]).toMatchObject({id: 7, type: 'NORMAL_RECIPE'});
    });

    it('leaves the day it was given untouched', () => {
      const original = dayWith('first');
      withRecipeAdded(original, recipe(7, 'second'));
      expect(titlesOf(original)).toEqual(['first']);
    });
  });

  describe('withSimpleMealAdded', () => {
    // A spontaneous meal has no recipe behind it, so it carries its own title
    // and gets its id from the server on save.
    it('appends a meal without an id', () => {
      const day = withSimpleMealAdded(dayWith(), 'Leftovers');
      expect(day.recipes).toEqual([{title: 'Leftovers', type: 'SIMPLE_RECIPE'}]);
    });
  });

  describe('withMealRemoved', () => {
    it('drops the meal at the given position', () => {
      expect(titlesOf(withMealRemoved(dayWith('a', 'b', 'c'), 1))).toEqual(['a', 'c']);
    });

    it('ignores a position that does not exist', () => {
      expect(titlesOf(withMealRemoved(dayWith('a'), 4))).toEqual(['a']);
    });

    it('leaves the day it was given untouched', () => {
      const original = dayWith('a', 'b');
      withMealRemoved(original, 0);
      expect(titlesOf(original)).toEqual(['a', 'b']);
    });
  });

  describe('withMealMoved', () => {
    it('moves a meal up', () => {
      expect(titlesOf(withMealMoved(dayWith('a', 'b', 'c'), 1, 0))).toEqual(['b', 'a', 'c']);
    });

    it('moves a meal down', () => {
      expect(titlesOf(withMealMoved(dayWith('a', 'b', 'c'), 0, 1))).toEqual(['b', 'a', 'c']);
    });

    it('moves across more than one position', () => {
      expect(titlesOf(withMealMoved(dayWith('a', 'b', 'c'), 2, 0))).toEqual(['c', 'a', 'b']);
    });

    // The row at the top offers no "move up", but guarding only in the helper
    // keeps every caller from having to know about the ends of the list.
    it('returns the day unchanged when moving past the start', () => {
      const original = dayWith('a', 'b');
      expect(withMealMoved(original, 0, -1)).toBe(original);
    });

    it('returns the day unchanged when moving past the end', () => {
      const original = dayWith('a', 'b');
      expect(withMealMoved(original, 1, 2)).toBe(original);
    });

    it('returns the day unchanged when moving onto itself', () => {
      const original = dayWith('a', 'b');
      expect(withMealMoved(original, 1, 1)).toBe(original);
    });

    it('leaves the day it was given untouched', () => {
      const original = dayWith('a', 'b');
      withMealMoved(original, 0, 1);
      expect(titlesOf(original)).toEqual(['a', 'b']);
    });
  });

  describe('countMeals', () => {
    it('sums the meals of all days', () => {
      expect(countMeals([dayWith('a', 'b'), dayWith(), dayWith('c')])).toBe(3);
    });

    it('is zero without days', () => {
      expect(countMeals([])).toBe(0);
    });
  });
});
