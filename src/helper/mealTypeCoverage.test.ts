import {describe, expect, it} from 'vitest';
import {Recipe} from '../dao/RestAPI';
import {mealTypeCoverage, warrantsMealTypeWarning} from './mealTypeCoverage';

const recipe = (mealTypes?: Recipe['mealTypes']) => ({title: 'x', mealTypes} as Recipe);

describe('mealTypeCoverage', () => {
  it('counts recipes without a meal type, whether the list is empty or missing', () => {
    expect(mealTypeCoverage([recipe(['DINNER']), recipe([]), recipe()])).toEqual({untagged: 2, total: 3});
  });

  it('does not count a side or component, which suits no meal on purpose', () => {
    expect(mealTypeCoverage([{title: 'Hollandaise', dishRole: 'COMPONENT'} as Recipe]).untagged).toBe(0);
  });
});

describe('warrantsMealTypeWarning', () => {
  it('warns from half the cookbook untagged on, and never for an empty one', () => {
    expect(warrantsMealTypeWarning({untagged: 1, total: 2})).toBe(true);
    expect(warrantsMealTypeWarning({untagged: 1, total: 3})).toBe(false);
    expect(warrantsMealTypeWarning({untagged: 0, total: 0})).toBe(false);
  });
});
