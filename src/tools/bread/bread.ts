import {BREAD_CALIBRATION, recommendedDoughC} from '../dough/calibration';
import {DoughAmounts, DoughLeavener, doughWarnings, DoughWarning, isTooLittleToWeigh, Kneading, KNEADINGS,
  leavenerNeeded, waterTemperature, weighDough} from '../dough/dough';
import {BakeTime, presetStages, readBakeTime, readStages, ROOM_C, SCHEDULE_CHOICES, ScheduleChoice,
  scheduleStages} from '../dough/stages';
import {hoursUntilReady, Stage} from '../fermentation/fermentation';
import {asRawInputs, readBoolean, readChoice, readList, readNumber, readOptionalNumber} from '../inputs';
import {median, requiredMedian} from '../sources';
import {convertYeast, YEAST_TYPES, YeastType} from '../yeast/yeast';
import {ADDITION_PREPARATIONS, AdditionPreparation, BAKE_MINUTES, BAKING, BREAD_FLOURS, BREAD_SALT, BreadFlour,
  FLOUR_TYPES, FOLD_SETS, Grain, LIKE_WHEAT_405, MAX_FLOUR_SHARE, MAX_FRUIT_VEG_SHARE, PROOF_HOURS, RECIPE_WATER,
  RYE_ACIDIFIED, RYE_BREAD_SHARE, RYE_FLOURS, SOAKER, SOLIDS_KEEP, SOUR, TYPE_WATER} from './breadData';

/** How the dough rises: ripe starter straight in, a sour of part of the rye made the day before, or yeast. */
export type BreadMethod = 'starter' | 'sour' | 'yeast';

export const BREAD_METHODS: readonly BreadMethod[] = ['starter', 'sour', 'yeast'];

export interface FlourShare {
  flour: BreadFlour;
  /** % of the flour; the shares of a mix add up to 100. */
  share: number;
}

/** The share slider's step, and the least share a flour of a mix keeps, in %. */
export const FLOUR_SHARE_STEP = 5;

/**
 * Shares in the proportions given, in steps of the slider, each at least one step, adding up to a total.
 *
 * @param {number[]} shares the proportions; all 0 splits evenly
 * @param {number} total what they add up to
 * @return {number[]} the shares
 */
const spread = (shares: number[], total: number): number[] => {
  const sum = shares.reduce((all, share) => all + share, 0);
  const proportions = sum > 0 ? shares : shares.map(() => 1);
  const parts = proportions.reduce((all, share) => all + share, 0);
  const stepped = proportions.map((share) => Math.max(FLOUR_SHARE_STEP,
      Math.round(share / parts * total / FLOUR_SHARE_STEP) * FLOUR_SHARE_STEP));
  // Rounding leaves a remainder; the largest share takes it.
  const largest = stepped.indexOf(Math.max(...stepped));
  stepped[largest] += total - stepped.reduce((all, share) => all + share, 0);
  return stepped;
};

/**
 * A mix with one flour's share changed; the others keep their proportions and make up the rest to 100 %.
 *
 * @param {FlourShare[]} flours the mix
 * @param {number} index the flour changed
 * @param {number} share its new share in %
 * @return {FlourShare[]} the mix
 */
export const withFlourShare = (flours: FlourShare[], index: number, share: number): FlourShare[] => {
  const own = Math.min(Math.max(share, FLOUR_SHARE_STEP), 100 - FLOUR_SHARE_STEP * (flours.length - 1));
  const rest = spread(flours.filter((_, at) => at !== index).map((part) => part.share), 100 - own);
  return flours.map((part, at) => ({...part, share: at === index ? own : rest[at < index ? at : at - 1]}));
};

/**
 * A mix with a flour removed; the others make up the 100 % in their proportions.
 *
 * @param {FlourShare[]} flours the mix
 * @param {number} index the flour removed
 * @return {FlourShare[]} the mix
 */
