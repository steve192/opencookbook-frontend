import {describe, expect, it} from 'vitest';
import {PreviewMeal} from '../../dao/RestAPI';
import {SheetLine} from './importLines';
import {importRequest, initialChoices} from './importSheet';

const meal = (date: string | null, defaultServings = 2): PreviewMeal => ({
  entryId: date ?? 'recipe', date, title: 'Meal', recipeId: 1, spontaneous: false, recipeServings: 4, defaultServings,
  lines: [],
});

const line = (key: string, staple = false): SheetLine =>
  ({key, name: key, spec: '1', aisle: 'OTHER', icon: null, staple, sources: []});

describe('importSheet', () => {
  it('leaves out what was eaten earlier this week', () => {
    const choices = initialChoices([meal('2026-10-05'), meal('2026-10-07')], '2026-10-06', {onlyFromToday: true});
    expect(choices.map((choice) => choice.included)).toEqual([false, true]);
  });

  it('takes the servings the recipe screen was showing', () => {
    const [choice] = initialChoices([meal(null)], '2026-10-06', {onlyFromToday: false, servings: 6});
    expect(choice.servings).toBe(6);
  });

  it('sends only what is ticked, and says what was offered', () => {
    const request = importRequest([line('Mehl'), line('Salz', true), line('Öl')], {'Öl': false});
    expect(request.lines.map((sent) => sent.name)).toEqual(['Mehl']);
    expect(request.shown).toEqual([
      {name: 'Mehl', ticked: true}, {name: 'Salz', ticked: false}, {name: 'Öl', ticked: false}]);
  });
});
