import {Recipe} from './types/recipes';

export const isOwnRecipe = (recipe: Recipe) => recipe.mine === true;

export const ownRecipesOf = (recipes: Recipe[]): Recipe[] => recipes.filter(isOwnRecipe);

export const recipesShownIn = (recipes: Recipe[], householdId: string): Recipe[] =>
  recipes.filter((recipe) => recipe.householdIds?.includes(householdId));

// A recipe created a moment ago only arrives with the refetch its creation started, so a listing
// that is being fetched cannot say yet that a recipe does not exist.
export const recipeInListing = (recipes: Recipe[] | undefined, fetching: boolean, recipeId: number):
    {recipe?: Recipe, notFound: boolean} => {
  const recipe = recipes?.find((candidate) => candidate.id === recipeId);
  return {recipe, notFound: recipes !== undefined && !fetching && recipe === undefined};
};