export const withoutFlour = (flours: FlourShare[], index: number): FlourShare[] => {
  const left = flours.filter((_, at) => at !== index);
  const shares = spread(left.map((part) => part.share), 100);
  return left.map((part, at) => ({...part, share: shares[at]}));
};

/** Something added from the food catalogue. */
export interface Addition {
  foodId: number;
  name: string;
  grams: number;
  waterPer100g: number;
  /** Seeds and grains go into a soaker with this much water per gram. */
  soakAbsorption?: number;
  /** Fruit and vegetables: raw they keep most of their water, cooked or puréed the dough takes most of it. */
  preparation?: AdditionPreparation;
  /** Grams per 100 g, from the food catalogue: cooked starch binds water. */
  starchPer100g?: number;
}

export interface BreadInputs extends BakeTime {
  /** A sour needs rye in the mix. */
  method: BreadMethod;
  /** Sourdough with some yeast, which makes up what the starter or sour lacks for the schedule. */
  withYeast: boolean;
  flours: FlourShare[];
  amountMode: 'loaves' | 'flour';
  count: number;
  loafWeightG: number;
  flourG: number;
  /** % of the flour; undefined uses what the flours take. */
  hydration?: number;
  /** The yeast at hand. */
  yeast: YeastType;
  /** Starter with yeast: the starter in % of the flour. */
  starterPercent: number;
  /** Hours the sour ripens; its starter follows. */
  sourHours: number;
  /** A sour without yeast: hours the dough rises at room temperature; undefined takes the usual sour. */
  sourRiseHours?: number;
  preset: ScheduleChoice;
  /** The stages of one's own schedule; a preset's follow the room temperature. */
  stages: Stage[];
  roomC: number;
  kneading: Kneading;
  additions: Addition[];
}

export interface BreadResult {
  hydration: number;
  amounts: DoughAmounts;
  /** Flour per flour type, out of the flour to weigh in. */
  flourSplit: {flour: BreadFlour, grams: number}[];
  /** Sourdough with yeast carries yeast besides the starter. */
  yeastGrams?: number;
  /** The sour to make the day before, with its starter; it all goes into the dough. */
  sour?: {flour: number, water: number, starter: number, hours: number, temperatureC: number};
  /** The schedule; a dough with a sour and no yeast rises at room temperature as fast as its sour lets it. */
  stages: Stage[];
  guide: BreadGuide;
  /** All the water in the dough, the starter's and the additions' included. */
  doughWater: number;
  soaker?: {seeds: number, water: number, hours: number};
  pieces: number;
  pieceWeight: number;
  waterTemperatureC: number;
  warnings: ('impossibleSchedule' | 'tooLittleToWeigh' | 'soakerTooLarge' | 'additionsTooWet' | 'tooManyAdditions' |
    'ryeWithoutSour' | 'flourShareTooHigh' | 'yeastNotNeeded' | DoughWarning)[];
}

/** How the dough is worked and the loaf baked: the oven to start with, the one it drops to and when, the minutes. */
export interface BreadGuide {
  /** Half rye or more: mixed, not kneaded or folded, and left to set as it cools. */
  ryeDough: boolean;
  /** Stretch and folds in a mostly wheat sourdough's bulk; 0 from half rye on and for yeast doughs. */
  foldSets: number;
  /** Hours before baking the loaf is shaped, so it proofs. */
  shapeHoursBefore: number;
  startC: number;
  lowerC: number;
  lowerAfterMinutes: number;
  minutes: number;
  coreC: number;
}

/**
 * A grain's water by flour type: the line through each source's values, with the sources' average level. Within a
 * source darker flours take more; the sources differ in level, not in slope.
 *
 * @param {Array} sources one list of [type, water] per source
 * @return {Function} water in % of the flour for a type
 */
