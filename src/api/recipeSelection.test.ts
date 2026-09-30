import {describe, expect, it} from 'vitest';
import {ownRecipesOf, recipeInListing, recipesShownIn} from './recipeSelection';
import {Recipe} from './types/recipes';

const recipe = (id: number, mine: boolean, householdIds: string[] = []): Recipe => ({
  id, title: 'Recipe ' + id, neededIngredients: [], preparationSteps: [], images: [], servings: 2, recipeGroups: [],
  type: 'Recipe', mine, householdIds,
});

describe('recipeSelection', () => {
  const listing = [
    recipe(1, true, ['home']),
    recipe(2, false, ['home', 'club']),
    recipe(3, false, ['club']),
    recipe(4, true),
  ];

  it('takes your own recipes out of everything you can read', () => {
    expect(ownRecipesOf(listing).map((each) => each.id)).toEqual([1, 4]);
  });

  it('shows in a household what that household shows, your own shared recipes included', () => {
    expect(recipesShownIn(listing, 'home').map((each) => each.id)).toEqual([1, 2]);
    expect(recipesShownIn(listing, 'club').map((each) => each.id)).toEqual([2, 3]);
  });
});

describe('recipeInListing', () => {
  const recipes = [recipe(1, true), recipe(2, false)];

  it('finds a recipe of the listing', () => {
    expect(recipeInListing(recipes, false, 2)).toEqual({recipe: recipes[1], notFound: false});
  });

  it('has nothing to say while the listing is not loaded', () => {
    expect(recipeInListing(undefined, true, 1)).toEqual({recipe: undefined, notFound: false});
  });

  it('reports a recipe missing from a listing that is fetched', () => {
    expect(recipeInListing(recipes, false, 3)).toEqual({recipe: undefined, notFound: true});
  });

  it('does not report a recipe missing while the listing is being fetched', () => {
    expect(recipeInListing(recipes, true, 3)).toEqual({recipe: undefined, notFound: false});
  });
});
