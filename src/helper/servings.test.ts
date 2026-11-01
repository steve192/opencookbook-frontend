import {describe, expect, it} from 'vitest';
import {amountLabel, formatAmount, servingFactor} from './servings';

describe('servings', () => {
  it('scales by the ratio of servings', () => {
    expect(servingFactor(4, 2)).toBe(0.5);
  });

  it('takes a recipe without servings as written', () => {
    expect(servingFactor(0, 3)).toBe(1);
    expect(servingFactor(null, 3)).toBe(1);
  });

  it('shows at most one decimal and none when whole', () => {
    expect(formatAmount(2, 'en')).toBe('2');
    expect(formatAmount(1.25, 'en')).toBe('1.3');
    expect(formatAmount(1500, 'de')).toBe('1500');
  });

  it('writes the decimal the way the language does', () => {
    expect(formatAmount(1.5, 'de')).toBe('1,5');
  });

  it('labels an ingredient by its scaled amount and unit', () => {
    expect(amountLabel({ingredient: {name: 'Mehl'}, amount: 1.5, unit: 'EL', note: ''}, 'de', 2)).toBe('3 EL');
    expect(amountLabel({ingredient: {name: 'Salz'}, amount: 0, unit: 'Prise', note: ''}, 'de')).toBe('Prise');
    expect(amountLabel({ingredient: {name: 'Salz'}, amount: null, unit: '', note: ''}, 'de')).toBe('');
  });
});