const typeLine = (sources: [number, number][][]): ((type: number) => number) => {
  const mean = (values: number[]) => values.reduce((all, value) => all + value, 0) / values.length;
  const centres = sources.map((points) => [mean(points.map(([type]) => type)), mean(points.map(([, water]) => water))]);
  const covariance = sources.reduce((all, points, at) => all + points.reduce((sum, [type, water]) =>
    sum + (type - centres[at][0]) * (water - centres[at][1]), 0), 0);
  const variance = sources.reduce((all, points, at) => all + points.reduce((sum, [type]) =>
    sum + (type - centres[at][0]) ** 2, 0), 0);
  const slope = covariance / variance;
  const level = mean(centres.map(([type, water]) => water - slope * type));
  return (type) => level + slope * type;
};

const TYPE_LINES = Object.fromEntries((Object.keys(TYPE_WATER) as Grain[]).map((grain) =>
  [grain, typeLine(TYPE_WATER[grain])])) as Record<Grain, (type: number) => number>;

/**
 * The water a flour takes in a bread dough.
 *
 * @param {BreadFlour} flour the flour
 * @return {number} % of the flour
 */
export const flourWater = (flour: BreadFlour): number => {
  const typed = FLOUR_TYPES[flour];
  if (typed) {
    return TYPE_LINES[typed.grain](typed.type);
  }
  return LIKE_WHEAT_405.includes(flour) ? flourWater('type405') :
    requiredMedian(RECIPE_WATER[flour] ?? [], `the water of ${flour}`);
};

/**
 * The most of a yeast bread's flour a flour with little gluten makes up.
 *
 * @param {BreadFlour} flour the flour
 * @return {number | undefined} % of the flour; undefined for flours that carry a bread alone
 */
export const maxFlourShare = (flour: BreadFlour): number | undefined => median(MAX_FLOUR_SHARE[flour] ?? []);

/**
 * What a flour mix takes: each flour's water, weighted by its share.
 *
 * @param {FlourShare[]} flours the mix
 * @return {number} water in % of the flour
 */
export const recommendedHydration = (flours: FlourShare[]): number => {
  const total = flours.reduce((sum, part) => sum + part.share, 0) || 1;
  return flours.reduce((sum, part) => sum + flourWater(part.flour) * part.share, 0) / total;
};

export const DEFAULT_BREAD_INPUTS: BreadInputs = {
  method: 'starter',
  withYeast: false,
  flours: [{flour: 'type550', share: 100}],
  amountMode: 'loaves',
  count: 1,
  loafWeightG: 1000,
  flourG: 500,
  yeast: 'fresh',
  starterPercent: 10,
  sourHours: requiredMedian(SOUR.hours, 'the hours of the sour'),
  preset: 'overnight',
  stages: presetStages('overnight', ROOM_C),
  roomC: ROOM_C,
  kneading: 'hand',
  additions: [],
  // Overnight dough is mixed in the evening, so the bread is baked the next late morning.
  bakeDayOffset: 1,
  bakeTime: '11:00',
};

const normalised = (flours: FlourShare[]): FlourShare[] => {
  const shares = spread(flours.map((part) => part.share), 100);
  return flours.map((part, at) => ({...part, share: shares[at]}));
};

