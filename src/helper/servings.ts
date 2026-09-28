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
