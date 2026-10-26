/**
 * How much yeast or sourdough starter a dough needs to be ready to bake after a given schedule.
 *
 * The yeast in a dough makes gas at a rate that depends on temperature, and multiplies meanwhile, but far slower than
 * in a lab culture. The dough is ready once the gas reaches what the dough needs: p * (e^(k * I) - 1) / k = A, where
 * I is the yeast's rate summed over the schedule, k the share of its lab growth rate it reaches in dough, p the
 * leavener as fresh yeast in % of the flour and A the dough's need. The temperature response is the yeast's growth
 * curve, k is fitted to doughs' yeast amount against time. A is the median of what a kind of dough needs, as a quick
 * Blechpizza takes far more yeast than a slow Neapolitan; the starter's yeast content comes from sourdough breads.
 */
import {median} from '../numbers';

/** A part of the schedule spent at one temperature: on the counter, in a proofing box, in the fridge. */
export interface Stage {
  hours: number;
  temperatureC: number;
}

export type Leavener = 'yeast' | 'sourdough';

interface CardinalTemperatures {
  minC: number;
  optimumC: number;
  maxC: number;
}

/** Saccharomyces cerevisiae (baker's yeast). */
const BAKERS_YEAST: CardinalTemperatures = {minC: 2.84, optimumC: 32.27, maxC: 45.39};
/** Its growth rate at the optimum, per hour. */
const BAKERS_YEAST_RATE = 0.368;
/**
 * Sourdough yeast (Candida milleri): its own optimum and maximum, with baker's yeast's minimum and rate; the
 * starter's yeast content below is calibrated with them.
 */
const SOURDOUGH_YEAST: CardinalTemperatures = {minC: 2.84, optimumC: 27, maxC: 36};

/**
 * Yeast multiplies in dough at this share of its lab growth rate: fitted to ten series of yeast amount against time
 * (36 points). The fit is flat from 0 to 0.15; growth at the lab rate fits worst, and asked for up to
 * thirty times too little yeast in long schedules.
 */
const DOUGH_GROWTH_SHARE = 0.1;

/**
 * How fast a dough takes on a new temperature, in hours: dough balls need about 2.5 h on the counter
 * to warm from 4 °C to 10 °C, which an exponential approach with this time constant matches.
 */
export const DOUGH_TEMPERATURE_TIME_CONSTANT_H = 2.5 / Math.log((4 - 21) / (10 - 21));

/** What a dough needs: the gas, and the fresh yeast that 1 % ripe starter stands for. */
export interface Calibration {
  /** Fresh yeast % times the rate summed over the schedule. */
  gas: number;
  /** Fresh yeast % per 1 % ripe starter (100 % hydration). */
  starterYeast: number;
}

/** A dough's yeast as fresh yeast in % of the flour, and its schedule. */
export interface YeastSchedule {
  freshPercent: number;
  stages: Stage[];
}

const STEP_H = 0.05;

/**
 * The cardinal temperature model with inflection: 1 at the optimum, 0 outside.
 *
 * @param {number} temperatureC the temperature
 * @param {CardinalTemperatures} cardinal the organism's minimum, optimum and maximum
 * @return {number} the share of the optimal growth rate
 */
export const growthShare = (temperatureC: number, cardinal: CardinalTemperatures): number => {
  const {minC, optimumC, maxC} = cardinal;
  if (temperatureC <= minC || temperatureC >= maxC) {
    return 0;
  }
  const numerator = (temperatureC - maxC) * (temperatureC - minC) ** 2;
  const denominator = (optimumC - minC) *
    ((optimumC - minC) * (temperatureC - optimumC) - (optimumC - maxC) * (optimumC + minC - 2 * temperatureC));
  return numerator / denominator;
};

const growthRate = (leavener: Leavener, temperatureC: number) =>
  BAKERS_YEAST_RATE * growthShare(temperatureC, leavener === 'yeast' ? BAKERS_YEAST : SOURDOUGH_YEAST);

/**
 * The gas 1 % of fresh yeast makes over a schedule while it multiplies, with the dough taking on each stage's
 * temperature gradually.
 *
 * @param {Leavener} leavener yeast or sourdough
 * @param {Stage[]} stages the schedule, in order
 * @param {number} doughStartC the dough's temperature when mixed
 * @return {number} the gas, in hours of the yeast's optimal rate
 */
export const scheduleActivity = (leavener: Leavener, stages: Stage[], doughStartC: number): number => {
  let growth = 0;
  let dough = doughStartC;
  for (const stage of stages) {
    const start = dough;
    for (let t = 0; t < stage.hours; t += STEP_H) {
      const step = Math.min(STEP_H, stage.hours - t);
      const temperature = stage.temperatureC +
        (start - stage.temperatureC) * Math.exp(-(t + step / 2) / DOUGH_TEMPERATURE_TIME_CONSTANT_H);
      growth += growthRate(leavener, temperature) * step;
    }
    dough = stage.temperatureC + (start - stage.temperatureC) * Math.exp(-stage.hours / DOUGH_TEMPERATURE_TIME_CONSTANT_H);
  }
  return (Math.exp(DOUGH_GROWTH_SHARE * growth) - 1) / DOUGH_GROWTH_SHARE;
};

/**
 * The gas a kind of dough needs: the median of what its doughs need.
 *
 * @param {YeastSchedule[]} schedules the doughs' yeast schedules
 * @param {Function} startC the dough's temperature after mixing, for a schedule
 * @return {number} fresh yeast % times summed rate
 */
export const gasNeeded = (schedules: readonly YeastSchedule[], startC: (stages: Stage[]) => number): number =>
  median(schedules.map((schedule) => schedule.freshPercent * scheduleActivity('yeast', schedule.stages,
      startC(schedule.stages))))!;

/**
 * How much leavener makes a dough ready to bake at the end of a schedule.
 *
 * @param {Calibration} calibration what the dough needs
 * @param {Leavener} leavener yeast or sourdough
 * @param {Stage[]} stages the schedule, in order
 * @param {number} doughStartC the dough's temperature when mixed
 * @return {number} fresh yeast, or ripe starter (100 % hydration), in % of the flour; Infinity when the
 *   schedule is too cold or too short for any amount
 */
export const leavenerPercent = (calibration: Calibration, leavener: Leavener, stages: Stage[],
    doughStartC: number): number => {
  const activity = scheduleActivity(leavener, stages, doughStartC);
  if (activity <= 0) {
    return Infinity;
  }
  const freshYeast = calibration.gas / activity;
  return leavener === 'yeast' ? freshYeast : freshYeast / calibration.starterYeast;
};

/**
 * How long a dough takes at one temperature with a given amount of leavener.
 *
 * @param {Calibration} calibration what the dough needs
 * @param {Leavener} leavener yeast or sourdough
 * @param {number} percent fresh yeast, or ripe starter, in % of the flour
 * @param {number} temperatureC the dough's temperature throughout
 * @return {number} hours until ready to bake; Infinity when too cold
 */
export const hoursUntilReady = (calibration: Calibration, leavener: Leavener, percent: number,
    temperatureC: number): number => {
  const rate = growthRate(leavener, temperatureC);
  const freshYeast = leavener === 'yeast' ? percent : percent * calibration.starterYeast;
  return rate > 0 ? Math.log(1 + DOUGH_GROWTH_SHARE * calibration.gas / freshYeast) / (DOUGH_GROWTH_SHARE * rate) :
    Infinity;
};

