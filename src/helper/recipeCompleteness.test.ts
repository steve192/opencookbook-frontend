import {describe, expect, it} from 'vitest';
import {Recipe} from '../dao/RestAPI';
import {missesPlanningDetails, missingDetails} from './recipeCompleteness';

const recipe = (fields: Partial<Recipe>) => ({title: 'x', ...fields} as Recipe);

describe('missingDetails', () => {
  it('lists what an import left unknown', () => {
    expect(missingDetails(recipe({}))).toEqual(['servings', 'time', 'suits', 'diet']);
  });

  it('counts either time, and either meals or a role', () => {
    expect(missingDetails(recipe({servings: 2, preparationTime: 20, dishRole: 'SIDE', recipeType: 'VEGAN'}))).toEqual([]);
  });
});

describe('missesPlanningDetails', () => {
  it('is about what the planning section asks, not servings or time', () => {
    expect(missesPlanningDetails(['servings', 'time'])).toBe(false);
    expect(missesPlanningDetails(['diet'])).toBe(true);
  });
});
