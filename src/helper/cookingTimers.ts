/** Where a timer notification should take you when it is tapped. */
export interface TimerNotificationTarget {
  recipeId: number;
  stepIndex: number;
}

/** A timer the user started on a preparation step. */
export interface CookingTimer {
  /** What the step said, e.g. "5 minutes" */
  label: string;
  /** When it goes off, as a wall clock timestamp */
  endsAt: number;
  recipeTitle: string;
  /** Zero based, so it is shown as stepIndex + 1 */
  stepIndex: number;
}

export type CookingTimers = Record<string, CookingTimer>;

/**
 * Identifies a timer by what it counts down rather than by when it was started, so the same
 * duration on the same step is one timer no matter how often the screen is rebuilt.
 *
 * @param {number} recipeId the recipe being cooked
 * @param {number} stepIndex which step mentioned the duration
 * @param {number} seconds how long the duration is
 * @return {string} the key that timer is held under
 */
export const timerKey = (recipeId: number, stepIndex: number, seconds: number): string =>
  `${recipeId}-${stepIndex}-${seconds}`;

/**
 * Reads back the step a timer key was built for.
 *
 * The key is also the id the alarm is scheduled under, so an alarm handed back by the system
 * says which step it belongs to without anything having to be looked up or stored.
 *
 * @param {string} key a key made by timerKey
 * @return {TimerNotificationTarget | undefined} the step, or undefined if this is not one
 */
export const parseTimerKey = (key: string): TimerNotificationTarget | undefined => {
  const parts = key.split('-');
  if (parts.length !== 3) {
    return undefined;
  }
  const [recipeId, stepIndex] = parts.map(Number);
  if (!Number.isInteger(recipeId) || !Number.isInteger(stepIndex) || stepIndex < 0) {
    return undefined;
  }
  return {recipeId, stepIndex};
};

/**
 * How long a timer still has to run.
 *
 * Stored as the moment it ends rather than as a remaining count, so leaving the screen, or
 * the app, does not cost it any time - the answer is worked out from the clock rather than
 * from how many ticks happened to be counted.
 *
 * @param {CookingTimer} timer the timer to look at
 * @param {number} now the current timestamp
 * @return {number} whole seconds left, never below zero
 */
export const secondsRemaining = (timer: CookingTimer, now: number): number =>
  Math.max(0, Math.ceil((timer.endsAt - now) / 1000));

/**
 * Whether a timer has run out.
 *
 * @param {CookingTimer} timer the timer to look at
 * @param {number} now the current timestamp
 * @return {boolean} true once it is due
 */
export const hasElapsed = (timer: CookingTimer, now: number): boolean => timer.endsAt <= now;

/**
 * The keys of every timer that is due.
 *
 * @param {CookingTimers} timers all running timers
 * @param {number} now the current timestamp
 * @return {string[]} the keys of the ones that have run out
 */
export const elapsedTimerKeys = (timers: CookingTimers, now: number): string[] =>
  Object.keys(timers).filter((key) => hasElapsed(timers[key], now));

/**
 * How many timers are still counting down.
 *
 * @param {CookingTimers} timers all running timers
 * @param {number} now the current timestamp
 * @return {number} the number still running
 */
export const runningTimerCount = (timers: CookingTimers, now: number): number =>
  Object.keys(timers).filter((key) => !hasElapsed(timers[key], now)).length;

/**
 * When a timer is due, as a clock time.
 *
 * Hours and minutes only. The notification that carries this cannot tick - Android renders
 * a live countdown only through a chronometer that expo-notifications does not expose - so
 * showing seconds would only ever be a number frozen at the moment it was written.
 *
 * @param {number} endsAt when the timer is due, as a timestamp
 * @param {string} [locale] locale to format in, the device default when omitted
 * @return {string} the end time, e.g. "14:32"
 */
export const formatEndTime = (endsAt: number, locale?: string): string =>
  new Date(endsAt).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'});

/**
 * Reads the step a timer notification was started from.
 *
 * The data travels with the notification rather than being looked up later, because the tap
 * may arrive long after the app was last running - or be the thing that starts it.
 *
 * @param {unknown} data the notification's data payload, which comes back untyped
 * @return {TimerNotificationTarget | undefined} where to go, or undefined if this is not
 *   a timer notification
 */
export const readTimerNotificationTarget = (data: unknown): TimerNotificationTarget | undefined => {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  const {recipeId, stepIndex} = data as Record<string, unknown>;
  if (typeof recipeId !== 'number' || typeof stepIndex !== 'number' || stepIndex < 0) {
    return undefined;
  }
  return {recipeId, stepIndex};
};
