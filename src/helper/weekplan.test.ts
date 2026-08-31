import {describe, expect, it} from 'vitest';
import XDate from 'xdate';
import {
  addWeeks,
  formatDayAndMonth,
  formatMonth,
  formatWeekdayAndDate,
  formatWeekRange,
  isSameDay,
  isoWeekNumber,
  startOfWeek,
  toDayKey,
  weekDays,
} from './weekplan';

const at = (isoDate: string) => new XDate(isoDate + 'T12:00:00');

describe('weekplan dates', () => {
  describe('startOfWeek', () => {
    it('returns the same day for a Monday', () => {
      expect(toDayKey(startOfWeek(at('2026-08-31')))).toBe('2026-08-31');
    });

    it('walks back to Monday for a mid-week day', () => {
      expect(toDayKey(startOfWeek(at('2026-09-03')))).toBe('2026-08-31');
    });

    // XDate counts Sunday as day 0, so a Sunday must resolve to the Monday six
    // days earlier rather than the next day.
    it('treats Sunday as the last day of its week', () => {
      expect(toDayKey(startOfWeek(at('2026-09-06')))).toBe('2026-08-31');
    });

    it('clears the time of day', () => {
      const start = startOfWeek(at('2026-09-03'));
      expect([start.getHours(), start.getMinutes(), start.getSeconds()]).toEqual([0, 0, 0]);
    });

    it('does not modify the date it is given', () => {
      const input = at('2026-09-03');
      startOfWeek(input);
      expect(toDayKey(input)).toBe('2026-09-03');
    });
  });

  describe('addWeeks', () => {
    it('moves forward', () => {
      expect(toDayKey(addWeeks(at('2026-08-31'), 2))).toBe('2026-09-14');
    });

    it('moves into the past', () => {
      expect(toDayKey(addWeeks(at('2026-08-31'), -2))).toBe('2026-08-17');
    });

    // Browsing backwards from early January has to land in the previous year,
    // which week-number arithmetic got wrong.
    it('crosses the new year backwards', () => {
      expect(toDayKey(addWeeks(at('2027-01-04'), -2))).toBe('2026-12-21');
    });

    it('crosses the new year forwards', () => {
      expect(toDayKey(addWeeks(at('2026-12-21'), 3))).toBe('2027-01-11');
    });

    it('does not modify the date it is given', () => {
      const input = at('2026-08-31');
      addWeeks(input, 5);
      expect(toDayKey(input)).toBe('2026-08-31');
    });
  });

  describe('weekDays', () => {
    it('lists Monday through Sunday', () => {
      expect(weekDays(startOfWeek(at('2026-09-03'))).map(toDayKey)).toEqual([
        '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03',
        '2026-09-04', '2026-09-05', '2026-09-06',
      ]);
    });

    it('spans a month boundary', () => {
      expect(weekDays(startOfWeek(at('2026-10-01'))).map(toDayKey)).toEqual([
        '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01',
        '2026-10-02', '2026-10-03', '2026-10-04',
      ]);
    });
  });

  describe('isoWeekNumber', () => {
    it('numbers a mid-year week', () => {
      expect(isoWeekNumber(at('2026-08-31'))).toBe(36);
    });

    // 2026-01-01 is a Thursday, so it belongs to week 1 of 2026.
    it('puts a January Thursday in week 1', () => {
      expect(isoWeekNumber(at('2026-01-01'))).toBe(1);
    });

    // 2027-01-01 is a Friday, so that week belongs to 2026 and is week 53.
    it('keeps early January in the previous years last week', () => {
      expect(isoWeekNumber(at('2027-01-01'))).toBe(53);
    });
  });

  describe('isSameDay', () => {
    it('ignores the time of day', () => {
      expect(isSameDay(new XDate('2026-08-31T01:00:00'), new XDate('2026-08-31T23:00:00'))).toBe(true);
    });

    it('separates neighbouring days', () => {
      expect(isSameDay(at('2026-08-31'), at('2026-09-01'))).toBe(false);
    });
  });
});

// The month names come from the platform, so these assert the structure of the
// range rather than the exact wording of a particular ICU build.
describe('formatWeekRange', () => {
  const startOf = (range: string) => range.split('–')[0].trim();

  it('leaves the month off the start when the week stays in one month', () => {
    // 7 to 13 September 2026
    expect(startOf(formatWeekRange(startOfWeek(at('2026-09-09')), 'en-GB'))).toBe('7');
  });

  it('names both months when the week spans two', () => {
    // 28 September to 4 October 2026
    expect(startOf(formatWeekRange(startOfWeek(at('2026-10-01')), 'en-GB'))).toMatch(/^28 \D+$/);
  });

  it('always ends with the day, month and year of the Sunday', () => {
    const range = formatWeekRange(startOfWeek(at('2026-09-09')), 'en-GB');
    expect(range.split('–')[1].trim()).toMatch(/^13 \D+ 2026$/);
  });

  it('names the year the week ends in', () => {
    // The week of 31 December 2026 runs into 2027
    expect(formatWeekRange(startOfWeek(at('2026-12-31')), 'en-GB')).toContain('2027');
  });
});

describe('day formatting', () => {
  it('names the day and its month', () => {
    expect(formatDayAndMonth(at('2026-08-31'), 'en-GB')).toBe('31 August');
  });

  it('names the month on its own', () => {
    expect(formatMonth(at('2026-08-31'), 'en-GB')).toBe('August');
  });

  it('names the weekday together with the date', () => {
    expect(formatWeekdayAndDate(at('2026-08-31'), 'en-GB')).toContain('Monday');
    expect(formatWeekdayAndDate(at('2026-08-31'), 'en-GB')).toContain('31 August');
  });

  // A day key parsed back into a date must stay on the same day in every
  // timezone, or the plan would label a day with its neighbour.
  it('keeps the day when a day key is parsed back', () => {
    expect(formatDayAndMonth(new XDate('2026-08-31'), 'en-GB')).toBe('31 August');
  });
});
