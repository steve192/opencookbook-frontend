import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {CookingTimer} from './cookingTimers';

// Every dependency here is a native module that does not resolve under the node test
// environment, so what the device would answer is set per test instead.
const device = vi.hoisted(() => ({
  notificationsGranted: true,
  exactAlarms: true,
}));

const notifications = vi.hoisted(() => ({
  setNotificationHandler: vi.fn(),
  deleteNotificationChannelAsync: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  getPermissionsAsync: vi.fn(async () => ({granted: device.notificationsGranted, canAskAgain: false})),
  requestPermissionsAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  getAllScheduledNotificationsAsync: vi.fn(async (): Promise<unknown[]> => []),
  dismissNotificationAsync: vi.fn(),
  getPresentedNotificationsAsync: vi.fn(async () => []),
  useLastNotificationResponse: vi.fn(),
  AndroidImportance: {HIGH: 4, LOW: 2},
  AndroidAudioUsage: {ALARM: 4},
  AndroidAudioContentType: {SONIFICATION: 4},
  SchedulableTriggerInputTypes: {DATE: 'date'},
}));

const alarms = vi.hoisted(() => ({
  getPermissionsAsync: vi.fn(async () => ({canScheduleExactAlarms: device.exactAlarms})),
  scheduleAlarmAsync: vi.fn(),
  getScheduledAlarmsAsync: vi.fn(async (): Promise<{id: string, timestamp: number}[]> => []),
  cancelAlarmAsync: vi.fn(),
  completeNativeAlarmAsync: vi.fn(),
  openAlarmSettingsAsync: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: {OS: 'android'},
  AppState: {addEventListener: vi.fn()},
}));
vi.mock('expo-notifications', () => notifications);
vi.mock('react-native-alarm-scheduler', () => ({default: alarms}));

const {ringPendingAlertNow, startTimerNotifications, upgradeTimersToAlarms} = await import('./timerNotifications');

const texts = {
  runningTitle: 'Timer running',
  runningBody: 'Ends at 14:32',
  alertTitle: 'Timer done',
  alertBody: 'Lasagne, step 3',
  stopLabel: 'Stop',
  openLabel: 'Open',
};
const target = {recipeId: 7, stepIndex: 2};
const KEY = '7-2-300';

const scheduledIds = () =>
  notifications.scheduleNotificationAsync.mock.calls.map(([request]) => (request as {identifier: string}).identifier);

beforeEach(() => {
  vi.clearAllMocks();
  device.notificationsGranted = true;
  device.exactAlarms = true;
});

describe('startTimerNotifications', () => {
  it('rings as an alarm when alarms may ring on time', async () => {
    const endsAt = Date.now() + 300_000;
    expect(await startTimerNotifications(KEY, endsAt, texts, target)).toBe('alarm');
    expect(alarms.scheduleAlarmAsync).toHaveBeenCalledWith(expect.objectContaining({id: KEY, timestamp: endsAt}));
    expect(scheduledIds()).toEqual([`${KEY}-running`]);
  });

  // Booked anyway, Android would defer it by minutes and might not let it ring at all
  it('books no alarm without the exact alarm grant', async () => {
    device.exactAlarms = false;
    expect(await startTimerNotifications(KEY, Date.now() + 300_000, texts, target)).toBe('notification');
    expect(alarms.scheduleAlarmAsync).not.toHaveBeenCalled();
    expect(scheduledIds()).toEqual([`${KEY}-running`, `${KEY}-alert`]);
  });

  it('still rings as an alarm when notifications are refused', async () => {
    device.notificationsGranted = false;
    expect(await startTimerNotifications(KEY, Date.now() + 300_000, texts, target)).toBe('alarm');
    expect(alarms.scheduleAlarmAsync).toHaveBeenCalled();
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('reports that nothing will announce the timer when neither is allowed', async () => {
    device.notificationsGranted = false;
    device.exactAlarms = false;
    expect(await startTimerNotifications(KEY, Date.now() + 300_000, texts, target)).toBe('none');
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('ringPendingAlertNow', () => {
  it('rings a notification that is still waiting straight away', async () => {
    notifications.getAllScheduledNotificationsAsync.mockResolvedValueOnce([{
      identifier: `${KEY}-alert`,
      content: {title: 'Timer done', body: 'Lasagne, step 3', data: {kind: 'alert', ...target}},
    }]);
    await ringPendingAlertNow(KEY);
    expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(`${KEY}-alert`);
    const [request] = notifications.scheduleNotificationAsync.mock.calls[0] as unknown as [{trigger: object, content: object}];
    // Without a date the trigger means now
    expect(request.trigger).toEqual({channelId: 'cooking-timer-alarm'});
    expect(request.content).toEqual(expect.objectContaining({title: 'Timer done', data: {kind: 'alert', ...target}}));
  });

  it('leaves everything alone when nothing is waiting', async () => {
    await ringPendingAlertNow(KEY);
    expect(notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('upgradeTimersToAlarms', () => {
  const timer = (endsInMs: number): CookingTimer => ({
    label: '5 minutes',
    endsAt: Date.now() + endsInMs,
    recipeTitle: 'Lasagne',
    stepIndex: 2,
  });
  const textsFor = () => texts;

  it('books an alarm for a running timer and withdraws its notification', async () => {
    const running = timer(120_000);
    await upgradeTimersToAlarms({[KEY]: running}, textsFor);
    expect(alarms.scheduleAlarmAsync).toHaveBeenCalledWith(expect.objectContaining({id: KEY, timestamp: running.endsAt}));
    expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(`${KEY}-alert`);
  });

  it('does nothing while alarms still may not ring on time', async () => {
    device.exactAlarms = false;
    await upgradeTimersToAlarms({[KEY]: timer(120_000)}, textsFor);
    expect(alarms.scheduleAlarmAsync).not.toHaveBeenCalled();
    expect(notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });

  it('leaves a timer alone that already has its alarm', async () => {
    const running = timer(120_000);
    alarms.getScheduledAlarmsAsync.mockResolvedValueOnce([{id: KEY, timestamp: running.endsAt}]);
    await upgradeTimersToAlarms({[KEY]: running}, textsFor);
    expect(alarms.scheduleAlarmAsync).not.toHaveBeenCalled();
  });

  // Alarms stay listed after ringing, so the same key can still hold the last run's alarm
  it('books over an alarm left from an earlier run of the same timer', async () => {
    const running = timer(120_000);
    alarms.getScheduledAlarmsAsync.mockResolvedValueOnce([{id: KEY, timestamp: running.endsAt - 600_000}]);
    await upgradeTimersToAlarms({[KEY]: running}, textsFor);
    expect(alarms.scheduleAlarmAsync).toHaveBeenCalled();
  });

  it('skips a timer that has already run out', async () => {
    await upgradeTimersToAlarms({[KEY]: timer(-1_000)}, textsFor);
    expect(alarms.scheduleAlarmAsync).not.toHaveBeenCalled();
  });
});
