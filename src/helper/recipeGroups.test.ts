import {describe, expect, it} from 'vitest';
import type {Recipe, RecipeGroup} from '../dao/RestAPI';
import {
  NO_RECIPE_GROUP_KEY,
  findRecipeGroupByOption,
  moveRecipesToGroup,
  toRecipeGroupOptions,
} from './recipeGroups';

const group = (id: number | undefined, title: string): RecipeGroup => ({id, title, type: 'RecipeGroup'});

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

const DESSERTS = group(7, 'Desserts');
const MAINS = group(8, 'Mains');

describe('toRecipeGroupOptions', () => {
  it('offers removing the group before the groups themselves', () => {
    expect(toRecipeGroupOptions([DESSERTS], 'No group')).toEqual([
      {key: NO_RECIPE_GROUP_KEY, value: 'No group'},
      {key: '7', value: 'Desserts'},
    ]);
  });

  it('offers the removal entry even without any group', () => {
    expect(toRecipeGroupOptions([], 'No group')).toEqual([{key: NO_RECIPE_GROUP_KEY, value: 'No group'}]);
  });

  it('leaves out groups that cannot be referenced by id yet', () => {
    const options = toRecipeGroupOptions([group(undefined, 'Not saved yet'), DESSERTS], 'No group');

    expect(options.map((option) => option.value)).toEqual(['No group', 'Desserts']);
  });
});

describe('findRecipeGroupByOption', () => {
  it('resolves an entry back to its group', () => {
    expect(findRecipeGroupByOption([DESSERTS, MAINS], {key: '8', value: 'Mains'})).toBe(MAINS);
  });

  it('resolves the removal entry to no group', () => {
    expect(findRecipeGroupByOption([DESSERTS], {key: NO_RECIPE_GROUP_KEY, value: 'No group'})).toBeUndefined();
  });

  it('resolves an unknown entry to no group', () => {
    expect(findRecipeGroupByOption([DESSERTS], {key: '999', value: 'Gone'})).toBeUndefined();
  });
});

describe('moveRecipesToGroup', () => {
  it('puts every recipe into the target group', () => {
    const moved = moveRecipesToGroup([recipe(1, 'Cake'), recipe(2, 'Pie')], DESSERTS);

    expect(moved.map((r) => r.recipeGroups)).toEqual([[DESSERTS], [DESSERTS]]);
  });

  it('replaces the group a recipe was in before', () => {
    const [moved] = moveRecipesToGroup([recipe(1, 'Cake', [MAINS])], DESSERTS);

    expect(moved.recipeGroups).toEqual([DESSERTS]);
  });

  it('takes recipes out of every group when there is no target', () => {
    const [moved] = moveRecipesToGroup([recipe(1, 'Cake', [DESSERTS])], undefined);

    expect(moved.recipeGroups).toEqual([]);
  });

  it('keeps the rest of the recipe intact', () => {
    const original = recipe(1, 'Cake');

    const [moved] = moveRecipesToGroup([original], DESSERTS);

    expect(moved).toEqual({...original, recipeGroups: [DESSERTS]});
  });

  it('does not mutate the given recipes', () => {
    const original = recipe(1, 'Cake', [MAINS]);

    moveRecipesToGroup([original], DESSERTS);

    expect(original.recipeGroups).toEqual([MAINS]);
  });
});
