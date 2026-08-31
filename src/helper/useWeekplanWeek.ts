import {useCallback, useEffect, useMemo, useState} from 'react';
import XDate from 'xdate';
import {WeekplanDay} from '../dao/RestAPI';
import {fetchWeekplanDays} from '../redux/features/weeklyRecipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {addWeeks, startOfWeek, toDayKey, weekDays} from './weekplan';
import {emptyWeekplanDay} from './weekplanDay';

export interface WeekplanWeek {
  /** Start of today, the point all week offsets are relative to */
  today: XDate;
  /** Monday of the shown week */
  weekStart: XDate;
  /** The seven days of the shown week */
  days: XDate[];
  /** The plan of each of those days, in the same order and never missing */
  plans: WeekplanDay[];
  loading: boolean;
  reload: () => void;
}

/**
 * Loads and exposes one week of the plan.
 *
 * Keeping this out of the screen leaves the screen with the two things it is
 * actually about: which week the user is looking at and what they do to it.
 *
 * @param {number} weekOffset weeks from the current one, negative for the past
 * @return {WeekplanWeek} the shown week and the state of loading it
 */
export const useWeekplanWeek = (weekOffset: number): WeekplanWeek => {
  const dispatch = useAppDispatch();
  const weekplanDays = useAppSelector((state) => state.weeklyRecipes.weekplanDays);
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => new XDate().clearTime(), []);
  const weekStart = useMemo(() => addWeeks(startOfWeek(today), weekOffset), [today, weekOffset]);
  const weekStartKey = toDayKey(weekStart);
  const days = useMemo(() => weekDays(weekStart), [weekStartKey]);

  // A day the server does not know about yet is an empty plan, not a missing one,
  // so callers never have to deal with undefined.
  const plans = useMemo(
      () => days.map((date) =>
        weekplanDays.find((weekplanDay) => weekplanDay.day === toDayKey(date)) ??
          emptyWeekplanDay(toDayKey(date))),
      [days, weekplanDays],
  );

  const reload = useCallback(() => {
    // Fetch the neighbouring weeks too, so paging through the plan does not
    // flash empty days while the next request is in flight.
    setLoading(true);
    dispatch(fetchWeekplanDays({
      from: addWeeks(weekStart, -1),
      to: addWeeks(weekStart, 2).addDays(-1),
    })).finally(() => setLoading(false));
  }, [weekStartKey]);

  useEffect(reload, [weekStartKey]);

  return {today, weekStart, days, plans, loading, reload};
};
