import {GrowingMethod, SeasonalFood, SeasonCategory} from '../../api/types/catalogue';
import {asRawInputs, readChoice, readNumber} from '../inputs';

export const SEASON_CATEGORIES: readonly SeasonCategory[] = ['VEGETABLE', 'FRUIT', 'SALAD'];

export const MONTHS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const GROWING_METHODS: readonly GrowingMethod[] = ['FIELD', 'PROTECTED', 'UNHEATED_GREENHOUSE',
  'HEATED_GREENHOUSE', 'STORED'];

export const isInSeason = (food: SeasonalFood, month: number): boolean => food.inSeason.includes(month);

export const nextMonth = (month: number): number => month % 12 + 1;

export const previousMonth = (month: number): number => (month + 10) % 12 + 1;

/**
 * Whether a food is in season this month for the last time this year.
 *
 * @param {SeasonalFood} food the food
 * @param {number} month 1 to 12
 * @return {boolean} true in the last month of a season
 */
export const endsThisMonth = (food: SeasonalFood, month: number): boolean =>
  isInSeason(food, month) && !isInSeason(food, nextMonth(month));

/**
 * The method that says most about a month: grown outdoors before covered, before stored.
 *
 * @param {SeasonalFood} food the food
 * @param {number} month 1 to 12
 * @return {GrowingMethod | undefined} the one to show; undefined when there is no German harvest
 */
export const strongestMethod = (food: SeasonalFood, month: number): GrowingMethod | undefined => {
  const methods = food.months[String(month)] ?? [];
  return GROWING_METHODS.find((method) => methods.includes(method));
};

/**
 * The months a food comes to market by one method.
 *
 * @param {SeasonalFood} food the food
 * @param {GrowingMethod} method how it is grown or kept
 * @return {number[]} months 1 to 12
 */
export const monthsBy = (food: SeasonalFood, method: GrowingMethod): number[] =>
  MONTHS.filter((month) => (food.months[String(month)] ?? []).includes(method));

/**
 * Months as runs of consecutive months; a run over the turn of the year stays one, such as November to March.
 *
 * @param {number[]} months months 1 to 12, in any order
 * @return {Array<number[]>} the runs, each in calendar order
 */
export const monthRuns = (months: number[]): number[][] => {
  const runs: number[][] = [];
  for (const month of [...new Set(months)].sort((a, b) => a - b)) {
    const run = runs.at(-1);
    if (run?.at(-1) === month - 1) {
      run.push(month);
    } else {
      runs.push([month]);
    }
  }
  if (runs.length > 1 && runs[0][0] === 1 && runs.at(-1)!.at(-1) === 12) {
    runs[0] = [...runs.pop()!, ...runs[0]];
  }
  return runs;
};

/** What a month holds, each food in one group only. */
export interface SeasonOverview {
  inSeason: SeasonalFood[];
  /** Not in season this month, but next month. */
  startingSoon: SeasonalFood[];
  /** Out of season, but there from stores, covers or greenhouses. */
  available: SeasonalFood[];
  /** No German harvest this month. */
  unavailable: SeasonalFood[];
}

/**
 * What a month holds, for the foods of one category or all.
 *
 * @param {SeasonalFood[]} foods every food with a season, by name
 * @param {number} month 1 to 12
 * @param {SeasonCategory | 'ALL'} category the category to show
 * @param {string} search a part of the name, or empty
 * @return {SeasonOverview} the month's foods, each group in the order given
 */
export const seasonOverview = (foods: SeasonalFood[], month: number, category: SeasonCategory | 'ALL',
    search: string): SeasonOverview => {
  const needle = search.trim().toLocaleLowerCase();
  const shown = foods.filter((food) => (category === 'ALL' || food.category === category) &&
    food.displayName.toLocaleLowerCase().includes(needle));
  const next = nextMonth(month);
  const inSeason = shown.filter((food) => isInSeason(food, month));
  const startingSoon = shown.filter((food) => !isInSeason(food, month) && isInSeason(food, next));
  const rest = shown.filter((food) => !inSeason.includes(food) && !startingSoon.includes(food));
  return {
    inSeason,
    startingSoon,
    available: rest.filter((food) => strongestMethod(food, month) != null),
    unavailable: rest.filter((food) => strongestMethod(food, month) == null),
  };
};

export interface SeasonalInputs {
  month: number;
  category: SeasonCategory | 'ALL';
}

export const parseSeasonalInputs = (raw: unknown, now = new Date()): SeasonalInputs => {
  const fields = asRawInputs(raw);
  return {
    month: Math.round(readNumber(fields, 'month', now.getMonth() + 1, 1, 12)),
    category: readChoice(fields, 'category', ['ALL', ...SEASON_CATEGORIES] as const, 'ALL'),
  };
};
