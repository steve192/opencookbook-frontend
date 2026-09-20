import {Recipe} from '../dao/RestAPI';
import {suitsOf} from './recipeSuits';

/** What an import or scan often cannot tell, and planning needs. */
export type MissingDetail = 'servings' | 'time' | 'suits' | 'diet';

/**
 * @param {Recipe} recipe the recipe as imported, and as completed since
 * @return {MissingDetail[]} what is still unknown, in the order the editor shows it
 */
export const missingDetails = (recipe: Recipe): MissingDetail[] => {
  const missing: MissingDetail[] = [];
  if (!recipe.servings) {
    missing.push('servings');
  }
  if (!recipe.totalTime && !recipe.preparationTime) {
    missing.push('time');
  }
  if (suitsOf(recipe).length === 0) {
    missing.push('suits');
  }
  if (!recipe.recipeType) {
    missing.push('diet');
  }
  return missing;
};

/**
 * @param {MissingDetail[]} missing what is still unknown
 * @return {boolean} whether any of it is what the planning section asks
 */
export const missesPlanningDetails = (missing: MissingDetail[]): boolean =>
  missing.includes('suits') || missing.includes('diet');
