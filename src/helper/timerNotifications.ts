import * as Notifications from 'expo-notifications';
import {useEffect, useRef} from 'react';
import {AppState, Platform} from 'react-native';
import AlarmScheduler from 'react-native-alarm-scheduler';
import {
  CookingTimer,
  CookingTimers,
  hasElapsed,
  parseTimerKey,
  readTimerNotificationTarget,
  TimerNotificationTarget,
} from './cookingTimers';

/**
 * The fallback alert, for when an alarm cannot be scheduled.
 *
 * A notification is the weaker option: its sound is played by the system, which silences it
 * when the phone is set to vibrate. That is why timers ring as alarms instead, and this is
 * only what is left when the user has refused the permission an alarm needs.
 *
 * The id is versioned because a channel cannot be changed once it exists - Android hands
 * its settings to the user at that point, and creating it again with different audio is
 * quietly ignored. A new sound needs a new channel, and the old one is deleted below.
 */
const ALERT_CHANNEL_ID = 'cooking-timer-alarm';

/** The first alert channel, on the notification stream. Replaced by the one above. */
const LEGACY_ALERT_CHANNEL_ID = 'cooking-timers';

/** The reminder that a timer is running. Quiet, because it says nothing new. */
const RUNNING_CHANNEL_ID = 'cooking-timers-running';

/** Tells the two kinds apart when one arrives while the app is open. */
type TimerNotificationKind = 'running' | 'alert';

/**
 * How a timer ends up announcing itself. Reported back so the screen can say when a timer
 * will only be able to show a notification, rather than failing quietly to make a sound.
 */
export type TimerAnnouncement = 'alarm' | 'notification' | 'none';

export interface TimerNotificationTexts {
  runningTitle: string;
  runningBody: string;
  alertTitle: string;
  alertBody: string;
  /** The button that silences a ringing alarm */
  stopLabel: string;
  /** The button that takes the user back to the step instead */
  openLabel: string;
}

let permissionRequested = false;

// Derived from the timer's own key rather than kept in the store, so a notification can
// always be taken back without having to remember an id that a scheduling call returned.
const runningId = (timerKey: string) => `${timerKey}-running`;
const alertId = (timerKey: string) => `${timerKey}-alert`;

// A timer going off matters wherever the app happens to be, so the alert is shown and heard
// even in the foreground. The running reminder stays silent: it is a status, and it would
// otherwise interrupt the very screen that just started it.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const kind = notification.request.content.data?.kind as TimerNotificationKind | undefined;
    const isAlert = kind !== 'running';
    return {
      shouldShowBanner: isAlert,
      shouldShowList: true,
      shouldPlaySound: isAlert,
      shouldSetBadge: false,
    };
  },
});

/**
 * Makes sure a timer is allowed to announce itself, asking the first time one is started.
 *
 * Asked at that moment rather than at app start, so the permission prompt arrives with a
 * reason the user can see.
 *
 * @return {Promise<boolean>} whether notifications may be posted
 */
export const ensureTimerNotificationsReady = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // No `sound` on either channel on purpose. On an Android channel the field is a
      // filename to look up in the config plugin's sounds array, not a mode - passing
      // "default" made it hunt for a file called default. Leaving it out is what selects
      // the system's default sound.
      await Notifications.deleteNotificationChannelAsync(LEGACY_ALERT_CHANNEL_ID);
      await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
        name: 'Cooking timers',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        audioAttributes: {
          // Played as an alarm, so a phone on vibrate still lets it through
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          // FLAG_AUDIBILITY_ENFORCED: do not let a muted stream swallow it
          flags: {enforceAudibility: true, requestHardwareAudioVideoSynchronization: false},
        },
      });
      await Notifications.setNotificationChannelAsync(RUNNING_CHANNEL_ID, {
        name: 'Running cooking timers',
        // Low keeps it in the shade without a heads up banner or a sound
        importance: Notifications.AndroidImportance.LOW,
        enableVibrate: false,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      return true;
    }
    // Only ever ask once per app run: a second prompt cannot succeed anyway
    if (existing.canAskAgain && !permissionRequested) {
      permissionRequested = true;
      return (await Notifications.requestPermissionsAsync()).granted;
    }
    return false;
  } catch (error) {
    // Notifications are the bonus here, the timer itself still runs without them
    console.warn('Cooking timer notifications are unavailable', error);
    return false;
  }
};

/**
 * Whether an alarm can be booked to ring at the moment its timer is due.
 *
 * That takes the exact alarm grant ("Alarms & reminders"), which Android 14 and later no
 * longer give on install. Without it the library still schedules, but inexactly: Android
 * delivers it minutes late, and may not let it start the service that rings at all.
 *
 * @return {Promise<boolean>} true if alarms ring on time
 */
