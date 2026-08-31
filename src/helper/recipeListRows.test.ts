import {describe, expect, it} from 'vitest';
import {Recipe, RecipeGroup, RecipeImage} from '../dao/RestAPI';
import {ListRow, listRowHasChanged, toRecipeGroupRow, toRecipeRow} from './recipeListRows';

const image = (uuid: string): RecipeImage => ({uuid} as RecipeImage);

const group = (id: number, title = 'Desserts'): RecipeGroup =>
  ({id, title, type: 'RecipeGroup'});

const recipe = (id: number, options: {images?: string[], groups?: RecipeGroup[], title?: string} = {}): Recipe => ({
  id,
  title: options.title ?? `Recipe ${id}`,
  neededIngredients: [],
  preparationSteps: [],
  images: (options.images ?? []).map(image),
  servings: 1,
  recipeGroups: options.groups ?? [],
  type: 'Recipe',
});

describe('toRecipeRow', () => {
  it('takes the first image as the cover', () => {
    expect(toRecipeRow(recipe(1, {images: ['a', 'b']})).coverImageUuid).toBe('a');
  });

  it('has no cover when the recipe has no images', () => {
    expect(toRecipeRow(recipe(1)).coverImageUuid).toBeUndefined();
  });

  it('keeps the recipe itself intact', () => {
    expect(toRecipeRow(recipe(7, {title: 'Lasagne'}))).toMatchObject({id: 7, title: 'Lasagne', type: 'Recipe'});
  });
});

describe('toRecipeGroupRow', () => {
  const desserts = group(3);

  it('counts only the recipes of that group', () => {
    const row = toRecipeGroupRow(desserts, [
      recipe(1, {groups: [desserts]}),
      recipe(2),
      recipe(3, {groups: [desserts]}),
    ]);
    expect(row.recipeCount).toBe(2);
  });

  it('is empty when no recipe belongs to the group', () => {
    const row = toRecipeGroupRow(desserts, [recipe(1), recipe(2)]);
    expect(row.recipeCount).toBe(0);
    expect(row.coverImageUuid).toBeUndefined();
  });

  it('covers itself with the first image it can find in the group', () => {
    const row = toRecipeGroupRow(desserts, [
      recipe(1, {groups: [desserts]}),
      recipe(2, {groups: [desserts], images: ['cover']}),
    ]);
    expect(row.coverImageUuid).toBe('cover');
  });

  it('ignores images of recipes outside the group', () => {
    const row = toRecipeGroupRow(desserts, [recipe(1, {images: ['elsewhere']})]);
    expect(row.coverImageUuid).toBeUndefined();
  });

  it('keeps the group itself intact', () => {
    expect(toRecipeGroupRow(desserts, [])).toMatchObject({id: 3, title: 'Desserts', type: 'RecipeGroup'});
  });
});

describe('listRowHasChanged', () => {
  const desserts = group(3);
  const inGroup = recipe(1, {groups: [desserts], images: ['cover']});

  /**
   * The groups and the recipes are fetched separately. A group therefore renders once
   * before the recipes it covers exist, and the list has to be told that the row is now
   * a different one - otherwise the tile keeps its empty cover until scrolling out of the
   * viewport recycles the row, which is exactly what it used to do.
   */
  it('reports a group as changed once the recipes behind it arrive', () => {
    const before = toRecipeGroupRow(desserts, []);
    const after = toRecipeGroupRow(desserts, [inGroup]);
    expect(listRowHasChanged(before, after)).toBe(true);
  });

  it('reports a recipe as changed when its picture changes', () => {
    expect(listRowHasChanged(
        toRecipeRow(recipe(1)),
        toRecipeRow(recipe(1, {images: ['new']})),
    )).toBe(true);
  });

  it('reports a group as changed when a recipe is added to it', () => {
    const before = toRecipeGroupRow(desserts, [inGroup]);
    const after = toRecipeGroupRow(desserts, [inGroup, recipe(2, {groups: [desserts]})]);
    expect(listRowHasChanged(before, after)).toBe(true);
  });

  it('reports a renamed row as changed', () => {
    expect(listRowHasChanged(
        toRecipeRow(recipe(1, {title: 'before'})),
        toRecipeRow(recipe(1, {title: 'after'})),
    )).toBe(true);
  });

  // Ids are handed out per kind, so a group and a recipe can share one
  it('keeps a group and a recipe of the same id apart', () => {
    expect(listRowHasChanged(
        toRecipeGroupRow(group(1, 'same name'), []),
        toRecipeRow(recipe(1, {title: 'same name'})),
    )).toBe(true);
  });

  it('reports an unchanged row as unchanged', () => {
    const row = toRecipeGroupRow(desserts, [inGroup]);
    expect(listRowHasChanged(row, toRecipeGroupRow(desserts, [inGroup]))).toBe(false);
  });

  it('reports an unchanged recipe as unchanged', () => {
    expect(listRowHasChanged(toRecipeRow(inGroup), toRecipeRow(inGroup))).toBe(false);
  });

  // The list is led by an empty item that offsets the rows below the search field
  it('leaves the leading spacer row alone', () => {
    expect(listRowHasChanged({} as ListRow, {} as ListRow)).toBe(false);
  });
});
