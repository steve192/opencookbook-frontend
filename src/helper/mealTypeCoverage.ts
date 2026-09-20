import {Recipe} from '../dao/RestAPI';
import {suitsOf} from './recipeSuits';

/** From this share of recipes saying neither their meals nor that they are no dish, meal filters and ranking mostly guess. */
const WARNING_SHARE = 0.5;

export interface MealTypeCoverage {
  untagged: number;
  total: number;
}

/**
 * A side or component suits no meal, and is marked all the same.
 *
 * @param {Recipe[]} recipes the cook's recipes
 * @return {MealTypeCoverage} how many of them are unmarked
 */
export const mealTypeCoverage = (recipes: Recipe[]): MealTypeCoverage => ({
  untagged: recipes.filter((recipe) => suitsOf(recipe).length === 0).length,
  total: recipes.length,
});

/**
 * @param {MealTypeCoverage} coverage how many recipes say which meals they suit
 * @return {boolean} whether so many do not that suggestions and plans will be poor
 */
export const warrantsMealTypeWarning = (coverage: MealTypeCoverage): boolean =>
  coverage.total > 0 && coverage.untagged / coverage.total >= WARNING_SHARE;
