import {describe, expect, it} from 'vitest';
import {SeasonalFood} from '../../api/types/catalogue';
import {endsThisMonth, monthRuns, monthsBy, nextMonth, parseSeasonalInputs, previousMonth, seasonOverview,
  strongestMethod} from './seasonal';

const food = (displayName: string, months: SeasonalFood['months'], inSeason: number[],
    category: SeasonalFood['category'] = 'VEGETABLE'): SeasonalFood =>
  ({id: displayName.length, displayName, icon: null, category, months, inSeason, storage: null});

const asparagus = food('Spargel', {4: ['FIELD', 'PROTECTED'], 5: ['FIELD'], 6: ['FIELD']}, [4, 5, 6]);
const apple = food('Apfel', {6: ['STORED'], 7: ['STORED'], 8: ['FIELD'], 9: ['FIELD']}, [8, 9], 'FRUIT');
const cucumber = food('Gurke', {5: ['HEATED_GREENHOUSE']}, []);

describe('seasonOverview', () => {
  const foods = [asparagus, apple, cucumber];

  it('puts each food of a month into one group', () => {
    const june = seasonOverview(foods, 6, 'ALL', '');
    expect(june).toEqual({inSeason: [asparagus], startingSoon: [], available: [apple], unavailable: [cucumber]});
    // Stored apples in July, but the harvest starts in August: starting soon says more.
    expect(seasonOverview(foods, 7, 'ALL', '')).toMatchObject({startingSoon: [apple], available: []});
  });

  it('filters by category and name, and keeps the order given', () => {
    expect(seasonOverview(foods, 8, 'FRUIT', '').inSeason).toEqual([apple]);
    expect(seasonOverview(foods, 1, 'ALL', 'sparg').unavailable).toEqual([asparagus]);
    expect(seasonOverview(foods, 1, 'ALL', '').unavailable).toEqual([asparagus, apple, cucumber]);
  });
});

describe('a food\'s year', () => {
  it('knows the last month of a season', () => {
    expect(endsThisMonth(asparagus, 6)).toBe(true);
    expect(endsThisMonth(asparagus, 5)).toBe(false);
  });

  it('shows the field before covers and stores', () => {
    expect(strongestMethod(asparagus, 4)).toBe('FIELD');
    expect(strongestMethod(apple, 6)).toBe('STORED');
    expect(strongestMethod(apple, 1)).toBeUndefined();
    expect(monthsBy(asparagus, 'PROTECTED')).toEqual([4]);
  });

  it('keeps a run over the turn of the year together', () => {
    expect(monthRuns([11, 12, 1, 2, 3])).toEqual([[11, 12, 1, 2, 3]]);
    expect(monthRuns([5, 6, 9])).toEqual([[5, 6], [9]]);
    expect(monthRuns(Array.from({length: 12}, (_, index) => index + 1))).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12]]);
  });
});

it('wraps the year in both directions', () => {
  expect(nextMonth(12)).toBe(1);
  expect(previousMonth(1)).toBe(12);
  expect(previousMonth(10)).toBe(9);
});

it('starts at the current month', () => {
  expect(parseSeasonalInputs(undefined, new Date(2026, 9, 16)).month).toBe(10);
});
