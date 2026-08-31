import {TFunction} from 'i18next';
import {RecipeDiet} from '../dao/RestAPI';

/** The diets the server knows about, in the order they are offered. */
export const RECIPE_DIETS: RecipeDiet[] = ['VEGAN', 'VEGETARIAN', 'MEAT'];

const DIET_LABEL_KEYS: Record<RecipeDiet, string> = {
  VEGAN: 'screens.editRecipe.dietVegan',
  VEGETARIAN: 'screens.editRecipe.dietVegetarian',
  MEAT: 'screens.editRecipe.dietMeat',
};

/**
 * What to call a diet on screen.
 *
 * Kept in one place so the recipe page and the editor cannot drift apart, and so only one
 * of them has to know which translation keys these live under.
 *
 * @param {TFunction} t the translation function of the calling screen
 * @param {RecipeDiet} [diet] the diet of the recipe, absent when it has none
 * @return {string | undefined} the label, or undefined when there is nothing to show
 */
export const dietLabel = (t: TFunction, diet?: RecipeDiet | null): string | undefined =>
  diet ? t(DIET_LABEL_KEYS[diet]) : undefined;
