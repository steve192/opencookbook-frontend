import {getPathFromState, getStateFromPath} from '@react-navigation/core';
import {describe, expect, it} from 'vitest';
import {LINKING_SCREENS} from './linking';

const config = {screens: LINKING_SCREENS} as Parameters<typeof getStateFromPath>[1];

// The screen an address opens, found wherever it is nested.
const routeOf = (path: string) => {
  let route = getStateFromPath(path, config)?.routes[0];
  while (route?.state) {
    route = route.state.routes[route.state.routes.length - 1] as typeof route;
  }
  return route;
};

const paramsOf = (path: string): Record<string, unknown> | undefined =>
  routeOf(path)?.params as Record<string, unknown> | undefined;

// Where the app goes when it navigates to a screen, as the address bar shows it.
const pathOf = (name: string, params: object): string =>
  getPathFromState({routes: [{name: 'default', state: {routes: [{name, params}]}}]} as never, config);

describe('linking', () => {
  it.each([
    ['RecipeScreen', {recipeId: 3}],
    ['RecipeWizardScreen', {recipeId: 3, editing: true}],
    ['RecipeWizardScreen', {editing: false, hasDraft: true}],
    ['RecipeGroupEditScreen', {recipeGroupId: 7, editing: false}],
    ['WeekplanWizardScreen', {weekOffset: -1, householdId: 'h1'}],
    ['PlanDraftScreen', {draftId: 12}],
    ['GuidedCookingScreen', {recipeId: 3, scaledServings: 2, initialStep: 1}],
    ['ShoppingImportScreen', {kind: 'recipe', recipeId: 3, servings: 4}],
  ])('reopens %s with %o after a reload', (name, params) => {
    expect(paramsOf(pathOf(name, params))).toEqual(params);
  });

  it('opens a recipe from a typed address with its id as a number', () => {
    expect(paramsOf('/recipe?recipeId=3')).toEqual({recipeId: 3});
  });

  it('opens an invitation with its token', () => {
    expect(paramsOf('/invite/Xy_9-abc')).toEqual({token: 'Xy_9-abc'});
  });

  it('reads a group of the recipe list as a number', () => {
    expect(paramsOf('/myRecipes?shownRecipeGroupId=5')).toEqual({shownRecipeGroupId: 5});
  });

  it('opens the import for something shared on Android', () => {
    // What React Navigation leaves of cookpal://expo-sharing once the scheme is gone.
    expect(routeOf('expo-sharing')?.name).toBe('ImportScreen');
  });

  it('opens the import with what the web share target hands over', () => {
    const path = '/import?title=Apple%20Pie&text=&url=https%3A%2F%2Fexample.com%2Fpie';

    expect(routeOf(path)?.name).toBe('ImportScreen');
    expect(paramsOf(path)).toEqual({title: 'Apple Pie', text: '', url: 'https://example.com/pie'});
  });

  it('keeps the import at its own address', () => {
    expect(pathOf('ImportScreen', {})).toBe('/import');
  });
});
