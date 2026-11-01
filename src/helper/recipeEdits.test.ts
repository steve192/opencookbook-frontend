import {describe, expect, it} from 'vitest';
import {Recipe} from '../api/types/recipes';
import {
  amountText,
  EditedRecipe,
  emptyRecipe,
  forSaving,
  ingredientText,
  unnamedIngredientTexts,
  unreadIngredientTexts,
  withDiet,
  withGroup,
  withImageAdded,
  withImageRemoved,
  withImages,
  withIngredientAdded,
  withIngredientChanged,
  withIngredientMoved,
  withIngredientRemoved,
  withIngredientsRead,
  withIngredientWritten,
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

const use = (name: string) => ({ingredient: {name}, amount: null, unit: '', note: ''});
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

    it('adds a blank one in between', () => {
      expect(names(withIngredientAdded(twoIngredients, 1))).toEqual(['Mehl', '', 'Zucker']);
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

  describe('ingredients as text', () => {
    const butter = {ingredient: {name: 'Butter'}, amount: 2, unit: 'EL', note: ''};
    const written = (text: string): EditedRecipe => withIngredientWritten(recipe({neededIngredients: [butter]}), 0, text);

    it('shows a row by its parts until something is typed', () => {
      expect(ingredientText(butter, 'de')).toBe('2 EL Butter');
      expect(ingredientText({ingredient: {name: 'Salz'}, amount: null, unit: '', note: ''}, 'de')).toBe('Salz');
      expect(ingredientText({...butter, note: 'weich'}, 'de')).toBe('2 EL Butter, weich');
    });

    it('writes the amount of a row the way the language does', () => {
      expect(ingredientText({...butter, amount: 1.5}, 'de')).toBe('1,5 EL Butter');
      expect(ingredientText({...butter, amount: 1.5}, 'en')).toBe('1.5 EL Butter');
    });

    it('shows what was typed, and keeps the last read parts until it is read', () => {
      const row = written('2 EL Butter, weich').neededIngredients[0];

      expect(ingredientText(row, 'de')).toBe('2 EL Butter, weich');
      expect(row).toMatchObject({...butter, written: {text: '2 EL Butter, weich', read: false}});
    });

    it('takes what the server read for that text, note included', () => {
      const read = withIngredientsRead(written('3 Eier, Größe M'),
          new Map([['3 Eier, Größe M', {ingredient: {name: 'Eier'}, amount: 3, unit: '', note: 'Größe M'}]]));

      expect(read.neededIngredients[0]).toEqual({
        ingredient: {name: 'Eier'}, amount: 3, unit: '', note: 'Größe M', written: {text: '3 Eier, Größe M', read: true},
      });
      expect(unreadIngredientTexts(read)).toEqual([]);
    });

    it('ignores a reading of a text the row no longer has', () => {
      const typedOn = withIngredientWritten(written('3 Eie'), 0, '3 Eier');
      const read = withIngredientsRead(typedOn, new Map([['3 Eie', {ingredient: {name: 'Eie'}, amount: 3, unit: '', note: ''}]]));

      expect(read.neededIngredients[0]).toMatchObject({...butter, written: {text: '3 Eier', read: false}});
    });

    it('leaves a row without parts where the text names no ingredient', () => {
      const read = withIngredientsRead(written('200 g'), new Map([['200 g', null]]));

      expect(read.neededIngredients[0]).toEqual(
          {ingredient: {name: ''}, amount: null, unit: '', note: '', written: {text: '200 g', read: true}});
      expect(forSaving(read).neededIngredients).toEqual([]);
      expect(unnamedIngredientTexts(read)).toEqual(['200 g']);
    });

    it('finds no unnamed row before the text is read', () => {
      expect(unnamedIngredientTexts(written('200 g'))).toEqual([]);
    });

    it('turns a row typed empty into a blank one', () => {
      expect(written(' ').neededIngredients[0]).toEqual({ingredient: {name: ''}, amount: null, unit: '', note: ''});
    });

    it('asks for each unread text once', () => {
      const twice = withIngredientWritten(withIngredientAdded(written('Salz')), 1, 'Salz');
      expect(unreadIngredientTexts(twice)).toEqual(['Salz']);
    });

    it('writes no amount for none or 0', () => {
      expect(amountText(null)).toBe('');
      expect(amountText(0)).toBe('');
      expect(amountText(1.5)).toBe('1.5');
    });

    // "1/3 TL" arrives as 0.33333334
    it('writes an amount without the noise of its float', () => {
      expect(amountText(0.33333334)).toBe('0.333');
      expect(amountText(1000)).toBe('1000');
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
    const untouched = {ingredient: {name: ' '}, amount: null, unit: '', note: ''};
    const salt = {ingredient: {name: 'Salz'}, amount: null, unit: '', note: ''};
    expect(forSaving(recipe({neededIngredients: [untouched, salt]})).neededIngredients).toEqual([salt]);
  });

  it('keeps a line that has an amount or a note but no name yet, so the server can refuse it', () => {
    const amountOnly = {ingredient: {name: ''}, amount: 2, unit: 'EL', note: ''};
    const noteOnly = {ingredient: {name: ''}, amount: null, unit: '', note: 'weich'};
    expect(forSaving(recipe({neededIngredients: [amountOnly, noteOnly]})).neededIngredients).toEqual([amountOnly, noteOnly]);
  });

  it('sends only the parts of what was typed', () => {
    const butter = {ingredient: {name: 'Butter'}, amount: 2, unit: 'EL', note: 'weich'};
    const typed = {...butter, written: {text: '2 EL Butter, weich', read: true}};
    expect(forSaving(recipe({neededIngredients: [typed]})).neededIngredients).toEqual([butter]);
  });

  it('changes nothing else', () => {
    expect(forSaving(recipe({title: 'Pizza'})).title).toBe('Pizza');
  });
});
