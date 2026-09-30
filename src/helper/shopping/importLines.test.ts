import {describe, expect, it} from 'vitest';
import {PreviewLine, PreviewMeal} from '../../api/types/shopping';
import {bringLine, MealChoice, sheetLines} from './importLines';

const UNITS = new Set(['g', 'kg', 'ml', 'l']);

const line = (name: string, amount: number | null, unit: string, mergeUnit: string, mergeFactor = 1,
    staple = false): PreviewLine => ({
  name, nameKey: name.toLowerCase(), amount, unit, mergeUnit, mergeFactor, aisle: 'BAKING', icon: null, staple,
});

const meal = (title: string, recipeServings: number, lines: PreviewLine[], date = '2026-10-05'): PreviewMeal => ({
  entryId: title, date, title, recipeId: lines.length ? 1 : null, spontaneous: lines.length === 0,
  recipeServings, defaultServings: recipeServings, leftoverOf: null, lines,
});

const choose = (preview: PreviewMeal, servings = preview.recipeServings, typedItems: string[] = []): MealChoice =>
  ({meal: preview, included: true, servings, typedItems});

const specs = (choices: MealChoice[]) => sheetLines(choices, 'en', UNITS).map((sheetLine) => [sheetLine.name, sheetLine.spec]);

describe('sheetLines', () => {
  it('scales each meal to the servings it is shopped for', () => {
    expect(specs([choose(meal('Pancakes', 4, [line('Flour', 500, 'g', 'g')]), 2)])).toEqual([['Flour', '250 g']]);
  });

  it('adds up metric amounts and names the larger unit from a thousand up', () => {
    expect(specs([
      choose(meal('Pancakes', 2, [line('Flour', 500, 'g', 'g')])),
      choose(meal('Bread', 2, [line('Flour', 1, 'kg', 'g', 1000)])),
    ])).toEqual([['Flour', '1.5 kg']]);
  });

  it('keeps the unit the recipes agree on', () => {
    expect(specs([
      choose(meal('Soup', 2, [line('Oil', 2, 'EL', 'tablespoon')])),
      choose(meal('Salad', 2, [line('Oil', 1, 'EL', 'tablespoon')])),
    ])).toEqual([['Oil', '3 EL']]);
  });

  it('never adds up units that do not convert', () => {
    expect(specs([
      choose(meal('Soup', 2, [line('Oil', 2, 'EL', 'tablespoon')])),
      choose(meal('Salad', 2, [line('Oil', 100, 'ml', 'ml')])),
    ])).toEqual([['Oil', '2 EL'], ['Oil', '100 ml']]);
  });

  it('lets a line without an amount join the food it names', () => {
    expect(specs([
      choose(meal('Soup', 2, [line('Salt', null, '', '')])),
      choose(meal('Bread', 2, [line('Salt', 10, 'g', 'g')])),
    ])).toEqual([['Salt', '10 g']]);
  });

  it('turns what was typed for a meal without a recipe into lines', () => {
    expect(specs([choose(meal('Pizza night', 0, []), 0, ['2 pizza doughs', 'Mozzarella'])]))
        .toEqual([['pizza doughs', '2'], ['Mozzarella', null]]);
  });

  it('leaves out meals that are not included', () => {
    const skipped = {...choose(meal('Pancakes', 2, [line('Flour', 500, 'g', 'g')])), included: false};
    expect(sheetLines([skipped], 'en', UNITS)).toEqual([]);
  });

  it('remembers every meal a line is for, once each', () => {
    const [flour] = sheetLines([
      choose(meal('Pancakes', 2, [line('Flour', 200, 'g', 'g'), line('Flour', 100, 'g', 'g')], '2026-10-05')),
      choose(meal('Bread', 2, [line('Flour', 300, 'g', 'g')], '2026-10-06')),
    ], 'en', UNITS);
    expect(flour.sources).toEqual([
      {title: 'Pancakes', planDate: '2026-10-05'}, {title: 'Bread', planDate: '2026-10-06'}]);
  });

  it('marks a line as a staple when any recipe line was one', () => {
    const [salt] = sheetLines([choose(meal('Soup', 2, [line('Salt', 1, 'g', 'g', 1, true)]))], 'en', UNITS);
    expect(salt.staple).toBe(true);
  });

  it('writes a line the way Bring reads it', () => {
    const [flour] = sheetLines([choose(meal('Pancakes', 2, [line('Flour', 500, 'g', 'g')]))], 'en', UNITS);
    expect(bringLine(flour)).toBe('500 g Flour');
  });
});
