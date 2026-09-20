import {describe, expect, it} from 'vitest';
import {automaticDays, inWeekOrder, shortDayOfWeekLabel} from './daysOfWeek';

describe('automaticDays', () => {
  it('fills the weekend first, Sunday before Saturday', () => {
    expect(automaticDays(0)).toEqual([]);
    expect(automaticDays(1)).toEqual(['SUNDAY']);
    expect(automaticDays(2)).toEqual(['SATURDAY', 'SUNDAY']);
  });

  // Beyond the weekend the workdays are spread out rather than bunched into a run of evenings
  it('spreads the rest evenly over the workdays', () => {
    expect(automaticDays(3)).toEqual(['WEDNESDAY', 'SATURDAY', 'SUNDAY']);
    expect(automaticDays(4)).toEqual(['TUESDAY', 'THURSDAY', 'SATURDAY', 'SUNDAY']);
    expect(automaticDays(5)).toEqual(['MONDAY', 'WEDNESDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
    expect(automaticDays(7)).toHaveLength(7);
  });
});

describe('inWeekOrder', () => {
  it('puts days Monday first', () => {
    expect(inWeekOrder(['SUNDAY', 'MONDAY'])).toEqual(['MONDAY', 'SUNDAY']);
  });
});

describe('shortDayOfWeekLabel', () => {
  it('names each day of the week in a few letters', () => {
    expect(shortDayOfWeekLabel('MONDAY', 'en-GB')).toBe('Mon');
    expect(shortDayOfWeekLabel('SUNDAY', 'en-GB')).toBe('Sun');
  });
});
