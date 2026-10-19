/** What pizza and bread doughs share: the formula, the leavener, the water temperature and the timeline. */
import {Calibration, leavenerPercent, Stage} from '../fermentation/fermentation';
import {median} from '../sources';
import {convertYeast, YeastType} from '../yeast/yeast';

export type DoughLeavener = YeastType | 'sourdough';

export const DOUGH_LEAVENERS: readonly DoughLeavener[] = ['fresh', 'instant', 'activeDry', 'sourdough'];

/** Baker's percentages of a dough, as fractions of the total flour. */
export interface DoughFormula {
  hydration: number;
  salt: number;
  oil: number;
  sugar: number;
}

/** Something added to a dough that brings water: purée, quark, eggs. */
export interface WaterAddition {
  grams: number;
  /** Grams of water per 100 g the dough takes from it. */
  waterPer100g: number;
}

export interface DoughAmounts {
  /** All the flour, including the flour in the starter. */
  totalFlour: number;
  /** Flour to weigh in, without the starter's. */
  flour: number;
  /** Water to weigh in: without the starter's and the additions' water. */
  water: number;
  salt: number;
  oil: number;
  sugar: number;
  /** Grams of the chosen yeast, or of ripe starter. */
  leavener: number;
  /** The leavener in % of the total flour. */
  leavenerPercent: number;
  /** Water the additions bring, already taken off the water to weigh in. */
  additionWater: number;
  /** Water the starter and additions bring beyond what the dough takes: it comes out that much wetter. */
  excessWater: number;
  total: number;
}

/** Ripe starter as fed: equal flour and water. */
const STARTER_HYDRATION = 1;

/** Recipes use 10 to 30 % and 20 to 40 % ripe starter; a schedule that needs more is too short for sourdough. */
const MAX_STARTER_PERCENT = 40;

/**
 * How much leavener a schedule needs, in the leavener's own grams per 100 g of flour.
 *
 * @param {Calibration} calibration what the dough needs
 * @param {DoughLeavener} leavener the yeast at hand or sourdough
 * @param {Stage[]} stages the schedule
 * @param {number} doughStartC the dough's temperature after mixing
 * @return {number} % of the flour; Infinity when no amount makes the schedule
 */
export const leavenerNeeded = (calibration: Calibration, leavener: DoughLeavener, stages: Stage[],
    doughStartC: number): number => {
  if (leavener === 'sourdough') {
    const starter = leavenerPercent(calibration, 'sourdough', stages, doughStartC);
    return starter <= MAX_STARTER_PERCENT ? starter : Infinity;
  }
  return convertYeast(leavenerPercent(calibration, 'yeast', stages, doughStartC), 'fresh', leavener);
};

/**
 * Weighs a dough out, from its total flour or its total weight.
 *
 * @param {DoughFormula} formula the baker's percentages
 * @param {DoughLeavener} leavener what leavens it
 * @param {number} leavenerPct the leavener in % of the flour
 * @param {object} size total flour or total dough weight, in grams
 * @param {WaterAddition[]} additions additions that bring water
 * @return {DoughAmounts} what to weigh
 */
export const weighDough = (formula: DoughFormula, leavener: DoughLeavener, leavenerPct: number,
    size: {flour: number} | {dough: number}, additions: WaterAddition[] = []): DoughAmounts => {
  const leavenerShare = leavenerPct / 100;
  const additionGrams = additions.reduce((sum, addition) => sum + addition.grams, 0);
  // A starter is flour and water already, so only commercial yeast adds weight of its own.
  const ownWeight = leavener === 'sourdough' ? 0 : leavenerShare;
  const perFlour = 1 + formula.hydration + formula.salt + formula.oil + formula.sugar + ownWeight;
  const totalFlour = 'flour' in size ? size.flour : Math.max(0, size.dough - additionGrams) / perFlour;
  const starter = leavener === 'sourdough' ? leavenerShare * totalFlour : 0;
  const starterFlour = starter / (1 + STARTER_HYDRATION);
  const additionWater = additions.reduce((sum, addition) => sum + addition.grams * addition.waterPer100g / 100, 0);
  const missingWater = formula.hydration * totalFlour - (starter - starterFlour) - additionWater;
  return {
    totalFlour,
    flour: totalFlour - starterFlour,
    water: Math.max(0, missingWater),
    salt: formula.salt * totalFlour,
    oil: formula.oil * totalFlour,
    sugar: formula.sugar * totalFlour,
    leavener: leavenerShare * totalFlour,
    leavenerPercent: leavenerPct,
    additionWater,
    excessWater: Math.max(0, -missingWater),
    total: totalFlour * perFlour + additionGrams,
  };
};