export const parseBreadInputs = (raw: unknown): BreadInputs => {
  const fields = asRawInputs(raw);
  const d = DEFAULT_BREAD_INPUTS;
  const flours = normalised(readList(fields, 'flours', (entry) => ({
    flour: readChoice(entry, 'flour', BREAD_FLOURS, 'type550'),
    share: readNumber(entry, 'share', 100, 0, 100),
  }), 4, d.flours));
  return {
    method: methodFor(readChoice(fields, 'method', BREAD_METHODS, d.method), flours),
    withYeast: readBoolean(fields, 'withYeast', d.withYeast),
    flours,
    amountMode: readChoice(fields, 'amountMode', ['loaves', 'flour'] as const, d.amountMode),
    count: Math.round(readNumber(fields, 'count', d.count, 1, 50)),
    loafWeightG: readNumber(fields, 'loafWeightG', d.loafWeightG, 100, 5000),
    flourG: readNumber(fields, 'flourG', d.flourG, 50, 50000),
    hydration: readOptionalNumber(fields, 'hydration', 40, 120),
    yeast: readChoice(fields, 'yeast', YEAST_TYPES, d.yeast),
    starterPercent: readNumber(fields, 'starterPercent', d.starterPercent, 1, 50),
    sourHours: readNumber(fields, 'sourHours', d.sourHours, SOUR_HOURS.low, SOUR_HOURS.high),
    sourRiseHours: readOptionalNumber(fields, 'sourRiseHours', 0.5, 48),
    preset: readChoice(fields, 'preset', SCHEDULE_CHOICES, d.preset),
    stages: readStages(fields, d.stages),
    roomC: readNumber(fields, 'roomC', d.roomC, 10, 35),
    kneading: readChoice(fields, 'kneading', KNEADINGS, d.kneading),
    additions: readList(fields, 'additions', (entry) => ({
      foodId: readNumber(entry, 'foodId', 0, 0, Number.MAX_SAFE_INTEGER),
      name: typeof entry.name === 'string' ? entry.name.slice(0, 100) : '',
      grams: readNumber(entry, 'grams', 0, 0, 5000),
      waterPer100g: readNumber(entry, 'waterPer100g', 0, 0, 100),
      soakAbsorption: readOptionalNumber(entry, 'soakAbsorption', 0, 50),
      preparation: ADDITION_PREPARATIONS.includes(entry.preparation as AdditionPreparation) ?
        entry.preparation as AdditionPreparation : undefined,
      starchPer100g: readOptionalNumber(entry, 'starchPer100g', 0, 100),
    }), 10, []).filter((addition) => addition.foodId > 0),
    ...readBakeTime(fields, d),
  };
};

/**
 * The water the dough takes from an addition: all of it, but a fruit's or vegetable's solids keep some, raw tissue
 * most, and cooked starch binds more than its own water, as in mashed potato.
 *
 * @param {Addition} addition the addition
 * @return {number} grams per 100 g of it; below 0 when it takes water from the dough
 */
export const doughWaterPer100g = (addition: Addition): number => {
  const water = addition.waterPer100g;
  const solids = 100 - water;
  if (addition.preparation === 'raw') {
    return Math.max(0, water - requiredMedian(SOLIDS_KEEP.raw, 'the water raw tissue keeps') * solids);
  }
  if (addition.preparation === 'cooked') {
    const starch = Math.min(addition.starchPer100g ?? 0, solids);
    return water - requiredMedian(SOLIDS_KEEP.cookedSolids, 'the water cooked tissue keeps') * (solids - starch) -
      requiredMedian(SOLIDS_KEEP.cookedStarch, 'the water cooked starch binds') * starch;
  }
  return water;
};

/**
 * The share of rye in a mix.
 *
 * @param {FlourShare[]} flours the mix
 * @return {number} 0 to 1
 */
export const ryeShare = (flours: FlourShare[]): number => {
  const total = flours.reduce((sum, part) => sum + part.share, 0) || 1;
  return flours.filter((part) => RYE_FLOURS.includes(part.flour)).reduce((sum, part) => sum + part.share, 0) / total;
};

/**
 * A method the mix allows: a sour acidifies rye, so without rye the starter goes in directly.
 *
 * @param {BreadMethod} method the method chosen
 * @param {FlourShare[]} flours the mix
 * @return {BreadMethod} the method
 */
export const methodFor = (method: BreadMethod, flours: FlourShare[]): BreadMethod =>
  method === 'sour' && ryeShare(flours) === 0 ? 'starter' : method;

/** The hours a sour may ripen, to choose from: overnight, as recipes do, up to a day. */
export const SOUR_HOURS = {low: 8, high: 24};

const sourWater = () => requiredMedian(SOUR.hydration, 'the hydration of the sour') / 100;

