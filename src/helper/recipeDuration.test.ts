import {describe, expect, it} from 'vitest';
import {findStepDurations, formatCountdown, formatDuration} from './recipeDuration';

describe('formatDuration', () => {
  it('shows minutes on their own', () => {
    expect(formatDuration(35)).toBe('35 min');
  });

  it('shows whole hours without minutes', () => {
    expect(formatDuration(120)).toBe('2 h');
  });

  it('shows hours and minutes together', () => {
    expect(formatDuration(75)).toBe('1 h 15 min');
  });

  // A recipe that never had a time must not render an empty chip
  it('has nothing to show for a missing duration', () => {
    expect(formatDuration(undefined)).toBeUndefined();
    expect(formatDuration(null)).toBeUndefined();
    expect(formatDuration(0)).toBeUndefined();
  });
});

describe('findStepDurations', () => {
  const secondsIn = (step: string) => findStepDurations(step).map((duration) => duration.seconds);

  it('finds minutes', () => {
    expect(secondsIn('Fry for 5 minutes.')).toEqual([300]);
  });

  it('finds the German spelling', () => {
    expect(secondsIn('Etwa 20 Minuten backen.')).toEqual([1200]);
  });

  it('finds an abbreviated unit', () => {
    expect(secondsIn('Simmer 45 min.')).toEqual([2700]);
  });

  it('converts hours to minutes', () => {
    expect(secondsIn('Rest for 2 hours.')).toEqual([7200]);
    expect(secondsIn('2 Stunden ruhen lassen.')).toEqual([7200]);
  });

  it('converts a fractional hour', () => {
    expect(secondsIn('Rest for 1,5 Stunden.')).toEqual([5400]);
  });

  // Being called back at the start of the range still leaves time to react
  it('takes the lower bound of a range', () => {
    expect(secondsIn('Simmer for 20-25 minutes.')).toEqual([1200]);
    expect(secondsIn('20 bis 25 Minuten köcheln.')).toEqual([1200]);
  });

  it('finds several durations in one step', () => {
    expect(secondsIn('Fry 5 minutes, then bake 40 minutes.')).toEqual([300, 2400]);
  });

  it('offers a duration only once', () => {
    expect(secondsIn('Wait 10 minutes, then another 10 minutes.')).toEqual([600]);
  });

  it('keeps the wording it found, for the button label', () => {
    expect(findStepDurations('Bake for 40 minutes.')[0].label).toBe('40 minutes');
  });

  it('ignores anything under a minute', () => {
    expect(secondsIn('Stir for 30 seconds.')).toEqual([]);
  });

  it('keeps a sub minute unit exact rather than rounding it to whole minutes', () => {
    expect(secondsIn('Blanch for 90 seconds.')).toEqual([90]);
  });

  it('finds nothing in a step without a duration', () => {
    expect(secondsIn('Chop the onions finely.')).toEqual([]);
  });

  // "180 g" and "200 C" are not durations
  it('ignores numbers that carry another unit', () => {
    expect(secondsIn('Add 180 g flour and heat to 200 degrees.')).toEqual([]);
  });
});

describe('formatCountdown', () => {
  it('pads the seconds', () => {
    expect(formatCountdown(305)).toBe('5:05');
  });

  it('shows a whole minute', () => {
    expect(formatCountdown(300)).toBe('5:00');
  });

  it('shows less than a minute', () => {
    expect(formatCountdown(9)).toBe('0:09');
  });

  it('never goes below zero', () => {
    expect(formatCountdown(-5)).toBe('0:00');
  });
});
