import {TimerNotificationTarget} from './cookingTimers';
import {TimerAnnouncement, TimerNotificationTexts} from './timerNotifications';

/**
 * The web build has no local notifications to hand: expo-notifications cannot schedule
 * there, and a browser tab that has been closed cannot be woken by one either. Timers still
 * run and still announce themselves inside the app.
 *
 * These mirror the native signatures so the two implementations cannot drift apart: only
 * the native one is ever checked against the call sites.
 *
 * @return {Promise<boolean>} always false, nothing can be posted here
 */
export const ensureTimerNotificationsReady = async (): Promise<boolean> => false;

/**
 * @param {string} timerKey unused
 * @param {number} endsAt unused
 * @param {TimerNotificationTexts} texts unused
 * @param {TimerNotificationTarget} target unused
 * @return {Promise<TimerAnnouncement>} always none, nothing was posted
 */
// eslint-disable-next-line no-unused-vars
export const startTimerNotifications = async (
    timerKey: string,
    endsAt: number,
    texts: TimerNotificationTexts,
    target: TimerNotificationTarget,
): Promise<TimerAnnouncement> => 'none';

/**
 * @param {string} timerKey unused
 * @return {Promise<void>} resolves immediately, there is nothing to clear
 */
// eslint-disable-next-line no-unused-vars
export const clearRunningTimerNotification = async (timerKey: string): Promise<void> => undefined;

/**
 * @param {string} timerKey unused
 * @return {Promise<void>} resolves immediately, there is nothing to take back
 */
// eslint-disable-next-line no-unused-vars
export const stopTimerNotifications = async (timerKey: string): Promise<void> => undefined;

/**
 * There are no notifications here to tap, so this never calls back.
 *
 * @param {Function} onTap unused
 */
// eslint-disable-next-line no-unused-vars
export const useTimerNotificationTap = (onTap: (target: TimerNotificationTarget) => void): void => undefined;

/**
 * @param {string[]} activeTimerKeys unused
 * @return {Promise<void>} resolves immediately, there is nothing presented to tidy
 */
// eslint-disable-next-line no-unused-vars
export const clearOrphanedRunningNotifications = async (activeTimerKeys: string[]): Promise<void> => undefined;