const canRingOnTime = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }
  try {
    return (await AlarmScheduler.getPermissionsAsync()).canScheduleExactAlarms;
  } catch {
    return false;
  }
};

/**
 * Opens the system page where the user allows the app to set alarms.
 *
 * Only ever on request: it leaves the app, and it returns before the user has answered.
 *
 * @return {Promise<void>} resolves once the page was asked to open
 */
export const openAlarmSettings = async (): Promise<void> => {
  try {
    await AlarmScheduler.openAlarmSettingsAsync();
  } catch {
    // No such page on this device
  }
};

/**
 * Rings the timer like an alarm clock.
 *
 * An alarm is not a notification: it plays its own sound on the alarm stream, which a phone
 * set to vibrate does not silence, and it keeps ringing until it is stopped. That is the
 * whole reason for it - a notification sound is exactly what the ringer mode suppresses.
 *
 * @param {string} timerKey identifies the alarm, so it can be replaced or called off
 * @param {number} endsAt when it should ring, as a timestamp
 * @param {TimerNotificationTexts} texts what it says while ringing
 * @param {TimerNotificationTarget} target the step it belongs to, carried through the alarm
 * @return {Promise<boolean>} whether the alarm was scheduled
 */
const scheduleAlarm = async (
    timerKey: string,
    endsAt: number,
    texts: TimerNotificationTexts,
    target: TimerNotificationTarget,
): Promise<boolean> => {
  // Android only for now: iOS schedules through AlarmKit, which needs its own usage
  // description and iOS 26, so it keeps the notification until that is set up.
  // An inexact alarm is not booked at all: it is what rang long after the timer was done,
  // or never. The caller falls back and tells the user how to allow alarms.
  if (!(await canRingOnTime())) {
    return false;
  }
  try {
    const ringsAt = new Date(endsAt);
    await AlarmScheduler.scheduleAlarmAsync({
      id: timerKey,
      // The timestamp is what actually schedules a one off alarm; the clock time is what
      // the api asks for and has to agree with it.
      timestamp: endsAt,
      hour: ringsAt.getHours(),
      minute: ringsAt.getMinutes(),
      title: texts.alertTitle,
      android: {
        alertTitle: texts.alertTitle,
        alertBody: texts.alertBody,
        stopButtonTitle: texts.stopLabel,
        // Both button titles have to be given: the library falls back to the English
        // "Stop" and "Open" when they are not.
        secondaryButtonTitle: texts.openLabel,
        // The step travels with the alarm, so tapping it can open the right one even if the
        // tap is what started the app.
        metadata: {recipeId: target.recipeId, stepIndex: target.stepIndex},
        // A pot does not need five minutes of ringing to be noticed
        maxRingDurationSeconds: 120,
      },
    });
    return true;
  } catch (error) {
    // Only a real failure lands here, and then a notification is better than nothing
    console.warn('Could not schedule the cooking alarm, falling back to a notification', error);
    return false;
  }
};

/**
 * Calls off an alarm, whether it is still waiting or already ringing.
 *
 * @param {string} timerKey the timer being stopped
 * @return {Promise<void>} resolves once it is gone
 */
const cancelAlarm = async (timerKey: string): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    await AlarmScheduler.cancelAlarmAsync(timerKey);
    await AlarmScheduler.completeNativeAlarmAsync(timerKey);
  } catch {
    // Never scheduled, already rung, or already stopped
  }
};

/**
 * Posts the reminder that a timer is running.
 *
 * @param {string} timerKey identifies the timer
 * @param {TimerNotificationTexts} texts what the reminder says
 * @param {TimerNotificationTarget} target the step to open when it is tapped
 * @return {Promise<void>} resolves once it is posted, or could not be
 */
const postRunningReminder = async (
    timerKey: string,
    texts: TimerNotificationTexts,
    target: TimerNotificationTarget,
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: runningId(timerKey),
      content: {
        title: texts.runningTitle,
        body: texts.runningBody,
        sound: false,
        data: {kind: 'running' satisfies TimerNotificationKind, ...target},
        // Dismissible on purpose. An ongoing notification cannot be swiped away, so one
        // left behind by an app that was killed mid timer would sit there for good.
        sticky: false,
        autoDismiss: false,
      },
      trigger: {channelId: RUNNING_CHANNEL_ID},
    });
  } catch (error) {
    console.warn('Could not post the running cooking timer notification', error);
  }
};

