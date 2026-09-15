import {describe, expect, it} from 'vitest';
import {NutritionLine, NutritionSummary, Nutrients} from '../dao/RestAPI';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import {canWeighPieces, formatEstimate, formatNutrient, lineNoteKeys, linesWarningFirst, NUTRIENT_ROWS, nutritionColumns,
  scaleNutrients} from './nutrition';

const values = (energyKcal: number | null, fat: number | null = null): Nutrients => ({
  energyKcal, energyKj: null, fat, saturatedFat: null, carbohydrates: null, sugar: null, fibre: null, protein: null, salt: null,
});

const line = (overrides: Partial<NutritionLine>): NutritionLine => ({
  ingredientId: 1, ingredientName: 'Mehl', amount: 100, unit: 'g', grams: 100, values: values(350), food: null,
  status: 'RESOLVED', flags: [], ownPortion: false, warns: false, ...overrides,
});

describe('formatNutrient', () => {
  it('shows energy in whole kcal', () => {
    expect(formatNutrient(523.4, 'kcal', 'en')).toBe('523 kcal');
  });

  it('shows small gram amounts to a tenth and larger ones whole', () => {
    expect(formatNutrient(2.345, 'g', 'en')).toBe('2.3 g');
    expect(formatNutrient(12.6, 'g', 'en')).toBe('13 g');
  });

  it('writes the number in the reader\'s language', () => {
    expect(formatNutrient(2.5, 'g', 'de')).toBe('2,5 g');
  });

  it('shows a dash for a value nobody knows', () => {
    expect(formatNutrient(null, 'g', 'en')).toBe('–');
  });
});

describe('formatEstimate', () => {
  it('marks a known amount as approximate', () => {
    expect(formatEstimate(12, 'g', 'en')).toBe('≈ 12 g');
  });

  it('does not call an unknown amount approximate', () => {
    expect(formatEstimate(null, 'g', 'en')).toBe('–');
  });
});

describe('scaleNutrients', () => {
  it('multiplies what is known and leaves unknown values unknown', () => {
    expect(scaleNutrients(values(100, null), 3)).toEqual(values(300, null));
  });
});

describe('nutritionColumns', () => {
  const summary = (basis: NutritionSummary['basis']): NutritionSummary =>
    ({basis, status: 'COMPLETE', values: values(400, 10), warningCount: 0});

  it('shows a recipe with servings per serving and in total for the servings it is scaled to', () => {
    expect(nutritionColumns(summary('SERVING'), 3)).toEqual({
      perServing: values(400, 10),
      total: values(1200, 30),
      totalServings: 3,
    });
  });

  // Its values are for the whole recipe already; there is nothing to divide or scale them by
  it('shows a recipe without servings in total only', () => {
    expect(nutritionColumns(summary('RECIPE'), 1)).toEqual({total: values(400, 10)});
  });
});

describe('linesWarningFirst', () => {
  it('lists warning lines first and otherwise keeps the recipe\'s order', () => {
    const flour = line({ingredientName: 'Mehl'});
    const oil = line({ingredientName: 'Öl', warns: true});
    const salt = line({ingredientName: 'Salz'});
    const magic = line({ingredientName: 'Zauberpulver', warns: true});
    expect(linesWarningFirst([flour, oil, salt, magic])).toEqual([oil, magic, flour, salt]);
  });
});

describe('canWeighPieces', () => {
  it('offers a weight where pieces of unknown weight are counted', () => {
    expect(canWeighPieces(line({status: 'NO_PORTION', grams: null}))).toBe(true);
  });

  it('offers to replace a guessed weight, and to change the owner\'s own', () => {
    expect(canWeighPieces(line({flags: ['TYPICAL_CONTAINER_SIZE']}))).toBe(true);
    expect(canWeighPieces(line({ownPortion: true}))).toBe(true);
  });

  it('offers nothing for weighed amounts, lines without an amount or shared recipes', () => {
    expect(canWeighPieces(line({}))).toBe(false);
    expect(canWeighPieces(line({status: 'NO_PORTION', amount: null}))).toBe(false);
    expect(canWeighPieces(line({status: 'NO_PORTION', ingredientId: null, ownPortion: null}))).toBe(false);
  });
});

describe('lineNoteKeys', () => {
  it('says why a line contributes nothing known', () => {
    expect(lineNoteKeys(line({status: 'UNLINKED'}))).toEqual(['nutrition.lineStatus.UNLINKED']);
  });

  it('names what makes a value uncertain, the uncertain link first', () => {
    expect(lineNoteKeys(line({flags: ['PINCH', 'LOW_CONFIDENCE']})))
        .toEqual(['nutrition.lineFlag.LOW_CONFIDENCE', 'nutrition.lineFlag.PINCH']);
  });

  it('has nothing to say about a line that is just right', () => {
    expect(lineNoteKeys(line({}))).toEqual([]);
  });
});

// The keys are put together from what the server sends, so a missing translation would only show
// as the key itself on screen.
describe('every nutrition label can be said out loud', () => {
  const resolve = (translations: object, key: string): unknown => key.split('.').reduce<unknown>(
      (branch, segment) => (branch && typeof branch === 'object' ? (branch as Record<string, unknown>)[segment] : undefined),
      translations);
  const statuses: NutritionLine['status'][] = ['EXCLUDED', 'UNLINKED', 'UNIT_UNKNOWN', 'NO_PORTION', 'NO_AMOUNT'];
  const keys = [
    ...NUTRIENT_ROWS.map((row) => row.labelKey),
    ...statuses.flatMap((status) => lineNoteKeys(line({status}))),
    ...lineNoteKeys(line({flags: ['LOW_CONFIDENCE', 'VOLUME_WITHOUT_DENSITY', 'ESTIMATED_PORTION', 'SIZE_SCALED_PORTION',
      'TYPICAL_CONTAINER_SIZE', 'PINCH']})),
  ];

  it.each(keys)('%s exists in English and German', (key) => {
    expect(resolve(en, key)).toBeTypeOf('string');
    expect(resolve(de, key)).toBeTypeOf('string');
  });
});
