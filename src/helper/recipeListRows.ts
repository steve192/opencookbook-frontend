import {Recipe, RecipeGroup} from '../dao/RestAPI';

/**
 * A row of the recipe list carries everything that row shows.
 *
 * RecyclerListView decides whether to repaint a row by comparing row data alone, so a tile
 * that reads what it shows from somewhere else keeps whatever it was first rendered with
 * until scrolling recycles it.
 */
export interface RecipeRow extends Recipe {
  coverImageUuid?: string
}

export interface RecipeGroupRow extends RecipeGroup {
  coverImageUuid?: string
  recipeCount: number
}

export type ListRow = RecipeRow | RecipeGroupRow;

/**
 * A recipe as the list shows it.
 *
 * @param {Recipe} recipe recipe to show
 * @return {RecipeRow} the row for it
 */
export const toRecipeRow = (recipe: Recipe): RecipeRow =>
  ({...recipe, coverImageUuid: recipe.images[0]?.uuid});

/**
 * A group as the list shows it: with the cover and the count of the recipes in it.
 *
 * Resolving this up front also keeps the per-group scan of every recipe out of the row
 * renderer, where it ran on every repaint while scrolling.
 *
 * @param {RecipeGroup} recipeGroup group to show
 * @param {Recipe[]} recipes all recipes, of which the ones in the group are used
 * @return {RecipeGroupRow} the row for it
 */
export const toRecipeGroupRow = (recipeGroup: RecipeGroup, recipes: Recipe[]): RecipeGroupRow => {
  const groupRecipes = recipes.filter(
      (recipe) => recipe.recipeGroups.some((group) => group.id === recipeGroup.id),
  );
  return {
    ...recipeGroup,
    recipeCount: groupRecipes.length,
    coverImageUuid: groupRecipes.find((recipe) => recipe.images.length > 0)?.images[0]?.uuid,
  };
};

/**
 * Whether a row has to be repainted.
 *
 * A group and a recipe can carry the same id, and while searching both kinds share one
 * list, so the type is part of the comparison. So are the cover and the count: a group's
 * come from its recipes, which arrive in a fetch of their own, and leaving them out left
 * groups showing an empty cover until scrolling recycled the row.
 *
 * @param {ListRow} row1 the row as it was
 * @param {ListRow} row2 the row as it is now
 * @return {boolean} true when the two differ in anything the row shows
 */
export const listRowHasChanged = (row1: ListRow, row2: ListRow): boolean =>
  row1.type !== row2.type ||
  row1.id !== row2.id ||
  row1.title !== row2.title ||
  row1.coverImageUuid !== row2.coverImageUuid ||
  (row1 as RecipeGroupRow).recipeCount !== (row2 as RecipeGroupRow).recipeCount;
