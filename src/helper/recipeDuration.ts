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

/** What a unit is worth in seconds, by the ways a recipe writes it. */
const UNIT_SECONDS: Record<string, number> = {
  h: 3600, hr: 3600, hrs: 3600, hour: 3600, hours: 3600,
  std: 3600, stunde: 3600, stunden: 3600,
  m: 60, min: 60, mins: 60, minute: 60, minutes: 60, minuten: 60,
  s: 1, sec: 1, secs: 1, second: 1, seconds: 1, sekunde: 1, sekunden: 1,
};

/**
 * A number, optionally a range, then a word.
 *
 * Whether the word is a unit is decided in code rather than spelled out as an alternation
 * of every spelling. That keeps the pattern simple enough to reason about - it runs over
 * imported recipe text, which is as long and as odd as the site it came from - and puts the
 * vocabulary somewhere it can be read and extended.
 */
const DURATION_PATTERN = /(\d+(?:[.,]\d+)?)(?:\s*(?:[-–—]|bis|to)\s*\d+(?:[.,]\d+)?)?\s*([a-zA-Z]+)\b/g;

/** Anything shorter than this is not worth a timer. */
const SHORTEST_TIMER_SECONDS = 60;

/**
 * Converts one matched amount and unit into seconds.
 *
 * Timers stay in seconds rather than whole minutes, so "90 seconds" runs for 90 seconds
 * instead of being rounded up to two minutes.
 *
 * @param {string} amount the number as it was written
 * @param {string} unit the word that followed it
 * @return {number | undefined} the duration in seconds, or undefined if that was not a unit
 */
const toSeconds = (amount: string, unit: string): number | undefined => {
  const secondsPerUnit = UNIT_SECONDS[unit.toLowerCase()];
  if (secondsPerUnit === undefined) {
    return undefined;
  }
  return Math.round(Number.parseFloat(amount.replace(',', '.')) * secondsPerUnit);
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
    if (seconds === undefined || seconds < SHORTEST_TIMER_SECONDS || seen.has(seconds)) {
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
