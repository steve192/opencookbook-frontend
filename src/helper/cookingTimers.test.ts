import {describe, expect, it} from 'vitest';
import {
  CookingTimers,
  elapsedTimerKeys,
  formatEndTime,
  parseTimerKey,
  readTimerNotificationTarget,
  hasElapsed,
  runningTimerCount,
  secondsRemaining,
  timerKey,
} from './cookingTimers';

const NOW = 1_700_000_000_000;

const timer = (endsInSeconds: number) => ({
  label: '5 minutes',
  endsAt: NOW + endsInSeconds * 1000,
  recipeTitle: 'Lasagne',
  stepIndex: 2,
});

describe('timerKey', () => {
  it('identifies a timer by what it counts down', () => {
    expect(timerKey(7, 2, 300)).toBe('7-2-300');
  });

  it('keeps two durations on the same step apart', () => {
    expect(timerKey(7, 2, 300)).not.toBe(timerKey(7, 2, 600));
  });

  it('keeps the same duration on different steps apart', () => {
    expect(timerKey(7, 2, 300)).not.toBe(timerKey(7, 3, 300));
  });
});

describe('secondsRemaining', () => {
  it('counts down from the end time', () => {
    expect(secondsRemaining(timer(300), NOW)).toBe(300);
  });

  // The point of storing the end rather than a countdown: time passes while the screen is
  // gone, and the timer has to have lost exactly that much when it comes back.
  it('has lost the time that passed while nothing was watching', () => {
    expect(secondsRemaining(timer(300), NOW + 120_000)).toBe(180);
  });

  it('never goes below zero', () => {
    expect(secondsRemaining(timer(10), NOW + 60_000)).toBe(0);
  });

  it('rounds a part second up, so a timer never shows zero while it still runs', () => {
    expect(secondsRemaining(timer(300), NOW + 500)).toBe(300);
  });
});

describe('hasElapsed', () => {
  it('is false while the timer runs', () => {
    expect(hasElapsed(timer(1), NOW)).toBe(false);
  });

  it('is true at the moment it is due', () => {
    expect(hasElapsed(timer(0), NOW)).toBe(true);
  });

  it('is true afterwards', () => {
    expect(hasElapsed(timer(10), NOW + 60_000)).toBe(true);
  });
});

describe('elapsedTimerKeys', () => {
  const timers: CookingTimers = {
    done: timer(-10),
    running: timer(300),
    alsoDone: timer(0),
  };

  it('reports only the timers that are due', () => {
    expect(elapsedTimerKeys(timers, NOW).sort()).toEqual(['alsoDone', 'done']);
  });

  it('reports nothing when everything still runs', () => {
    expect(elapsedTimerKeys({running: timer(300)}, NOW)).toEqual([]);
  });

  it('handles having no timers at all', () => {
    expect(elapsedTimerKeys({}, NOW)).toEqual([]);
  });
});

describe('runningTimerCount', () => {
  it('counts only what is still counting down', () => {
    expect(runningTimerCount({done: timer(-1), a: timer(60), b: timer(120)}, NOW)).toBe(2);
  });

  it('is zero when nothing runs', () => {
    expect(runningTimerCount({}, NOW)).toBe(0);
  });
});

describe('formatEndTime', () => {
  // A notification cannot tick, so the time it carries is a clock time, not a countdown
  it('shows the clock time the timer is due, without seconds', () => {
    const at = new Date(2026, 7, 31, 14, 32, 45).getTime();
    expect(formatEndTime(at, 'de-DE')).toBe('14:32');
  });

  it('pads a single digit hour', () => {
    const at = new Date(2026, 7, 31, 9, 5, 0).getTime();
    expect(formatEndTime(at, 'de-DE')).toBe('09:05');
  });
});

describe('readTimerNotificationTarget', () => {
  it('reads the recipe and step a timer belongs to', () => {
    expect(readTimerNotificationTarget({kind: 'alert', recipeId: 7, stepIndex: 2}))
        .toEqual({recipeId: 7, stepIndex: 2});
  });

  it('reads the first step', () => {
    expect(readTimerNotificationTarget({recipeId: 7, stepIndex: 0}))
        .toEqual({recipeId: 7, stepIndex: 0});
  });

  // The payload comes back untyped and may be from a notification that is not ours at all
  it('ignores a payload without a target', () => {
    expect(readTimerNotificationTarget({kind: 'alert'})).toBeUndefined();
    expect(readTimerNotificationTarget({recipeId: 7})).toBeUndefined();
    expect(readTimerNotificationTarget(undefined)).toBeUndefined();
    expect(readTimerNotificationTarget(null)).toBeUndefined();
    expect(readTimerNotificationTarget('nonsense')).toBeUndefined();
  });

  it('ignores values of the wrong type', () => {
    expect(readTimerNotificationTarget({recipeId: '7', stepIndex: 2})).toBeUndefined();
    expect(readTimerNotificationTarget({recipeId: 7, stepIndex: '2'})).toBeUndefined();
  });

  it('ignores a step that cannot exist', () => {
    expect(readTimerNotificationTarget({recipeId: 7, stepIndex: -1})).toBeUndefined();
  });
});

describe('parseTimerKey', () => {
  // The key is also the id the alarm is scheduled under, so it has to survive the round trip
  it('reads back what timerKey put in', () => {
    expect(parseTimerKey(timerKey(7, 2, 300))).toEqual({recipeId: 7, stepIndex: 2});
  });

  it('reads back the first step', () => {
    expect(parseTimerKey(timerKey(1, 0, 60))).toEqual({recipeId: 1, stepIndex: 0});
  });

  it('ignores a key it did not make', () => {
    expect(parseTimerKey('nonsense')).toBeUndefined();
    expect(parseTimerKey('7-2')).toBeUndefined();
    expect(parseTimerKey('7-2-300-4')).toBeUndefined();
    expect(parseTimerKey('a-b-c')).toBeUndefined();
  });
});