/**
 * A sour in % of all the flour for a share of the rye acidified, with as much water as its hydration.
 *
 * @param {FlourShare[]} flours the mix
 * @param {number} acidified % of the rye in the sour
 * @return {number} its flour and water in % of the flour
 */
const sourOf = (flours: FlourShare[], acidified: number): number => acidified * ryeShare(flours) * (1 + sourWater());

const acidified = () => ({usual: requiredMedian(RYE_ACIDIFIED, 'the acidified rye'), least: Math.min(...RYE_ACIDIFIED),
  most: Math.max(...RYE_ACIDIFIED)});

const toQuarter = (hours: number) => Math.round(hours * 4) / 4;

/**
 * Hours a dough rises at room temperature on the sour of a share of its rye.
 *
 * @param {BreadInputs} inputs the bread
 * @param {number} acidifiedPercent % of the rye in the sour
 * @return {number} hours
 */
const riseOnSour = (inputs: BreadInputs, acidifiedPercent: number) =>
  hoursUntilReady(BREAD_CALIBRATION, 'sourdough', sourOf(inputs.flours, acidifiedPercent), inputs.roomC);

/**
 * How long a dough with a sour and no yeast can rise at room temperature: the most acid rye takes raises it fastest,
 * the least slowest, to the quarter hour.
 *
 * @param {BreadInputs} inputs the bread
 * @return {object} the shortest, usual and longest hours
 */
export const sourRiseHours = (inputs: BreadInputs): {low: number, usual: number, high: number} => {
  const {usual, least, most} = acidified();
  return {low: toQuarter(riseOnSour(inputs, most)), usual: toQuarter(riseOnSour(inputs, usual)),
    high: toQuarter(riseOnSour(inputs, least))};
};

/**
 * The stages the dough goes through: with a sour and no yeast at room temperature for the hours chosen within what
 * the sour allows; otherwise the preset's at the room temperature, or one's own.
 *
 * @param {BreadInputs} inputs the bread
 * @return {Stage[]} the stages
 */
export const breadStages = (inputs: BreadInputs): Stage[] => {
  const chosen = scheduleStages(inputs.preset, inputs.stages, inputs.roomC);
  if (inputs.method !== 'sour' || inputs.withYeast) {
    return chosen;
  }
  const {low, usual, high} = sourRiseHours(inputs);
  if (!Number.isFinite(high)) {
    return chosen;
  }
  const hours = Math.min(high, Math.max(low, inputs.sourRiseHours ?? usual));
  return [{hours, temperatureC: inputs.roomC}];
};

/**
 * The sour in % of all the flour: the usual with yeast, else the one that raises the dough in its hours, found by
 * halving the range of acid rye takes; more sour raises it faster.
 *
 * @param {BreadInputs} inputs the bread
 * @param {Stage[]} stages its stages, one at room temperature without yeast
 * @return {number} the sour's flour and water in % of the flour
 */
