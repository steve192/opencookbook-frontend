import {TFunction} from 'i18next';
import {DayOfWeek} from '../dao/RestAPI';

/** Monday first, as the weekplan and the server count them. */
export const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
export const WORKDAYS = DAYS_OF_WEEK.slice(0, 5);
export const WEEKEND = DAYS_OF_WEEK.slice(5);

const LABEL_KEYS = {
  MONDAY: 'weekdays.monday',
  TUESDAY: 'weekdays.tuesday',
  WEDNESDAY: 'weekdays.wednesday',
  THURSDAY: 'weekdays.thursday',
  FRIDAY: 'weekdays.friday',
  SATURDAY: 'weekdays.saturday',
  SUNDAY: 'weekdays.sunday',
} as const;

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {DayOfWeek} day the day
 * @return {string} its name
 */
export const dayOfWeekLabel = (t: TFunction, day: DayOfWeek): string => t(LABEL_KEYS[day]);

/** 1 January 2024 was a Monday, so the days after it are the days of the week in order. */
const A_MONDAY = new Date(2024, 0, 1);

/**
 * @param {DayOfWeek} day the day
 * @param {string} [locale] locale to format in, the device default when omitted
 * @return {string} its name in a few letters, e.g. "Mon"
 */
export const shortDayOfWeekLabel = (day: DayOfWeek, locale?: string): string =>
  new Date(A_MONDAY.getFullYear(), A_MONDAY.getMonth(), A_MONDAY.getDate() + DAYS_OF_WEEK.indexOf(day))
      .toLocaleDateString(locale, {weekday: 'short'});

/**
 * @param {DayOfWeek[]} days some days
 * @return {DayOfWeek[]} the same days, Monday first
 */
export const inWeekOrder = (days: DayOfWeek[]): DayOfWeek[] => DAYS_OF_WEEK.filter((day) => days.includes(day));

/**
 * The days a meal cooked this often a week falls on: the weekend first, Sunday before Saturday,
 * because that is where the time is; the rest as far apart as possible over the workdays, so
 * three times is Wednesday, Saturday and Sunday rather than three evenings in a row.
 *
 * @param {number} count how often a week, 0 to 7
 * @return {DayOfWeek[]} the days, Monday first
 */
export const automaticDays = (count: number): DayOfWeek[] => {
  const weekend = ['SUNDAY', 'SATURDAY'].slice(0, count) as DayOfWeek[];
  const onWorkdays = Math.min(count - weekend.length, WORKDAYS.length);
  // The middle of each of `onWorkdays` equal stretches of the working week
  const workdays = Array.from({length: onWorkdays},
      (unused, stretch) => WORKDAYS[Math.floor((stretch + 0.5) * WORKDAYS.length / onWorkdays)]);
  return inWeekOrder([...weekend, ...workdays]);
};
