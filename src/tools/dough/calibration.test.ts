import {describe, expect, it} from 'vitest';
import {SOURDOUGH_BREADS, YEAST_BREADS} from '../bread/breadData';
import {hoursUntilReady, leavenerPercent, YeastSchedule} from '../fermentation/fermentation';
import {PIZZA_STYLES, PIZZA_YEAST_SCHEDULES, STYLES} from '../pizza/pizzaData';
import {BREAD_CALIBRATION, pizzaCalibration, recommendedDoughC} from './calibration';

// A dough's yeast in % of the flour against what the model asks for on its schedule.
const ratios = (schedules: readonly YeastSchedule[]) => schedules.map((schedule) => schedule.freshPercent /
  leavenerPercent(pizzaCalibration(schedules), 'yeast', schedule.stages, recommendedDoughC('pizza', schedule.stages)));

describe('the pizza calibration', () => {
  it('lands within a factor of 3.5 of every dough of a style, which disagree by up to six', () => {
    for (const style of PIZZA_STYLES) {
      for (const ratio of ratios(STYLES[style].yeastSchedules ?? PIZZA_YEAST_SCHEDULES)) {
        expect(ratio).toBeGreaterThan(1 / 3.5);
        expect(ratio).toBeLessThan(3.5);
      }
    }
  });

  it('asks a quick Blechpizza for far more yeast than a slow Neapolitan', () => {
    const gas = (schedules?: YeastSchedule[]) => pizzaCalibration(schedules!).gas;
    expect(gas(STYLES.blechpizza.yeastSchedules) / gas(STYLES.neapolitan.yeastSchedules)).toBeGreaterThan(3);
  });

  it('stays inside the Neapolitan 0.1 to 3 g fresh yeast per litre of water for 12 to 24 h at 19 °C', () => {
    const neapolitan = pizzaCalibration(STYLES.neapolitan.yeastSchedules!);
    for (const hours of [12, 24]) {
      const grams = leavenerPercent(neapolitan, 'yeast', [{hours, temperatureC: 19}], 19) / 100 * 1700;
      expect(grams).toBeGreaterThanOrEqual(0.1);
      expect(grams).toBeLessThanOrEqual(3);
    }
  });
});

describe('the bread calibration', () => {
  it('lands within a factor of 2.5 of every yeast bread, from 1.5 h to 20 h', () => {
    for (const bread of YEAST_BREADS) {
      const ratio = bread.freshPercent / leavenerPercent(BREAD_CALIBRATION, 'yeast', bread.stages,
          recommendedDoughC('bread', bread.stages));
      expect(ratio).toBeGreaterThan(1 / 2.5);
      expect(ratio).toBeLessThan(2.5);
    }
  });

  it('lands within a factor of 1.5 of every sourdough bread', () => {
    for (const bread of SOURDOUGH_BREADS) {
      const ratio = bread.starterPercent / leavenerPercent(BREAD_CALIBRATION, 'sourdough', bread.stages,
          recommendedDoughC('bread', bread.stages));
      expect(ratio).toBeGreaterThan(1 / 1.5);
      expect(ratio).toBeLessThan(1.5);
    }
  });

  it('takes a 20 % starter dough a whole working day at 21 °C, as sourdough charts give bulk plus proof', () => {
    const hours = hoursUntilReady(BREAD_CALIBRATION, 'sourdough', 20, 21);
    expect(hours).toBeGreaterThan(7);
    expect(hours).toBeLessThan(11);
  });
});
