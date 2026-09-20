import {describe, expect, it} from 'vitest';
import {Recipe} from '../dao/RestAPI';
import {
  emptyRecipe,
  forSaving,
  withDiet,
  withGroup,
  withImageAdded,
  withImageRemoved,
  withImages,
  withIngredientAdded,
  withIngredientChanged,
  withIngredientMoved,
  withIngredientRemoved,
  withNumberField,
  withStepAdded,
  withStepChanged,
  withStepMoved,
  withStepRemoved,
  withSuitToggled,
  withTitle,
} from './recipeEdits';

const recipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  ...emptyRecipe(),
  title: 'Lasagne',
  neededIngredients: [],
  preparationSteps: [],
  ...overrides,
});

const use = (name: string) => ({ingredient: {name}, amount: null, unit: ''});
const names = (result: Recipe) => result.neededIngredients.map((i) => i.ingredient.name);

describe('emptyRecipe', () => {
  it('offers one blank ingredient and step to start on', () => {
    expect(emptyRecipe().neededIngredients).toHaveLength(1);
    expect(emptyRecipe().preparationSteps).toEqual(['']);
  });

  // A blank group used to be seeded here and stripped out again on save
  it('belongs to no group', () => {
    expect(emptyRecipe().recipeGroups).toEqual([]);
  });
});

describe('editing a recipe', () => {
  it('sets the title', () => {
    expect(withTitle(recipe(), 'Pizza').title).toBe('Pizza');
  });

  it('sets and clears the diet', () => {
    expect(withDiet(recipe(), 'VEGAN').recipeType).toBe('VEGAN');
    expect(withDiet(recipe({recipeType: 'VEGAN'}), null).recipeType).toBeNull();
  });

  // Several are allowed: most dishes are honestly both lunch and dinner
  it('turns a meal on and off again', () => {
    const lunch = withSuitToggled(recipe(), 'LUNCH');

    expect(lunch.mealTypes).toEqual(['LUNCH']);
    expect(withSuitToggled(lunch, 'DINNER').mealTypes).toEqual(['LUNCH', 'DINNER']);
    expect(withSuitToggled(lunch, 'LUNCH').mealTypes).toEqual([]);
  });

  // A sauce is not a dinner, so the two exclude each other
  it('marks a side or component, which suits no meal', () => {
    const sauce = withSuitToggled(withSuitToggled(recipe(), 'DINNER'), 'COMPONENT');

    expect(sauce).toMatchObject({mealTypes: [], dishRole: 'COMPONENT'});
    expect(withSuitToggled(sauce, 'COMPONENT').dishRole).toBeNull();
    expect(withSuitToggled(sauce, 'LUNCH')).toMatchObject({mealTypes: ['LUNCH'], dishRole: null});
  });

  it('sets a number field and clears it again', () => {
    expect(withNumberField(recipe(), 'totalTime', '35').totalTime).toBe(35);
    expect(withNumberField(recipe({totalTime: 35}), 'totalTime', '').totalTime).toBeUndefined();
  });

  it('puts the recipe in a group, and takes it out again', () => {
    const group = {title: 'Desserts', type: 'RecipeGroup' as const};
    expect(withGroup(recipe(), group).recipeGroups).toEqual([group]);
    expect(withGroup(recipe({recipeGroups: [group]}), undefined).recipeGroups).toEqual([]);
  });

  describe('ingredients', () => {
    const twoIngredients = recipe({neededIngredients: [use('Mehl'), use('Zucker')]});

    it('adds a blank one at the end', () => {
      expect(withIngredientAdded(twoIngredients).neededIngredients).toHaveLength(3);
    });

    it('replaces one in place', () => {
      expect(names(withIngredientChanged(twoIngredients, 0, use('Butter')))).toEqual(['Butter', 'Zucker']);
    });

    it('removes one', () => {
      expect(names(withIngredientRemoved(twoIngredients, 0))).toEqual(['Zucker']);
    });

    it('reorders them', () => {
      expect(names(withIngredientMoved(twoIngredients, 1, 0))).toEqual(['Zucker', 'Mehl']);
    });

    it('leaves the recipe it was given untouched', () => {
      withIngredientRemoved(twoIngredients, 0);
      expect(names(twoIngredients)).toEqual(['Mehl', 'Zucker']);
    });
  });

  describe('steps', () => {
    const twoSteps = recipe({preparationSteps: ['first', 'second']});

    it('adds a blank one at the end', () => {
      expect(withStepAdded(twoSteps).preparationSteps).toEqual(['first', 'second', '']);
    });

    it('rewrites one in place', () => {
      expect(withStepChanged(twoSteps, 1, 'changed').preparationSteps).toEqual(['first', 'changed']);
    });

    it('removes one', () => {
      expect(withStepRemoved(twoSteps, 0).preparationSteps).toEqual(['second']);
    });

    it('reorders them', () => {
      expect(withStepMoved(twoSteps, 0, 1).preparationSteps).toEqual(['second', 'first']);
    });

    it('leaves the recipe it was given untouched', () => {
      withStepMoved(twoSteps, 0, 1);
      expect(twoSteps.preparationSteps).toEqual(['first', 'second']);
    });
  });

  describe('images', () => {
    const withPhotos = recipe({images: [{uuid: 'a'}, {uuid: 'b'}]});

    it('adds one at the end', () => {
      expect(withImageAdded(withPhotos, 'c').images.map((i) => i.uuid)).toEqual(['a', 'b', 'c']);
    });

    it('unlinks one by its id', () => {
      expect(withImageRemoved(withPhotos, 'a').images.map((i) => i.uuid)).toEqual(['b']);
    });

    it('takes a whole new order', () => {
      expect(withImages(withPhotos, [{uuid: 'b'}, {uuid: 'a'}]).images.map((i) => i.uuid)).toEqual(['b', 'a']);
    });
  });
});

describe('forSaving', () => {
  // The group picker leaves a blank entry behind, which would be stored as a nameless group
  it('drops a group that was never picked', () => {
    const withBlank = recipe({recipeGroups: [{title: '', type: 'RecipeGroup'}]});
    expect(forSaving(withBlank).recipeGroups).toEqual([]);
  });

  it('keeps a real group', () => {
    const group = {title: 'Desserts', type: 'RecipeGroup' as const};
    expect(forSaving(recipe({recipeGroups: [group]})).recipeGroups).toEqual([group]);
  });

  // The editor always offers a blank ingredient line to type into
  it('drops an ingredient line that was never filled in', () => {
    const untouched = {ingredient: {name: ' '}, amount: null, unit: ''};
    const salt = {ingredient: {name: 'Salz'}, amount: null, unit: ''};
    expect(forSaving(recipe({neededIngredients: [untouched, salt]})).neededIngredients).toEqual([salt]);
  });

  it('keeps a line that has an amount but no name yet, so the server can refuse it', () => {
    const amountOnly = {ingredient: {name: ''}, amount: 2, unit: 'EL'};
    expect(forSaving(recipe({neededIngredients: [amountOnly]})).neededIngredients).toEqual([amountOnly]);
  });

  it('changes nothing else', () => {
    expect(forSaving(recipe({title: 'Pizza'})).title).toBe('Pizza');
  });
});
