import {useCallback, useMemo} from 'react';
import XDate from 'xdate';
import {useGetWeekplanWeekQuery} from '../api/endpoints/weekplan';
import {WeekplanDay} from '../api/types/weekplan';
import {addWeeks, startOfWeek, toDayKey, weekDays} from './weekplan';
import {emptyWeekplanDay} from './weekplanDay';

export interface WeekplanWeek {
  /** Start of today, the point all week offsets are relative to */
  today: XDate;
  /** Monday of the shown week */
  weekStart: XDate;
  /** The seven days of the shown week */
  days: XDate[];
  /** Per day: your own plan first and never missing, then each household plan with meals that day. */
  plans: WeekplanDay[][];
  /** Every plan day read around the shown week, which leftovers can come from. */
  loadedDays: WeekplanDay[];
  loading: boolean;
  reload: () => void;
}

const NO_DAYS: WeekplanDay[] = [];

/**
 * One week of the plan, with the weeks either side: the one before for leftovers carried over the
 * weekend, the one after so that paging does not flash empty days.
 *
 * @param {number} weekOffset weeks from the current one, negative for the past
 * @return {WeekplanWeek} the shown week and the state of reading it
 */
export const useWeekplanWeek = (weekOffset: number): WeekplanWeek => {
  const today = useMemo(() => new XDate().clearTime(), []);
  const weekStart = useMemo(() => addWeeks(startOfWeek(today), weekOffset), [today, weekOffset]);
  const weekStartKey = toDayKey(weekStart);
  const days = useMemo(() => weekDays(weekStart), [weekStartKey]);

  const previous = useGetWeekplanWeekQuery(toDayKey(addWeeks(weekStart, -1)));
  const shown = useGetWeekplanWeekQuery(weekStartKey);
  const next = useGetWeekplanWeekQuery(toDayKey(addWeeks(weekStart, 1)));

  const loadedDays = useMemo(
      () => [...(previous.data ?? NO_DAYS), ...(shown.data ?? NO_DAYS), ...(next.data ?? NO_DAYS)],
      [previous.data, shown.data, next.data]);

  // A day the server does not know about yet is an empty plan, not a missing one, so callers never
  // have to deal with undefined.
  const plans = useMemo(
      () => days.map((date) => {
        const dayKey = toDayKey(date);
        const onThatDay = loadedDays.filter((weekplanDay) => weekplanDay.day === dayKey);
        const own = onThatDay.find((weekplanDay) => !weekplanDay.householdId) ??
          emptyWeekplanDay(dayKey);
        const shared = onThatDay.filter((weekplanDay) =>
          weekplanDay.householdId && weekplanDay.recipes.length > 0);
        return [own, ...shared];
      }),
      [days, loadedDays],
  );

  const reload = useCallback(() => {
    void previous.refetch();
    void shown.refetch();
    void next.refetch();
  }, [previous.refetch, shown.refetch, next.refetch]);

  return {today, weekStart, days, plans, loadedDays, loading: shown.isFetching, reload};
};
