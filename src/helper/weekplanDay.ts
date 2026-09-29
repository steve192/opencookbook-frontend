import {Recipe, WeekplanDay, WeekplanDayRecipeInfo} from '../dao/RestAPI';
import XDate from 'xdate';
import {uniqueBy} from './arrays';
import {moveItem} from './listOrder';
import {toDayKey} from './weekplan';

/**
 * The plan of one day, as a value.
 *
 * Every change to a day is expressed here as a pure function returning a new
 * day, so the screen only decides *when* something changes and the store only
 * decides how it is persisted.
 */

/**
 * A day with nothing planned yet.
 *
 * @param {string} dayKey the day in the format the API keys days with
 * @return {WeekplanDay} an empty plan for that day
 */
export const emptyWeekplanDay = (dayKey: string): WeekplanDay => ({day: dayKey, recipes: []});

/**
 * Appends a saved recipe - your own, or one from the household cookbook of a household plan.
 *
 * @param {WeekplanDay} day day to add to
 * @param {Recipe} recipe recipe that was picked
 * @return {WeekplanDay} a new day including that recipe
 */
export const withRecipeAdded = (day: WeekplanDay, recipe: Pick<Recipe, 'id' | 'title'>): WeekplanDay => ({
  ...day,
  recipes: [...day.recipes, {id: recipe.id, title: recipe.title, type: 'NORMAL_RECIPE'}],
});

/**
 * Appends a spontaneous meal, which exists only inside the plan.
 *
 * @param {WeekplanDay} day day to add to
 * @param {string} title what the user typed
 * @return {WeekplanDay} a new day including that meal
 */
export const withSimpleMealAdded = (day: WeekplanDay, title: string): WeekplanDay => ({
  ...day,
  recipes: [...day.recipes, {title: title, type: 'SIMPLE_RECIPE'}],
});

/**
 * Drops the meal at the given position.
 *
 * @param {WeekplanDay} day day to remove from
 * @param {number} index position of the meal
 * @return {WeekplanDay} a new day without that meal
 */
export const withMealRemoved = (day: WeekplanDay, index: number): WeekplanDay => ({
  ...day,
  recipes: day.recipes.filter((meal, mealIndex) => mealIndex !== index),
});

/**
 * Moves a meal to another position within the same day. Positions outside the
 * day are ignored, which lets callers wire up the ends of the list unguarded.
 *
 * @param {WeekplanDay} day day to reorder
 * @param {number} fromIndex position of the meal to move
 * @param {number} toIndex position it should end up at
 * @return {WeekplanDay} a new day in the new order, or the day unchanged
 */
export const withMealMoved = (day: WeekplanDay, fromIndex: number, toIndex: number): WeekplanDay => {
  const reordered = moveItem(day.recipes, fromIndex, toIndex);
  return reordered === day.recipes ? day : {...day, recipes: reordered};
};

/**
 * Counts everything planned across a set of days.
 *
 * @param {WeekplanDay[]} days days to count
 * @return {number} number of planned meals
 */
export const countMeals = (days: WeekplanDay[]): number =>
  days.reduce((total, day) => total + day.recipes.length, 0);

/**
 * A day exists once per plan, so the day alone does not identify one.
 *
 * @param {WeekplanDay} day the day to key
 * @return {string} a key unique across plans
 */
export const planKey = (day: WeekplanDay): string => `${day.householdId ?? ''}|${day.day}`;

// Whether the day belongs to that household's plan, or with none to your own.
export const isPlanOf = (day: WeekplanDay, householdId: string | null | undefined): boolean =>
  (day.householdId ?? null) === (householdId ?? null);

/** A recipe cooked earlier in a plan, whose leftovers can be planned. */
export interface LeftoverSource {
  recipeId: number;
  title: string;
  titleImageUuid?: string;
  /** yyyy-MM-dd */
  cookedOn: string;
}

export const LEFTOVER_DAYS = 7;

type CookedMeal = WeekplanDayRecipeInfo & {id: number};

const isCooked = (meal: WeekplanDayRecipeInfo): meal is CookedMeal =>
  meal.type === 'NORMAL_RECIPE' && !meal.leftoverOf && typeof meal.id === 'number';

/**
 * Recipes cooked in the same plan during the week before the day, the latest first.
 *
 * @param {WeekplanDay[]} days every day loaded, of any plan
 * @param {WeekplanDay} plan the day of the plan being planned
 * @return {LeftoverSource[]} one per cooked recipe and day
 */
export const leftoverSources = (days: WeekplanDay[], plan: WeekplanDay): LeftoverSource[] => {
  const since = toDayKey(new XDate(plan.day).addDays(-LEFTOVER_DAYS));
  const sources = days
      .filter((day) => isPlanOf(day, plan.householdId) && day.day >= since && day.day < plan.day)
      .sort((first, second) => second.day.localeCompare(first.day))
      .flatMap((day) => day.recipes.filter(isCooked).map((meal) => ({
        recipeId: meal.id, title: meal.title, titleImageUuid: meal.titleImageUuid, cookedOn: day.day,
      })));
  return uniqueBy(sources, (source) => `${source.cookedOn}:${source.recipeId}`);
};

export const withLeftoversAdded = (day: WeekplanDay, source: LeftoverSource): WeekplanDay => ({
  ...day,
  recipes: [...day.recipes, {
    id: source.recipeId, title: source.title, titleImageUuid: source.titleImageUuid, type: 'NORMAL_RECIPE',
    leftoverOf: source.cookedOn,
  }],
});

/**
 * Turns a planned recipe into leftovers or back. Drops its servings: cooked again, it is made as written.
 *
 * @param {WeekplanDay} day the day
 * @param {number} index position of the meal
 * @param {string | null} cookedOn the day it was cooked, or null to cook it again
 * @return {WeekplanDay} a new day with that meal changed
 */
export const withLeftoverOf = (day: WeekplanDay, index: number, cookedOn: string | null): WeekplanDay => ({
  ...day,
  recipes: day.recipes.map((meal, mealIndex) =>
    mealIndex === index ? {...meal, leftoverOf: cookedOn, servings: null} : meal),
});
