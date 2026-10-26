import {describe, expect, it} from 'vitest';
import {PreviewMeal, ShoppingItem, ShoppingRegular} from '../../api/types/shopping';
import {SheetLine} from './importLines';
import {dueLines, importRequest, initialChoices, isShoppedFor} from './importSheet';

const meal = (date: string | null, defaultServings = 2): PreviewMeal => ({
  entryId: date ?? 'recipe', date, title: 'Meal', recipeId: 1, spontaneous: false, recipeServings: 4, defaultServings,
  leftoverOf: null,
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

describe('isShoppedFor', () => {
  it('is a recipe that is neither leftovers nor a meal without a recipe', () => {
    expect(isShoppedFor(meal('2026-10-05'))).toBe(true);
    expect(isShoppedFor({...meal('2026-10-06'), leftoverOf: '2026-10-05'})).toBe(false);
    expect(isShoppedFor({...meal('2026-10-06'), spontaneous: true})).toBe(false);
  });

  it('offers what the target list buys regularly and is due by the end of the week', () => {
    const now = new Date('2026-10-07T12:00:00Z');
    const window = (from: string, until: string) => ({from, until});
    const regular = (name: string, windows: ShoppingRegular['windows'], extra: Partial<ShoppingRegular> = {}):
      ShoppingRegular => ({id: 1, name, aisle: 'DAIRY_EGGS', icon: null, everyDays: 7, lastBoughtAt: null, muted: false,
      windows, ...extra});
    const regulars = [
      regular('Milch', [window('2026-10-10T08:00:00Z', '2026-10-13T20:00:00Z')]),
      regular('Butter', [window('2026-10-20T08:00:00Z', '2026-10-23T20:00:00Z')]),
      regular('Eier', [window('2026-10-06T08:00:00Z', '2026-10-09T20:00:00Z')]),
      regular('Quark', [window('2026-10-01T08:00:00Z', '2026-10-04T20:00:00Z')]),
      regular('Joghurt', [window('2026-10-09T08:00:00Z', '2026-10-12T20:00:00Z')]),
      regular('Mehl', [window('2026-10-09T08:00:00Z', '2026-10-12T20:00:00Z')]),
      regular('Käse', [], {muted: true, everyDays: null}),
    ];
    const items = [{name: 'Joghurt', status: 'ACTIVE'} as ShoppingItem];

    const due = dueLines(regulars, items, [line('Mehl')], now, '2026-10-11');

    expect(due.map((each) => each.name)).toEqual(['Eier', 'Milch']);
    expect(due[0]).toMatchObject({key: 'due:eier', everyDays: 7, staple: false, sources: []});
  });
});
