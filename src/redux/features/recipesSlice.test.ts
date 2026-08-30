import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Recipe, RecipeGroup} from '../../dao/RestAPI';

// RestAPI is only reached through the thunks' payload creators, which these
// tests never run - they dispatch the fulfilled actions directly.
vi.mock('../../dao/RestAPI', () => ({default: {}}));
vi.mock('../../AppPersistence', () => ({
  default: {storeRecipesOffline: vi.fn(), storeRecipeGroupsOffline: vi.fn()},
}));

const {createRecipe, createRecipeGroup, importRecipe, updateRecipe} = await import('./recipesSlice');
const reducer = (await import('./recipesSlice')).default;
const AppPersistence = (await import('../../AppPersistence')).default;

const group = (id: number, title: string): RecipeGroup => ({id, title, type: 'RecipeGroup'});

const recipe = (id: number, title: string, recipeGroups: RecipeGroup[] = []): Recipe => ({
  id,
  title,
  recipeGroups,
  neededIngredients: [],
  preparationSteps: [],
  images: [],
  servings: 2,
  type: 'Recipe',
});

const emptyState = () => ({recipes: [], recipeGroups: [], pendingRequests: 0});

const fulfilled = (thunk: {fulfilled: {type: string}}, payload: unknown, arg?: unknown) =>
  ({type: thunk.fulfilled.type, payload, meta: {arg}});

describe('recipesSlice', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts empty', () => {
    expect(reducer(undefined, {type: '@@INIT'})).toEqual(emptyState());
  });

  describe('importRecipe', () => {
    // An imported recipe used to be appended to the group list instead. It then showed up
    // as a group in the group picker, and the multi selection could not move it into a
    // group, because that only looks at recipes.
    it('adds the imported recipe to the recipes', () => {
      const imported = recipe(1, 'Imported cake');

      const state = reducer(emptyState(), fulfilled(importRecipe, imported));

      expect(state.recipes).toEqual([imported]);
    });

    it('does not add the imported recipe to the groups', () => {
      const state = reducer(emptyState(), fulfilled(importRecipe, recipe(1, 'Imported cake')));

      expect(state.recipeGroups).toEqual([]);
    });

    it('keeps recipes that were already there', () => {
      const existing = {...emptyState(), recipes: [recipe(1, 'Existing')]};

      const state = reducer(existing, fulfilled(importRecipe, recipe(2, 'Imported')));

      expect(state.recipes.map((r) => r.title)).toEqual(['Existing', 'Imported']);
    });

    it('persists the recipes for offline use, not the groups', () => {
      reducer(emptyState(), fulfilled(importRecipe, recipe(1, 'Imported cake')));

      expect(AppPersistence.storeRecipesOffline).toHaveBeenCalledOnce();
      expect(AppPersistence.storeRecipeGroupsOffline).not.toHaveBeenCalled();
    });

    it('settles the pending request', () => {
      const pending = {...emptyState(), pendingRequests: 1};

      expect(reducer(pending, fulfilled(importRecipe, recipe(1, 'Imported'))).pendingRequests).toBe(0);
      expect(reducer(pending, {type: importRecipe.rejected.type}).pendingRequests).toBe(0);
    });
  });

  describe('createRecipe', () => {
    it('adds the created recipe to the recipes', () => {
      const created = recipe(1, 'Created');

      expect(reducer(emptyState(), fulfilled(createRecipe, created)).recipes).toEqual([created]);
    });
  });

  describe('createRecipeGroup', () => {
    it('adds the created group to the groups', () => {
      const created = group(7, 'Desserts');

      const state = reducer(emptyState(), fulfilled(createRecipeGroup, created));

      expect(state.recipeGroups).toEqual([created]);
      expect(state.recipes).toEqual([]);
    });
  });

  describe('updateRecipe', () => {
    // What the multi selection dispatches when moving recipes into a group
    it('replaces the recipe that was updated', () => {
      const desserts = group(7, 'Desserts');
      const existing = {...emptyState(), recipes: [recipe(1, 'Cake'), recipe(2, 'Pie')]};
      const moved = recipe(1, 'Cake', [desserts]);

      const state = reducer(existing, fulfilled(updateRecipe, moved, moved));

      expect(state.recipes.find((r) => r.id === 1)?.recipeGroups).toEqual([desserts]);
      expect(state.recipes.find((r) => r.id === 2)?.recipeGroups).toEqual([]);
    });

    it('leaves the recipes alone when the updated one is unknown', () => {
      const existing = {...emptyState(), recipes: [recipe(1, 'Cake')]};
      const unknown = recipe(99, 'Ghost');

      expect(reducer(existing, fulfilled(updateRecipe, unknown, unknown)).recipes).toHaveLength(1);
    });
  });
});
