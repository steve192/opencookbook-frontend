import {Recipe, RecipeGroup} from '../api/types/recipes';
import {titleImageUuid} from './recipeImages';

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
  ({...recipe, coverImageUuid: titleImageUuid(recipe)});

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
    coverImageUuid: groupRecipes.map(titleImageUuid).find((uuid) => uuid !== undefined),
  };
};

/**
 * The rows of a cookbook: inside a group, its recipes; otherwise the groups and the recipes in none of
 * them, or every recipe while searching. Without groups, as in a household cookbook, every recipe.
 *
 * @param {Recipe[]} recipes the cookbook's recipes
 * @param {RecipeGroup[]} groups the groups it shows
 * @param {number} [shownGroupId] the group opened, if any
 * @param {boolean} searching whether the rows are searched, which looks into the groups too
 * @return {ListRow[]} the rows
 */
export const cookbookRows = (recipes: Recipe[], groups: RecipeGroup[], shownGroupId: number | undefined,
    searching: boolean): ListRow[] => {
  if (shownGroupId) {
    return recipes.filter((recipe) => recipe.recipeGroups.some((group) => group.id === shownGroupId)).map(toRecipeRow);
  }
  const shownGroupIds = new Set(groups.map((group) => group.id));
  const outsideShownGroups = (recipe: Recipe) => !recipe.recipeGroups.some((group) => shownGroupIds.has(group.id));
  return [
    ...groups.map((group) => toRecipeGroupRow(group, recipes)),
    ...(searching ? recipes : recipes.filter(outsideShownGroups)).map(toRecipeRow),
  ];
};

/**
 * Whether a row has to be repainted.
 *
 * A group and a recipe can carry the same id, and while searching both kinds share one
 * list, so the type is part of the comparison. So are the cover and the count: a group's
 * come from its recipes, which arrive in a fetch of their own, and leaving them out left
 * groups showing an empty cover until scrolling recycled the row. A household cookbook shows
 * the owner's name as well.
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
  (row1 as RecipeGroupRow).recipeCount !== (row2 as RecipeGroupRow).recipeCount ||
  (row1 as RecipeRow).ownerDisplayName !== (row2 as RecipeRow).ownerDisplayName;
