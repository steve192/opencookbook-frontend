import {TFunction} from 'i18next';
import type {TimerNotificationTexts} from './timerNotifications';

/** A preparation step of a recipe; the step is zero based, so it is shown as stepIndex + 1. */
export interface RecipeStepTarget {
  recipeId: number;
  stepIndex: number;
}

/** A kitchen tool, by its path segment. */
export interface ToolTarget {
  toolSlug: string;
}

/** Where a timer belongs, and where its notification takes you when it is tapped. */
export type TimerNotificationTarget = RecipeStepTarget | ToolTarget;

export const isRecipeStep = (target: TimerNotificationTarget): target is RecipeStepTarget => 'recipeId' in target;

/** A timer the user started on a preparation step or in a kitchen tool. */
export interface CookingTimer {
  /** What it counts down, e.g. "5 minutes" */
  label: string;
  /** When it goes off, as a wall clock timestamp */
  endsAt: number;
  /** What it belongs to as the user knows it: the recipe's title or the tool's name */
  title: string;
  target: TimerNotificationTarget;
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
 * Identifies a tool's timer the same way: one per tool and duration.
 *
 * @param {string} toolSlug the tool's path segment
 * @param {number} seconds how long the duration is
 * @return {string} the key that timer is held under
 */
export const toolTimerKey = (toolSlug: string, seconds: number): string => `tool:${toolSlug}:${seconds}`;

/**
 * Reads back the step a timer key was built for.
 *
 * The key is also the id the alarm is scheduled under, so an alarm handed back by the system
 * says which step it belongs to without anything having to be looked up or stored.
 *
 * @param {string} key a key made by timerKey or toolTimerKey
 * @return {TimerNotificationTarget | undefined} the step or tool, or undefined if this is not one
 */
export const parseTimerKey = (key: string): TimerNotificationTarget | undefined => {
  const tool = /^tool:([a-z-]+):\d+$/.exec(key);
  if (tool) {
    return {toolSlug: tool[1]};
  }
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
 * What a timer's reminder, alert and alarm say.
 *
 * Built from the stored timer alone, so an alarm can still be booked for it after the screen
 * that started it is gone.
 *
 * @param {TFunction} t the translation function of the caller
 * @param {CookingTimer} timer the timer being announced
 * @return {TimerNotificationTexts} the texts for every way it announces itself
 */
export const timerNotificationTexts = (t: TFunction, timer: CookingTimer): TimerNotificationTexts => {
  const time = formatEndTime(timer.endsAt);
  const step = isRecipeStep(timer.target) ? timer.target.stepIndex + 1 : undefined;
  return {
    runningTitle: t('screens.guidedCooking.timerRunningTitle', {label: timer.label}),
    runningBody: step != null ?
      t('screens.guidedCooking.timerRunningBody', {time, recipe: timer.title, step}) :
      t('tools.timer.runningBody', {time, tool: timer.title}),
    alertTitle: t('screens.guidedCooking.timerNotificationTitle', {label: timer.label}),
    alertBody: step != null ?
      t('screens.guidedCooking.timerNotificationBody', {recipe: timer.title, step}) :
      t('tools.timer.alertBody', {tool: timer.title}),
    stopLabel: t('screens.guidedCooking.stopAlarm'),
    openLabel: step != null ? t('screens.guidedCooking.openRecipe') : t('tools.timer.openTool'),
  };
};

/**
 * What the app says when a timer it was watching runs out.
 *
 * @param {TFunction} t the translation function of the caller
 * @param {CookingTimer} timer the timer that is up
 * @return {string} the message
 */
export const timerDoneMessage = (t: TFunction, timer: CookingTimer): string => isRecipeStep(timer.target) ?
  t('screens.guidedCooking.timerDoneFor', {label: timer.label, recipe: timer.title, step: timer.target.stepIndex + 1}) :
  t('tools.timer.doneFor', {label: timer.label, tool: timer.title});

/**
 * Reads the step or tool a timer notification was started from.
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
  const {recipeId, stepIndex, toolSlug} = data as Record<string, unknown>;
  if (typeof toolSlug === 'string') {
    return {toolSlug};
  }
  if (typeof recipeId !== 'number' || typeof stepIndex !== 'number' || stepIndex < 0) {
    return undefined;
  }
  return {recipeId, stepIndex};
};
