import {TFunction} from 'i18next';
import {MealType, Recipe} from '../dao/RestAPI';
import {MEAL_TYPES, mealTypeLabel} from './mealTypes';
import {dietLabel} from './recipeDiet';

/** One question in the editor for two fields: the meals a dish suits, or that it is no dish of its own. */
export type RecipeSuit = MealType | 'SIDE' | 'COMPONENT';

/** The meals in the order of a day, then what is no dish of its own. */
export const RECIPE_SUITS: RecipeSuit[] = [...MEAL_TYPES, 'SIDE', 'COMPONENT'];

const ROLE_LABEL_KEYS = {
  SIDE: 'screens.editRecipe.dishRoleSide',
  COMPONENT: 'screens.editRecipe.dishRoleComponent',
} as const;

const isRole = (suit: RecipeSuit): suit is 'SIDE' | 'COMPONENT' => suit === 'SIDE' || suit === 'COMPONENT';

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {RecipeSuit} suit a meal, or what the recipe is instead of a dish
 * @return {string} what to call it
 */
export const suitLabel = (t: TFunction, suit: RecipeSuit): string =>
  isRole(suit) ? t(ROLE_LABEL_KEYS[suit]) : mealTypeLabel(t, suit);

/**
 * @param {Recipe} recipe the recipe
 * @param {RecipeSuit} suit a meal, or what the recipe is instead of a dish
 * @return {boolean} whether the recipe is marked so
 */
export const isSuited = (recipe: Recipe, suit: RecipeSuit): boolean =>
  isRole(suit) ? recipe.dishRole === suit : (recipe.mealTypes ?? []).includes(suit);

/**
 * @param {Recipe} recipe the recipe
 * @return {RecipeSuit[]} what it is marked with, in the order they are offered
 */
export const suitsOf = (recipe: Recipe): RecipeSuit[] => RECIPE_SUITS.filter((suit) => isSuited(recipe, suit));

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {Recipe} recipe the recipe
 * @return {string | undefined} its diet and what it suits in one line, or undefined while neither is known
 */
export const planningSummary = (t: TFunction, recipe: Recipe): string | undefined => {
  const parts = [dietLabel(t, recipe.recipeType), ...suitsOf(recipe).map((suit) => suitLabel(t, suit))]
      .filter((part): part is string => !!part);
  return parts.length > 0 ? parts.join(' · ') : undefined;
};
