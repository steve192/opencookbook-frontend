import {IngredientUse, Recipe, RecipeDiet, RecipeGroup, RecipeImage} from '../dao/RestAPI';
import {moveItem} from './listOrder';

/**
 * One recipe being edited, as a value.
 *
 * Every change the editor can make is a pure function returning a new recipe, so the screen
 * only decides when something changes and the store only decides how it is saved. The same
 * split the weekplan uses for its days.
 */

/**
 * A recipe that has not been filled in yet, with one blank ingredient and step to start on.
 *
 * @return {Recipe} a blank recipe
 */
export const emptyRecipe = (): Recipe => ({
  title: '',
  neededIngredients: [{ingredient: {name: ''}, amount: null, unit: ''}],
  preparationSteps: [''],
  images: [],
  servings: 1,
  // Starts without a group rather than with a blank one that saving had to strip out again
  recipeGroups: [],
  type: 'Recipe',
});

/**
 * Reads a number the user typed, treating anything that is not one as "not set".
 *
 * @param {string} text what was typed
 * @return {number | undefined} the number, or undefined to clear the field
 */
export const parseOptionalNumber = (text: string): number | undefined => {
  const parsed = parseInt(text, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {string} title the new title
 * @return {Recipe} a new recipe with that title
 */
export const withTitle = (recipe: Recipe, title: string): Recipe => ({...recipe, title});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {RecipeDiet | null} diet the diet, or null to clear it
 * @return {Recipe} a new recipe with that diet
 */
export const withDiet = (recipe: Recipe, diet: RecipeDiet | null): Recipe =>
  ({...recipe, recipeType: diet});

/**
 * The app carries one group per recipe, even though the server allows several.
 *
 * @param {Recipe} recipe the recipe being edited
 * @param {RecipeGroup} [group] the group, or nothing to belong to none
 * @return {Recipe} a new recipe in that group
 */
export const withGroup = (recipe: Recipe, group?: RecipeGroup): Recipe =>
  ({...recipe, recipeGroups: group ? [group] : []});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {'servings' | 'preparationTime' | 'totalTime'} field which number to set
 * @param {string} text what the user typed
 * @return {Recipe} a new recipe with that field set, or cleared
 */
export const withNumberField = (
    recipe: Recipe,
    field: 'servings' | 'preparationTime' | 'totalTime',
    text: string,
): Recipe => ({...recipe, [field]: parseOptionalNumber(text)});

/**
 * @param {Recipe} recipe the recipe being edited
 * @return {Recipe} a new recipe with a blank ingredient at the end
 */
export const withIngredientAdded = (recipe: Recipe): Recipe => ({
  ...recipe,
  neededIngredients: [...recipe.neededIngredients, {ingredient: {id: undefined, name: ''}, unit: '', amount: null}],
});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {number} index which ingredient
 * @param {IngredientUse} ingredient what it should become
 * @return {Recipe} a new recipe with that ingredient replaced
 */
export const withIngredientChanged = (recipe: Recipe, index: number, ingredient: IngredientUse): Recipe => ({
  ...recipe,
  neededIngredients: recipe.neededIngredients.map((existing, at) => at === index ? ingredient : existing),
});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {number} index which ingredient to drop
 * @return {Recipe} a new recipe without it
 */
export const withIngredientRemoved = (recipe: Recipe, index: number): Recipe => ({
  ...recipe,
  neededIngredients: recipe.neededIngredients.filter((unused, at) => at !== index),
});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {number} fromIndex which ingredient to move
 * @param {number} toIndex where it should end up
 * @return {Recipe} a new recipe in the new order
 */
export const withIngredientMoved = (recipe: Recipe, fromIndex: number, toIndex: number): Recipe => ({
  ...recipe,
  neededIngredients: moveItem(recipe.neededIngredients, fromIndex, toIndex),
});

/**
 * @param {Recipe} recipe the recipe being edited
 * @return {Recipe} a new recipe with a blank step at the end
 */
export const withStepAdded = (recipe: Recipe): Recipe =>
  ({...recipe, preparationSteps: [...recipe.preparationSteps, '']});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {number} index which step
 * @param {string} text what it should say
 * @return {Recipe} a new recipe with that step rewritten
 */
export const withStepChanged = (recipe: Recipe, index: number, text: string): Recipe => ({
  ...recipe,
  preparationSteps: recipe.preparationSteps.map((existing, at) => at === index ? text : existing),
});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {number} index which step to drop
 * @return {Recipe} a new recipe without it
 */
export const withStepRemoved = (recipe: Recipe, index: number): Recipe => ({
  ...recipe,
  preparationSteps: recipe.preparationSteps.filter((unused, at) => at !== index),
});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {number} fromIndex which step to move
 * @param {number} toIndex where it should end up
 * @return {Recipe} a new recipe in the new order
 */
export const withStepMoved = (recipe: Recipe, fromIndex: number, toIndex: number): Recipe =>
  ({...recipe, preparationSteps: moveItem(recipe.preparationSteps, fromIndex, toIndex)});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {string} uuid the uploaded image
 * @return {Recipe} a new recipe showing it last
 */
export const withImageAdded = (recipe: Recipe, uuid: string): Recipe =>
  ({...recipe, images: [...recipe.images, {uuid}]});

/**
 * Unlinking is enough: the server drops the image from the recipe on save and its deletion
 * job collects images that no recipe references any more.
 *
 * @param {Recipe} recipe the recipe being edited
 * @param {string} uuid the image to unlink
 * @return {Recipe} a new recipe without it
 */
export const withImageRemoved = (recipe: Recipe, uuid: string): Recipe =>
  ({...recipe, images: recipe.images.filter((image) => image.uuid !== uuid)});

/**
 * @param {Recipe} recipe the recipe being edited
 * @param {RecipeImage[]} images the images in their new order
 * @return {Recipe} a new recipe showing them that way
 */
export const withImages = (recipe: Recipe, images: RecipeImage[]): Recipe => ({...recipe, images});

/**
 * What is sent when the recipe is saved.
 *
 * A group the user never picked is left behind as a blank entry, which the server would
 * store as a group with no name.
 *
 * @param {Recipe} recipe the recipe being edited
 * @return {Recipe} the recipe as it should be stored
 */
export const forSaving = (recipe: Recipe): Recipe => ({
  ...recipe,
  recipeGroups: recipe.recipeGroups.filter((group) => group.title !== ''),
});
