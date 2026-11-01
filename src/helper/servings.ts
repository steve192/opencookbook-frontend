import {IngredientUse} from '../api/types/recipes';

/**
 * How much more or less a recipe needs when cooked for other servings. A recipe that states no
 * servings is taken as written for one.
 *
 * @param {number} recipeServings what the recipe is written for
 * @param {number} servings what it is cooked for
 * @return {number} the factor every amount is multiplied with
 */
export const servingFactor = (recipeServings: number | null | undefined, servings: number): number =>
  !recipeServings || recipeServings < 1 ? 1 : servings / recipeServings;

/**
 * An amount as a person reads it: one decimal at most, none when whole.
 *
 * @param {number} amount the exact amount
 * @param {string} locale how the decimal is written
 * @return {string} "1.5", "1,5" or "2"
 */
export const formatAmount = (amount: number, locale?: string): string =>
  (Math.round(amount * 10) / 10).toLocaleString(locale, {maximumFractionDigits: 1, useGrouping: false});

/**
 * An ingredient's amount and unit as a recipe shows them.
 *
 * @param {IngredientUse} ingredient the ingredient of the recipe
 * @param {string} locale how the decimal is written
 * @param {number} factor what the amount is scaled by
 * @return {string} "1,5 EL", "Prise", or nothing
 */
export const amountLabel = (ingredient: IngredientUse, locale: string, factor = 1): string => {
  const amount = ingredient.amount && ingredient.amount > 0 ? formatAmount(ingredient.amount * factor, locale) : '';
  return `${amount} ${ingredient.unit}`.trim();
};