const sourPercent = (inputs: BreadInputs, stages: Stage[]): number => {
  const {usual, least, most} = acidified();
  if (inputs.withYeast) {
    return sourOf(inputs.flours, usual);
  }
  let low = least;
  let high = most;
  for (let step = 0; step < 40; step++) {
    const middle = (low + high) / 2;
    if (riseOnSour(inputs, middle) > stages[0].hours) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return sourOf(inputs.flours, (low + high) / 2);
};

/**
 * How much leavener, of what, the bread needs for its stages.
 *
 * @param {BreadInputs} inputs the bread
 * @param {Stage[]} stages its stages
 * @return {object} the leavener, its % of the flour and, with yeast besides sourdough, the yeast's
 */
const leavening = (inputs: BreadInputs, stages: Stage[]):
    {leavener: DoughLeavener, percent: number, yeastPercent?: number} => {
  const targetC = recommendedDoughC('bread', stages);
  const needed = (leavener: DoughLeavener) => leavenerNeeded(BREAD_CALIBRATION, leavener, stages, targetC);
  if (inputs.method === 'yeast') {
    return {leavener: inputs.yeast, percent: needed(inputs.yeast)};
  }
  if (!inputs.withYeast) {
    return {leavener: 'sourdough',
      percent: inputs.method === 'sour' ? sourPercent(inputs, stages) : needed('sourdough')};
  }
  // The starter or sour is given; fresh yeast makes up what it lacks for the schedule.
  const percent = inputs.method === 'sour' ? sourPercent(inputs, stages) : inputs.starterPercent;
  const missingShare = Math.max(0, 1 - percent / needed('sourdough'));
  return {leavener: 'sourdough', percent, yeastPercent: convertYeast(needed('fresh') * missingShare, 'fresh', inputs.yeast)};
};

const BAKE_MINUTES_PER_ROOT_KG = requiredMedian(BAKE_MINUTES.map(([grams, minutes]) => minutes / Math.sqrt(grams / 1000)),
    'the bake time');

/**
 * How to work a dough and bake a loaf of it.
 *
 * @param {BreadMethod} method how the dough rises
 * @param {number} ryePercent its rye in % of the flour
 * @param {number} loafGrams the dough of a loaf
 * @return {BreadGuide} the guide
 */
const breadGuide = (method: BreadMethod, ryePercent: number, loafGrams: number): BreadGuide => ({
  ryeDough: ryePercent >= RYE_BREAD_SHARE,
  foldSets: method !== 'yeast' && ryePercent < RYE_BREAD_SHARE ? requiredMedian(FOLD_SETS, 'the sets of folds') : 0,
  shapeHoursBefore: requiredMedian(PROOF_HOURS, 'the proof of the shaped loaf'),
  startC: requiredMedian(BAKING.startC, 'the oven at the start'),
  lowerC: requiredMedian(BAKING.lowerC, 'the oven after the drop'),
  lowerAfterMinutes: requiredMedian(BAKING.lowerAfterMin, 'the minutes before the drop'),
  minutes: BAKE_MINUTES_PER_ROOT_KG * Math.sqrt(loafGrams / 1000),
  coreC: requiredMedian(BAKING.coreC, 'the core of a baked loaf'),
});

/**
 * Everything to weigh for a bread, with the sour or soaker to prepare and the water temperature.
 *
 * @param {BreadInputs} inputs the bread
 * @return {BreadResult} what to do
 */
export const calculateBread = (inputs: BreadInputs): BreadResult => {
  const warnings: BreadResult['warnings'] = [];
  const hydration = inputs.hydration ?? recommendedHydration(inputs.flours);
  const salt = requiredMedian(BREAD_SALT, 'the salt of bread') / 100;
  const formula = {hydration: hydration / 100, salt, oil: 0, sugar: 0};
  const stages = breadStages(inputs);
  const {leavener, percent, yeastPercent} = leavening(inputs, stages);
  let leavenerPct = percent;
  if (!Number.isFinite(leavenerPct)) {
    warnings.push('impossibleSchedule');
    leavenerPct = 0;
  }
  const doughAdditions = inputs.additions.filter((addition) => addition.soakAbsorption == null);
  const seeds = inputs.additions.filter((addition) => addition.soakAbsorption != null);
  const soakerSeeds = seeds.reduce((sum, seed) => sum + seed.grams, 0);
  const soakerWater = seeds.reduce((sum, seed) => sum + seed.grams * (seed.soakAbsorption ?? 0), 0);
  // A loaf's weight includes its soaker.
  const size = inputs.amountMode === 'flour' ? {flour: inputs.flourG} :
    {dough: Math.max(0, inputs.count * inputs.loafWeightG - soakerSeeds - soakerWater)};
  const amounts = weighDough(formula, leavener, leavenerPct, size, doughAdditions.map((addition) =>
    ({grams: addition.grams, waterPer100g: doughWaterPer100g(addition)})));
  // A gram over is weighing noise.
  if (amounts.excessWater >= 1) {
    warnings.push('additionsTooWet');
  }
  const yeastGrams = yeastPercent != null ? yeastPercent / 100 * amounts.totalFlour : undefined;
  if (yeastPercent === 0) {
    warnings.push('yeastNotNeeded');
  }
  if ((leavener !== 'sourdough' && isTooLittleToWeigh(amounts.leavener)) || isTooLittleToWeigh(yeastGrams ?? 0)) {
    warnings.push('tooLittleToWeigh');
  }

  const total = inputs.flours.reduce((sum, part) => sum + part.share, 0) || 1;
  const starterFlour = leavener === 'sourdough' ? amounts.leavener / 2 : 0;
  // A sour is made of the rye; a starter takes from every flour.
  const carriers = inputs.flours.filter((part) => inputs.method !== 'sour' || RYE_FLOURS.includes(part.flour));
  const carrierTotal = carriers.reduce((sum, part) => sum + part.share, 0) || 1;
  const flourSplit = inputs.flours.map((part) => ({flour: part.flour, grams: part.share / total * amounts.totalFlour -
    (carriers.includes(part) ? starterFlour * part.share / carrierTotal : 0)}));

  if (soakerSeeds > requiredMedian(SOAKER.maxShareOfFlour, 'the largest soaker') / 100 * amounts.totalFlour) {
    warnings.push('soakerTooLarge');
  }
  const fruitVeg = doughAdditions.filter((addition) => addition.preparation != null)
      .reduce((sum, addition) => sum + addition.grams, 0);
  if (fruitVeg > MAX_FRUIT_VEG_SHARE / 100 * amounts.totalFlour) {
    warnings.push('tooManyAdditions');
  }
  const rye = ryeShare(inputs.flours) * 100;
  if (inputs.method !== 'sour' && rye > RYE_BREAD_SHARE) {
    warnings.push('ryeWithoutSour');
  }
  if (inputs.flours.some((part) => part.share > (maxFlourShare(part.flour) ?? Infinity))) {
    warnings.push('flourShareTooHigh');
  }
  const waterTemperatureC = waterTemperature({targetC: recommendedDoughC('bread', stages), roomC: inputs.roomC,
    flourC: inputs.roomC, starterC: leavener === 'sourdough' ? inputs.roomC : undefined}, inputs.kneading);
  const freshYeast = leavener !== 'sourdough' ? convertYeast(leavenerPct, leavener, 'fresh') :
    convertYeast(yeastPercent ?? 0, inputs.yeast, 'fresh');
  warnings.push(...doughWarnings(freshYeast, waterTemperatureC));

  const sour = inputs.method === 'sour' ? (() => {
    const sourFlour = amounts.leavener / 2;
    // The starter, half flour and half water, is part of the sour.
    // It ripens where the dough goes, its starter as for a dough of its hours.
    const ripening = [{hours: inputs.sourHours, temperatureC: inputs.roomC}];
    const starter = leavenerNeeded(BREAD_CALIBRATION, 'sourdough', ripening, inputs.roomC) / 100 * sourFlour;
    return {flour: sourFlour - starter / 2, water: sourFlour - starter / 2, starter, hours: inputs.sourHours,
      temperatureC: inputs.roomC};
  })() : undefined;

  const loaves = inputs.amountMode === 'loaves' ? inputs.count : 1;
  const pieceWeight = (amounts.total + soakerSeeds + soakerWater) / loaves;
  return {
    hydration,
    amounts,
    flourSplit,
    yeastGrams,
    sour,
    stages,
    guide: breadGuide(inputs.method, rye, pieceWeight),
    doughWater: hydration / 100 * amounts.totalFlour + amounts.excessWater,
    soaker: soakerSeeds > 0 ?
      {seeds: soakerSeeds, water: soakerWater, hours: requiredMedian(SOAKER.hours, 'the hours of a soaker')} : undefined,
    pieces: loaves,
    pieceWeight,
    waterTemperatureC,
    warnings,
  };
};
