import {describe, expect, it} from 'vitest';
import {gasNeeded, growthShare, hoursUntilReady, leavenerPercent, scheduleActivity} from './fermentation';

const YEAST = {minC: 2.84, optimumC: 32.27, maxC: 45.39};
const CALIBRATION = {gas: 1, starterYeast: 0.03};

describe('growthShare', () => {
  it('is 1 at the optimum and 0 at the edges', () => {
    expect(growthShare(32.27, YEAST)).toBeCloseTo(1);
    expect(growthShare(2.84, YEAST)).toBe(0);
    expect(growthShare(45.39, YEAST)).toBe(0);
  });

  it('grows with the temperature up to the optimum', () => {
    expect(growthShare(5, YEAST)).toBeLessThan(growthShare(20, YEAST));
    expect(growthShare(20, YEAST)).toBeLessThan(growthShare(30, YEAST));
  });
});

describe('gasNeeded', () => {
  it('is the median of what the recipes need', () => {
    const stages = [{hours: 10, temperatureC: 20}];
    const gas = (percent: number) => percent * scheduleActivity('yeast', stages, 20);
    expect(gasNeeded([0.1, 0.2, 0.9].map((freshPercent) => ({freshPercent, stages})), () => 20))
        .toBeCloseTo(gas(0.2));
  });
});

describe('leavenerPercent', () => {
  it('needs about twice the yeast for half a short time, and more for half a long one, as the yeast multiplies', () => {
    const at20 = (hours: number) => leavenerPercent(CALIBRATION, 'yeast', [{hours, temperatureC: 20}], 20);
    expect(at20(1) / at20(2)).toBeCloseTo(2, 0);
    expect(at20(12) / at20(24)).toBeGreaterThan(at20(1) / at20(2));
  });

  it('needs less yeast for a warmer schedule', () => {
    expect(leavenerPercent(CALIBRATION, 'yeast', [{hours: 8, temperatureC: 24}], 24))
        .toBeLessThan(leavenerPercent(CALIBRATION, 'yeast', [{hours: 8, temperatureC: 20}], 20));
  });

  it('counts a starter by the fresh yeast it stands for', () => {
    const stages = [{hours: 8, temperatureC: 20}];
    const starter = leavenerPercent(CALIBRATION, 'sourdough', stages, 20);
    expect(starter * CALIBRATION.starterYeast * scheduleActivity('sourdough', stages, 20)).toBeCloseTo(1);
  });

  it('cannot leaven a dough that never gets warm enough', () => {
    expect(leavenerPercent(CALIBRATION, 'yeast', [{hours: 5, temperatureC: 1}], 1)).toBe(Infinity);
  });
});

describe('hoursUntilReady', () => {
  it('is the time the amount needs at one temperature', () => {
    const percent = leavenerPercent(CALIBRATION, 'yeast', [{hours: 12, temperatureC: 21}], 21);
    expect(hoursUntilReady(CALIBRATION, 'yeast', percent, 21)).toBeCloseTo(12, 1);
  });
});

describe('schedules', () => {
  it('lets the dough take on the fridge temperature gradually', () => {
    const straightIntoTheCold = scheduleActivity('yeast', [{hours: 10, temperatureC: 4}], 4);
    const fromTheCounter = scheduleActivity('yeast', [{hours: 10, temperatureC: 4}], 24);
    expect(fromTheCounter).toBeGreaterThan(straightIntoTheCold * 5);
  });
});
