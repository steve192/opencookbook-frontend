import {describe, expect, it} from 'vitest';
import {isDismissed, notNowUntil} from './installDismissal';

const NOW = Date.parse('2026-09-30T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

describe('install banner dismissal', () => {
  it('shows the banner when it was never answered', () => {
    expect(isDismissed(null, null, NOW)).toBe(false);
  });

  it('keeps it away for a week after "Not now"', () => {
    const until = String(notNowUntil(NOW));
    expect(isDismissed(null, until, NOW + 6 * DAY)).toBe(true);
    expect(isDismissed(null, until, NOW + 7 * DAY + 1)).toBe(false);
  });

  it('keeps it away for good after "Don\'t ask again"', () => {
    expect(isDismissed('1', null, NOW + 365 * DAY)).toBe(true);
  });
});