/**
 * Books a notification for when the timer is due, where an alarm cannot be booked.
 *
 * Without the exact alarm grant this one is inexact too, so {@link ringPendingAlertNow} rings
 * it on time instead whenever the app is open to notice.
 *
 * @param {string} timerKey identifies the timer
 * @param {number} endsAt when the timer is due, as a timestamp
 * @param {TimerNotificationTexts} texts what the notification says
 * @param {TimerNotificationTarget} target the step to open when it is tapped
 * @return {Promise<boolean>} whether it was booked
 */
const scheduleAlert = async (
    timerKey: string,
    endsAt: number,
    texts: TimerNotificationTexts,
    target: TimerNotificationTarget,
): Promise<boolean> => {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: alertId(timerKey),
      content: {
        title: texts.alertTitle,
        body: texts.alertBody,
        // `true` is the documented way to ask for the default sound. A string here is read
        // as a custom sound file on iOS, which is the same trap as the channel above.
        sound: true,
        data: {kind: 'alert' satisfies TimerNotificationKind, ...target},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: endsAt,
        channelId: ALERT_CHANNEL_ID,
      },
    });
    return true;
  } catch (error) {
    console.warn('Could not schedule the cooking timer notification', error);
    return false;
  }
};

/**
 * Puts a timer in the notification shade for as long as it runs, and books the alert.
 *
 * The reminder is posted straight away and says when the timer is due, rather than counting
 * down: Android only renders a live countdown through a chronometer that expo-notifications
 * does not expose, and a number written from the app would freeze as soon as the app stops
 * running - which is exactly when the shade is being read.
 *
 * @param {string} timerKey identifies the timer, and with it both notifications
 * @param {number} endsAt when the timer is due, as a timestamp
 * @param {TimerNotificationTexts} texts what each of the two notifications says
 * @param {TimerNotificationTarget} target the step to open when one of them is tapped
 * @return {Promise<TimerAnnouncement>} how the timer will announce itself
 */
export const startTimerNotifications = async (
    timerKey: string,
    endsAt: number,
    texts: TimerNotificationTexts,
    target: TimerNotificationTarget,
): Promise<TimerAnnouncement> => {
  const notificationsAllowed = await ensureTimerNotificationsReady();
  if (notificationsAllowed) {
    await postRunningReminder(timerKey, texts, target);
  }
  // Not held back by the notification permission: the alarm rings without it
  if (await scheduleAlarm(timerKey, endsAt, texts, target)) {
    return 'alarm';
  }
  // Where an alarm cannot be scheduled, a notification is the loudest thing available
  if (notificationsAllowed && await scheduleAlert(timerKey, endsAt, texts, target)) {
    return 'notification';
  }
  return 'none';
};

/**
 * Rings a timer's booked notification now, for a timer the app has just seen run out.
 *
 * Without the exact alarm grant Android delivers the booked one minutes after the timer is
 * done. Once the app has noticed, there is nothing to wait for.
 *
 * @param {string} timerKey the timer that is due
 * @return {Promise<void>} resolves once it rang, or there was nothing waiting
 */
export const ringPendingAlertNow = async (timerKey: string): Promise<void> => {
  try {
    const pending = (await Notifications.getAllScheduledNotificationsAsync())
        .find((request) => request.identifier === alertId(timerKey));
    if (!pending) {
      return;
    }
    await Notifications.cancelScheduledNotificationAsync(pending.identifier);
    await Notifications.scheduleNotificationAsync({
      identifier: pending.identifier,
      content: {
        title: pending.content.title ?? undefined,
        body: pending.content.body ?? undefined,
        sound: true,
        data: pending.content.data,
      },
      trigger: {channelId: ALERT_CHANNEL_ID},
    });
  } catch {
    // Already delivered, nothing left to ring
  }
};

/**
 * Books alarms for running timers that had to make do with a notification.
 *
 * Meant for whenever the app comes back, since that is how the user returns from allowing
 * alarms: timers started before then should ring on time as well.
 *
 * @param {CookingTimers} timers all running timers
 * @param {Function} textsFor what the alarm of a timer says
 * @return {Promise<void>} resolves once every one that can be is booked
 */
