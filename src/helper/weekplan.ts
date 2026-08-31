import XDate from 'xdate';

/** The format the weekplan API identifies a day with. */
export const DAY_KEY_FORMAT = 'yyyy-MM-dd';

/**
 * Monday 00:00 of the ISO week the given date falls into.
 *
 * Everything else in the weekplan is derived from a week start, which keeps the
 * navigation arithmetic on dates instead of on week numbers. Adding to a week
 * number breaks across new year (week 52 + 2 is not week 2 of the next year),
 * which is what kept the plan from being browsable in both directions.
 *
 * @param {XDate} date any day of the wanted week
 * @return {XDate} a new date at the start of that week
 */
export const startOfWeek = (date: XDate): XDate => {
  const start = new XDate(date).clearTime();
  // XDate weeks start on Sunday (0), ISO weeks on Monday
  return start.addDays(-((start.getDay() + 6) % 7));
};

/**
 * Moves a date by whole weeks.
 *
 * @param {XDate} date starting point, left untouched
 * @param {number} weeks weeks to add, negative to move into the past
 * @return {XDate} a new, shifted date
 */
export const addWeeks = (date: XDate, weeks: number): XDate =>
  new XDate(date).addWeeks(weeks);

/**
 * The seven days of a week, Monday first.
 *
 * @param {XDate} weekStart Monday of the week, as returned by startOfWeek
 * @return {XDate[]} the days of that week
 */
export const weekDays = (weekStart: XDate): XDate[] =>
  Array.from({length: 7}, (unused, index) => new XDate(weekStart).addDays(index));

/**
 * Formats a date the way the weekplan API keys its days.
 *
 * @param {XDate} date date to format
 * @return {string} the day key, e.g. 2026-08-31
 */
export const toDayKey = (date: XDate): string => date.toString(DAY_KEY_FORMAT);

/**
 * ISO 8601 week number.
 *
 * @param {XDate} date date to look at
 * @return {number} week number between 1 and 53
 */
export const isoWeekNumber = (date: XDate): number => new XDate(date).getWeek();

/**
 * Whether two dates fall on the same calendar day, ignoring the time.
 *
 * @param {XDate} a first date
 * @param {XDate} b second date
 * @return {boolean} true when both are the same day
 */
export const isSameDay = (a: XDate, b: XDate): boolean => toDayKey(a) === toDayKey(b);

/**
 * Whole weeks from the week of one date to the week of another.
 *
 * @param {XDate} from week to count from
 * @param {XDate} to week to count to
 * @return {number} number of weeks, negative when `to` lies in the past
 */
export const weekOffsetBetween = (from: XDate, to: XDate): number =>
  Math.round(startOfWeek(from).diffDays(startOfWeek(to)) / 7);

/**
 * The span of a week as one short, localised label, e.g. "31 - 6 Sep 2026".
 * The month is left off the first date while both ends share one.
 *
 * @param {XDate} weekStart Monday of the week
 * @param {string} [locale] locale to format in, the device default when omitted
 * @return {string} the formatted range
 */
export const formatWeekRange = (weekStart: XDate, locale?: string): string => {
  const start = new XDate(weekStart).toDate();
  const end = new XDate(weekStart).addDays(6).toDate();
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(locale, sameMonth ? {day: 'numeric'} : {day: 'numeric', month: 'short'});
  const endLabel = end.toLocaleDateString(locale, {day: 'numeric', month: 'short', year: 'numeric'});
  return `${startLabel} \u2013 ${endLabel}`;
};

/**
 * A day and its month, e.g. "31 August".
 *
 * @param {XDate} date date to format
 * @param {string} [locale] locale to format in, the device default when omitted
 * @return {string} the formatted date
 */
export const formatDayAndMonth = (date: XDate, locale?: string): string =>
  date.toDate().toLocaleDateString(locale, {day: 'numeric', month: 'long'});

/**
 * The month a date falls in, e.g. "August".
 *
 * @param {XDate} date date to format
 * @param {string} [locale] locale to format in, the device default when omitted
 * @return {string} the month name
 */
export const formatMonth = (date: XDate, locale?: string): string =>
  date.toDate().toLocaleDateString(locale, {month: 'long'});

/**
 * A day named in full, e.g. "Monday, 31 August".
 *
 * @param {XDate} date date to format
 * @param {string} [locale] locale to format in, the device default when omitted
 * @return {string} the formatted date
 */
export const formatWeekdayAndDate = (date: XDate, locale?: string): string =>
  date.toDate().toLocaleDateString(locale, {weekday: 'long', day: 'numeric', month: 'long'});
