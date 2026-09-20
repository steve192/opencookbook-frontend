import {useState} from 'react';
import XDate from 'xdate';
import {toggledIn} from './choices';
import {addWeeks, plannableDays, startOfWeek} from './weekplan';

/** This week and the two after it; a week further ahead is offered when the wizard is opened from it. */
const WEEKS_OFFERED = 3;

export interface PlanPeriod {
  /** Weeks from the current one. */
  weekOffset: number;
  weekOffsets: number[];
  /** Monday of the week that many weeks from the current one. */
  weekStartOf: (weekOffset: number) => XDate;
  weekStart: XDate;
  /** The chosen week's days from today on. */
  days: XDate[];
  /** Day keys of the days the cook is not at home. */
  awayDays: string[];
  chooseWeek: (weekOffset: number) => void;
  toggleAwayDay: (dayKey: string) => void;
}

/**
 * @param {number} initialOffset the week to start on, in weeks from the current one
 * @return {PlanPeriod} the week being planned, and the days in it the cook is away
 */
export const usePlanPeriod = (initialOffset: number): PlanPeriod => {
  const [weekOffset, setWeekOffset] = useState(initialOffset);
  const [awayDays, setAwayDays] = useState<string[]>([]);
  const today = new XDate().clearTime();
  const weekStartOf = (offset: number) => addWeeks(startOfWeek(today), offset);
  const weekStart = weekStartOf(weekOffset);
  return {
    weekOffset,
    weekOffsets: Array.from({length: Math.max(WEEKS_OFFERED, initialOffset + 1)}, (unused, offset) => offset),
    weekStartOf,
    weekStart,
    days: plannableDays(weekStart, today),
    awayDays,
    // Away days belong to the week they were picked in
    chooseWeek: (offset) => {
      setWeekOffset(offset);
      setAwayDays([]);
    },
    toggleAwayDay: (dayKey) => setAwayDays(toggledIn(awayDays, dayKey)),
  };
};
