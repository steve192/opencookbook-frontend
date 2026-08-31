import {Recipe, WeekplanDay, WeekplanDayRecipeInfo} from '../dao/RestAPI';

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
 * Appends one of the user's saved recipes.
 *
 * @param {WeekplanDay} day day to add to
 * @param {Recipe} recipe recipe that was picked
 * @return {WeekplanDay} a new day including that recipe
 */
export const withRecipeAdded = (day: WeekplanDay, recipe: Recipe): WeekplanDay => ({
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
  const isOutside = (index: number) => index < 0 || index >= day.recipes.length;
  if (fromIndex === toIndex || isOutside(fromIndex) || isOutside(toIndex)) {
    return day;
  }

  const reordered: WeekplanDayRecipeInfo[] = [...day.recipes];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return {...day, recipes: reordered};
};

/**
 * Counts everything planned across a set of days.
 *
 * @param {WeekplanDay[]} days days to count
 * @return {number} number of planned meals
 */
export const countMeals = (days: WeekplanDay[]): number =>
  days.reduce((total, day) => total + day.recipes.length, 0);
