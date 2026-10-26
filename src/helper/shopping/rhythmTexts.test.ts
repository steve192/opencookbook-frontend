import {describe, expect, it} from 'vitest';
import {daysSince} from './rhythmTexts';

describe('rhythmTexts', () => {
  it('counts calendar days, so last night is yesterday', () => {
    const now = new Date(2026, 9, 26, 9, 0);

    expect(daysSince(new Date(2026, 9, 26, 7, 0).toISOString(), now)).toBe(0);
    expect(daysSince(new Date(2026, 9, 25, 23, 30).toISOString(), now)).toBe(1);
    expect(daysSince(new Date(2026, 9, 18, 12, 0).toISOString(), now)).toBe(8);
  });
});