export const upgradeTimersToAlarms = async (
    timers: CookingTimers,
    // eslint-disable-next-line no-unused-vars
    textsFor: (timer: CookingTimer) => TimerNotificationTexts,
): Promise<void> => {
  const now = Date.now();
  const running = Object.keys(timers).filter((key) => !hasElapsed(timers[key], now));
  if (running.length === 0 || !(await canRingOnTime())) {
    return;
  }
  try {
    const booked = new Map((await AlarmScheduler.getScheduledAlarmsAsync())
        .map((alarm) => [alarm.id, alarm.timestamp]));
    await Promise.all(running.map(async (key) => {
      const timer = timers[key];
      const target = parseTimerKey(key);
      // Compared by time, because an alarm under this key may be left from an earlier run
      if (!target || booked.get(key) === timer.endsAt) {
        return;
      }
      if (await scheduleAlarm(key, timer.endsAt, textsFor(timer), target)) {
        await Notifications.cancelScheduledNotificationAsync(alertId(key));
      }
    }));
  } catch {
    // The notifications stay, they are still better than nothing
  }
};

/**
 * Takes the reminder out of the shade once the timer is no longer running.
 *
 * @param {string} timerKey the timer that has finished or been stopped
 * @return {Promise<void>} resolves once it is gone
 */
export const clearRunningTimerNotification = async (timerKey: string): Promise<void> => {
  try {
    await Notifications.dismissNotificationAsync(runningId(timerKey));
  } catch {
    // Already gone, nothing to take back
  }
};

/**
 * Clears reminders left behind by timers the app no longer knows about.
 *
 * The reminder is normally taken down when its timer finishes or is stopped, but both of
 * those need the app to be running. An app killed mid timer leaves one in the shade saying
 * a timer ends at a time that has long passed, and nothing would ever take it down. The
 * alarm itself is unaffected: it lives with the system and still rings.
 *
 * @param {string[]} activeTimerKeys the timers the app is still counting down
 * @return {Promise<void>} resolves once the stale ones are gone
 */
export const clearOrphanedRunningNotifications = async (activeTimerKeys: string[]): Promise<void> => {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    const stillRunning = new Set(activeTimerKeys.map(runningId));
    await Promise.all(
        presented
            .filter((notification) =>
              notification.request.content.data?.kind === 'running' &&
              !stillRunning.has(notification.request.identifier))
            .map((notification) => Notifications.dismissNotificationAsync(notification.request.identifier)),
    );
  } catch {
    // Nothing presented, or nothing we may look at
  }
};

/**
 * Takes back everything a timer put up, for one that is stopped before it is due.
 *
 * @param {string} timerKey the timer being stopped
 * @return {Promise<void>} resolves once both are gone
 */
export const stopTimerNotifications = async (timerKey: string): Promise<void> => {
  await clearRunningTimerNotification(timerKey);
  await cancelAlarm(timerKey);
  try {
    await Notifications.cancelScheduledNotificationAsync(alertId(timerKey));
  } catch {
    // Already fired or already gone
  }
};

/**
 * Calls back when the user taps one of the timer notifications.
 *
 * Uses the last response rather than a plain listener, so a tap that started the app cold is
 * handled as well as one that arrived while it was already running. Each response is acted
 * on once: the hook keeps handing back the same one until another arrives.
 *
 * @param {Function} onTap what to do with the step the notification came from
 */
// eslint-disable-next-line no-unused-vars
export const useTimerNotificationTap = (onTap: (target: TimerNotificationTarget) => void): void => {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | undefined>(undefined);

  useEffect(() => {
    const request = response?.notification.request;
    if (!request || handled.current === request.identifier) {
      return;
    }
    const target = readTimerNotificationTarget(request.content.data);
    if (target) {
      handled.current = request.identifier;
      onTap(target);
    }
  }, [response, onTap]);

  // An alarm hands off through the system rather than through a notification, and a cold
  // launch from the lock screen has no JS running to hear an event. The handoff is written
  // natively before any of ours runs, so it is read on every start and every return.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const readHandoff = async () => {
      try {
        const handoff = await AlarmScheduler.getPendingNativeAlarmHandoffAsync();
        const context = handoff ? null : await AlarmScheduler.getCurrentAlarmContextAsync();
        const alarmId = handoff?.alarmId ?? context?.id;
        if (!alarmId) {
          return;
        }
        // "Open" hands off to the app but deliberately keeps ringing until the app says it
        // has taken over - that is what completing it means. Without this the alarm carries
        // on sounding behind the step it just opened.
        await AlarmScheduler.completeNativeAlarmAsync(alarmId);

        // The alarm is scheduled under the timer's own key, so the step is in the id
        const target = parseTimerKey(alarmId);
        if (target) {
          onTap(target);
        }
        await AlarmScheduler.clearPendingNativeAlarmHandoffAsync();
      } catch {
        // Nothing was handed off
      }
    };

    readHandoff();
    const subscription = AppState.addEventListener('change', (state) => {
      state === 'active' && readHandoff();
    });
    return () => subscription.remove();
  }, [onTap]);
};
