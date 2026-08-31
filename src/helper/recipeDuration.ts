const MINUTES_PER_HOUR = 60;

/**
 * Renders a number of minutes the way a recipe would say it.
 *
 * @param {number} [minutes] duration in minutes, absent for a recipe that has none
 * @return {string | undefined} the duration, or undefined when there is nothing to show
 */
export const formatDuration = (minutes?: number | null): string | undefined => {
  if (!minutes || minutes <= 0) {
    return undefined;
  }
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainder = minutes % MINUTES_PER_HOUR;
  if (hours === 0) {
    return `${remainder} min`;
  }
  return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`;
};

/** A duration mentioned in a preparation step, offered as a timer. */
export interface StepDuration {
  /** What the step said, e.g. "5 minutes" */
  label: string;
  seconds: number;
}

/**
 * Alternatives are longest first: "minute" would otherwise match inside "minutes" and then
 * fail the word boundary that follows, taking the whole match down with it.
 */
const DURATION_PATTERN =
  /(\d+(?:[.,]\d+)?)\s*(?:(?:-|–|-|bis|to)\s*\d+(?:[.,]\d+)?\s*)?(stunden|stunde|hours|hour|std|hrs|hr|h|minuten|minutes|minute|mins|min|m|sekunden|sekunde|seconds|second|secs|sec|s)\b/gi;

/** Anything shorter than this is not worth a timer. */
const SHORTEST_TIMER_SECONDS = 60;

/**
 * Converts one matched amount and unit into seconds.
 *
 * Timers stay in seconds rather than whole minutes, so "90 seconds" runs for 90 seconds
 * instead of being rounded up to two minutes.
 *
 * @param {string} amount the number as it was written
 * @param {string} unit the unit as it was written
 * @return {number} the duration in seconds
 */
const toSeconds = (amount: string, unit: string): number => {
  const value = parseFloat(amount.replace(',', '.'));
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit.startsWith('h') || normalizedUnit.startsWith('st')) {
    return Math.round(value * MINUTES_PER_HOUR * 60);
  }
  if (normalizedUnit.startsWith('s')) {
    return Math.round(value);
  }
  return Math.round(value * 60);
};

/**
 * Finds the durations a preparation step mentions, so each can be started as a timer.
 *
 * A range keeps its lower bound: "simmer for 20-25 minutes" is worth being called back to
 * at 20, not at 25 when it may already be too late.
 *
 * @param {string} step the preparation step text
 * @return {StepDuration[]} the durations mentioned, in reading order, without duplicates
 */
export const findStepDurations = (step: string): StepDuration[] => {
  const durations: StepDuration[] = [];
  const seen = new Set<number>();

  for (const match of step.matchAll(DURATION_PATTERN)) {
    const seconds = toSeconds(match[1], match[2]);
    if (seconds < SHORTEST_TIMER_SECONDS || seen.has(seconds)) {
      continue;
    }
    seen.add(seconds);
    durations.push({label: match[0].trim(), seconds});
  }
  return durations;
};

/**
 * Formats a countdown as minutes and seconds.
 *
 * @param {number} secondsRemaining seconds left on the timer, never below zero
 * @return {string} the remaining time, e.g. "4:05"
 */
export const formatCountdown = (secondsRemaining: number): string => {
  const safeSeconds = Math.max(0, Math.round(secondsRemaining));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