export type Kneading = 'hand' | 'machine';

export const KNEADINGS: readonly Kneading[] = ['hand', 'machine'];

/** What mixing adds to the dough's temperature, in °F: by hand 6 to 8, 5 and 5; in a stand mixer 22 to 24, 20 and 25. */
const FRICTION_F: Record<Kneading, number[]> = {hand: [7, 5, 5], machine: [23, 20, 25]};

export const FRICTION_C: Record<Kneading, number> = {
  hand: median(FRICTION_F.hand)! * 5 / 9,
  machine: median(FRICTION_F.machine)! * 5 / 9,
};

/** Minutes of mixing and kneading, as recipes give them: by hand 8 and 5; in a stand mixer 7, 6, 7 and 15. */
export const KNEAD_MINUTES: Record<Kneading, number> = {hand: median([8, 5])!, machine: median([7, 6, 7, 15])!};

/**
 * The water temperature that brings a dough to the wanted temperature: three times the target, less
 * room, flour and friction; with a starter four times, less its temperature as well.
 *
 * @param {object} temperatures target, room, flour and, for sourdough, starter temperature in °C
 * @param {'hand' | 'machine'} kneading how it is mixed
 * @return {number} the water temperature in °C
 */
export const waterTemperature = (temperatures: {targetC: number, roomC: number, flourC: number, starterC?: number},
    kneading: 'hand' | 'machine'): number => {
  const {targetC, roomC, flourC, starterC} = temperatures;
  return starterC == null ?
    3 * targetC - roomC - flourC - FRICTION_C[kneading] :
    4 * targetC - roomC - flourC - starterC - FRICTION_C[kneading];
};

/** When each step of a schedule starts, counted back from when the dough is baked. */
export interface TimelineStep {
  /** 'mix' first, then one per stage; the stage's temperature says whether it is the fridge. */
  kind: 'mix' | 'stage' | 'bake';
  at: Date;
  stage?: Stage;
}

/**
 * The schedule as clock times, ending when the dough goes into the oven.
 *
 * @param {Stage[]} stages the schedule
 * @param {Date} bakeAt when it is baked
 * @param {Kneading} kneading by hand or in a stand mixer, which decides how long mixing takes
 * @return {TimelineStep[]} mixing, each stage and baking, in order
 */
export const timeline = (stages: Stage[], bakeAt: Date, kneading: Kneading): TimelineStep[] => {
  const totalHours = stages.reduce((sum, stage) => sum + stage.hours, 0);
  let at = bakeAt.getTime() - totalHours * 3_600_000;
  const steps: TimelineStep[] = [{kind: 'mix', at: new Date(at - KNEAD_MINUTES[kneading] * 60_000)}];
  for (const stage of stages) {
    steps.push({kind: 'stage', at: new Date(at), stage});
    at += stage.hours * 3_600_000;
  }
  steps.push({kind: 'bake', at: new Date(at)});
  return steps;
};

/** The smallest amount a kitchen scale weighs. */
const SMALLEST_WEIGHABLE_G = 0.1;

export const isTooLittleToWeigh = (grams: number): boolean => grams > 0 && grams < SMALLEST_WEIGHABLE_G;

/** The most yeast published recipes use: 42 g fresh for 600 g flour and 21 g for 300 g, both Blechpizza. */
const MAX_FRESH_YEAST_PERCENT = 7;

/** Yeast starts to die at about 45 °C. */
const YEAST_DAMAGE_C = 45;

export type DoughWarning = 'tooMuchYeast' | 'waterTooHot' | 'waterTooCold';

/**
 * What makes a dough unlikely to work, whatever it is: more yeast than recipes use, or water too hot for the yeast
 * or colder than ice water.
 *
 * @param {number} freshYeastPercent the yeast as fresh yeast, in % of the flour; 0 for sourdough
 * @param {number} waterC the water temperature the dough needs
 * @return {DoughWarning[]} the warnings
 */
export const doughWarnings = (freshYeastPercent: number, waterC: number): DoughWarning[] => [
  ...(freshYeastPercent > MAX_FRESH_YEAST_PERCENT ? ['tooMuchYeast' as const] : []),
  ...(waterC > YEAST_DAMAGE_C ? ['waterTooHot' as const] : []),
  ...(waterC < 0 ? ['waterTooCold' as const] : []),
];
