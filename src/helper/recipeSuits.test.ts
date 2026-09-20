import {TFunction} from 'i18next';
import {describe, expect, it} from 'vitest';
import {Recipe} from '../dao/RestAPI';
import {planningSummary, suitsOf} from './recipeSuits';

const t = ((key: string) => key) as unknown as TFunction;
const recipe = (fields: Partial<Recipe>) => ({title: 'x', ...fields} as Recipe);

describe('suitsOf', () => {
  it('reads the meals, or the role instead of a dish', () => {
    expect(suitsOf(recipe({mealTypes: ['DINNER', 'LUNCH']}))).toEqual(['LUNCH', 'DINNER']);
    expect(suitsOf(recipe({dishRole: 'SIDE'}))).toEqual(['SIDE']);
    expect(suitsOf(recipe({}))).toEqual([]);
  });
});

describe('planningSummary', () => {
  it('puts the diet and what it suits in one line, and nothing while neither is known', () => {
    expect(planningSummary(t, recipe({recipeType: 'VEGAN', dishRole: 'COMPONENT'})))
        .toBe('screens.editRecipe.dietVegan · screens.editRecipe.dishRoleComponent');
    expect(planningSummary(t, recipe({}))).toBeUndefined();
  });
});
