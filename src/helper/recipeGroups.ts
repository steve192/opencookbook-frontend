import type {Option} from '../components/SelectionPopupModal';
import type {Recipe, RecipeGroup} from '../dao/RestAPI';

/**
 * Key of the picker entry that stands for "belongs to no group at all".
 * Group ids are numbers, so this can never collide with a real one.
 */
export const NO_RECIPE_GROUP_KEY = 'none';

/** A group that has already been persisted and can therefore be referenced by id. */
type PersistedRecipeGroup = RecipeGroup & {id: number};

const isPersisted = (recipeGroup: RecipeGroup): recipeGroup is PersistedRecipeGroup =>
  recipeGroup.id !== undefined;

/**
 * Turns the known groups into picker entries, led by the entry that removes the group.
 *
 * Groups without an id are left out, they cannot be referenced by an option key yet.
 *
 * @param {RecipeGroup[]} recipeGroups groups to offer
 * @param {string} noGroupLabel translated label of the "no group" entry
 * @return {Option[]} entries for a selection popup
 */
export const toRecipeGroupOptions = (recipeGroups: RecipeGroup[], noGroupLabel: string): Option[] => [
  {key: NO_RECIPE_GROUP_KEY, value: noGroupLabel},
  ...recipeGroups
      .filter(isPersisted)
      .map((recipeGroup) => ({key: recipeGroup.id.toString(), value: recipeGroup.title})),
];

/**
 * Resolves the entry a user picked back to the group it stands for.
 *
 * @param {RecipeGroup[]} recipeGroups groups the options were built from
 * @param {Option} selectedOption entry the user picked
 * @return {RecipeGroup | undefined} picked group, or undefined for "no group"
 */
export const findRecipeGroupByOption = (recipeGroups: RecipeGroup[], selectedOption: Option): RecipeGroup | undefined =>
  recipeGroups.filter(isPersisted).find((recipeGroup) => recipeGroup.id.toString() === selectedOption.key);

/**
 * Copies of the given recipes, moved into the target group.
 *
 * A recipe belongs to a single group in the ui, so the target replaces whatever it had before.
 * Without a target the recipes end up in no group at all.
 *
 * @param {Recipe[]} recipes recipes to move
 * @param {RecipeGroup | undefined} targetGroup group to move them into, undefined to remove
 * @return {Recipe[]} updated copies, the inputs are left untouched
 */
export const moveRecipesToGroup = (recipes: Recipe[], targetGroup: RecipeGroup | undefined): Recipe[] =>
  recipes.map((recipe) => ({...recipe, recipeGroups: targetGroup ? [targetGroup] : []}));
