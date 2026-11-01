import {IngredientUse, Recipe, RecipeDiet, RecipeGroup, RecipeImage} from '../api/types/recipes';
import {parseOptionalNumber} from './choices';
import {moveItem} from './listOrder';
import {toggledMealType} from './mealTypes';
import {RecipeSuit} from './recipeSuits';

/**
 * One recipe being edited, as a value.
 *
 * Every change the editor can make is a pure function returning a new recipe, so the screen
 * only decides when something changes and the store only decides how it is saved. The same
 * split the weekplan uses for its days.
 */

/** What was typed into an ingredient row in text mode. Once read, the row's parts are what the server read from it. */
export interface WrittenIngredient {
  text: string;
  read: boolean;
}

export type EditedIngredient = IngredientUse & {written?: WrittenIngredient};

/** The recipe as the editor holds it, with what was typed into its ingredient rows. */
export type EditedRecipe = Omit<Recipe, 'neededIngredients'> & {neededIngredients: EditedIngredient[]};

const blankIngredient = (): IngredientUse => ({ingredient: {name: ''}, amount: null, unit: '', note: ''});

/**
 * A recipe that has not been filled in yet, with one blank ingredient and step to start on.
 *
 * @return {Recipe} a blank recipe
 */
export const emptyRecipe = (): Recipe => ({
  title: '',
  neededIngredients: [blankIngredient()],
  preparationSteps: [''],
  images: [],
  servings: 1,
  // Starts without a group rather than with a blank one that saving had to strip out again
  recipeGroups: [],
  type: 'Recipe',
});

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
 * A side or component suits no meal, so choosing one clears the meals, and choosing a meal clears
 * it; tapping what is chosen clears it again.
 *
 * @param {Recipe} recipe the recipe being edited
 * @param {RecipeSuit} suit the meal, or side or component, that was tapped
 * @return {Recipe} a new recipe marked so, or no longer
 */
export const withSuitToggled = (recipe: Recipe, suit: RecipeSuit): Recipe => {
  if (suit === 'SIDE' || suit === 'COMPONENT') {
    return {...recipe, dishRole: recipe.dishRole === suit ? null : suit, mealTypes: []};
  }
  return {...recipe, mealTypes: toggledMealType(recipe.mealTypes, suit), dishRole: null};
};

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
 * @param {number} [index] where the blank ingredient goes; at the end without one
 * @return {Recipe} a new recipe with a blank ingredient there
 */
export const withIngredientAdded = (recipe: Recipe, index = recipe.neededIngredients.length): Recipe => ({
  ...recipe,
  neededIngredients: [
    ...recipe.neededIngredients.slice(0, index), blankIngredient(), ...recipe.neededIngredients.slice(index)],
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
 * In text mode the row shows what was typed, and keeps its last read parts until the server has read the text.
 *
 * @param {EditedRecipe} recipe the recipe being edited
 * @param {number} index which ingredient
 * @param {string} text what was typed
 * @return {EditedRecipe} a new recipe with that row waiting to be read, or blank where nothing was typed
 */
export const withIngredientWritten = (recipe: EditedRecipe, index: number, text: string): EditedRecipe => ({
  ...recipe,
  neededIngredients: recipe.neededIngredients.map((row, at) => {
    if (at !== index) {
      return row;
    }
    return text.trim() === '' ? blankIngredient() : {...row, written: {text, read: false}};
  }),
});

/**
 * Only rows still waiting for exactly that text are read: a row typed on since waits for its new text.
 *
 * @param {EditedRecipe} recipe the recipe being edited
 * @param {Map} read per text, the ingredient read from it, or null where it names none
 * @return {EditedRecipe} a new recipe with those rows read
 */
export const withIngredientsRead = (
    recipe: EditedRecipe,
    read: ReadonlyMap<string, IngredientUse | null>,
): EditedRecipe => ({
  ...recipe,
  neededIngredients: recipe.neededIngredients.map((row) => {
    const written = row.written;
    if (!written || written.read || !read.has(written.text)) {
      return row;
    }
    return {...(read.get(written.text) ?? blankIngredient()), written: {text: written.text, read: true}};
  }),
});

/**
 * @param {EditedRecipe} recipe the recipe being edited
 * @return {string[]} the texts of rows the server has not read yet, each once
 */
export const unreadIngredientTexts = (recipe: EditedRecipe): string[] => [...new Set(
    recipe.neededIngredients.flatMap((row) => row.written && !row.written.read ? [row.written.text] : []))];

/**
 * @param {EditedRecipe} recipe the recipe being edited
 * @return {string[]} the texts of rows in which the server found no ingredient ("200 g")
 */
export const unnamedIngredientTexts = (recipe: EditedRecipe): string[] =>
  recipe.neededIngredients.flatMap((row) => row.written?.read && row.ingredient.name === '' ? [row.written.text] : []);

/**
 * An amount for typing it anew; 0 shows as none, as in the recipe.
 *
 * @param {number | null} amount the amount
 * @param {string} [locale] how the decimal is written; the amount field takes a point
 * @return {string} "1.5", "0.333", or nothing
 */
export const amountText = (amount: number | null, locale = 'en'): string =>
  amount ? amount.toLocaleString(locale, {maximumFractionDigits: 3, useGrouping: false}) : '';

/**
 * @param {EditedIngredient} row an ingredient row
 * @param {string} locale how the decimal is written
 * @return {string} what text mode shows in it: what was typed, else its parts as in "200 g Butter, weich"
 */
export const ingredientText = (row: EditedIngredient, locale: string): string => row.written?.text ??
  [amountText(row.amount, locale), row.unit.trim(), row.ingredient.name].filter((part) => part !== '').join(' ') +
    (row.note ? `, ${row.note}` : '');

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

const isUntouchedIngredientLine = (line: IngredientUse): boolean =>
  line.ingredient.name.trim() === '' && line.amount === null && line.unit.trim() === '' && line.note.trim() === '';

/**
 * What is sent when the recipe is saved.
 *
 * A group the user never picked is left behind as a blank entry, which the server would
 * store as a group with no name. The editor's blank ingredient line is left out too, and so is
 * what was typed into a row.
 *
 * @param {EditedRecipe} recipe the recipe being edited
 * @return {Recipe} the recipe as it should be stored
 */
export const forSaving = (recipe: EditedRecipe): Recipe => ({
  ...recipe,
  recipeGroups: recipe.recipeGroups.filter((group) => group.title !== ''),
  neededIngredients: recipe.neededIngredients
      .filter((line) => !isUntouchedIngredientLine(line))
      .map(({ingredient, amount, unit, note}) => ({ingredient, amount, unit, note})),
});
