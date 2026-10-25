import {BREAD_CALIBRATION} from '../dough/calibration';
import {hoursUntilReady} from '../fermentation/fermentation';
import {asRawInputs, readChoice, readNumber} from '../inputs';
import {median} from '../numbers';
import {ouncesToGrams} from '../units';

/** Commercial yeast as it is sold. */
export type YeastType = 'fresh' | 'instant' | 'activeDry';

export const YEAST_TYPES: readonly YeastType[] = ['fresh', 'instant', 'activeDry'];

/** How an amount of yeast is counted. */
export type YeastUnit = 'grams' | 'cube' | 'sachet' | 'packet';

/** Grams of each type that leaven like one gram of fresh yeast. */
const PER_GRAM_OF_FRESH: Record<YeastType, number> = {fresh: 1, instant: 1 / 3, activeDry: 0.4};

/** What one unit weighs, and which yeast is sold that way. */
const UNITS: Record<Exclude<YeastUnit, 'grams'>, {grams: number, types: readonly YeastType[]}> = {
  cube: {grams: 42, types: ['fresh']},
  sachet: {grams: 7, types: ['instant', 'activeDry']},
  packet: {grams: ouncesToGrams(0.25), types: ['instant', 'activeDry']},
};

/**
 * The units a type of yeast is counted in.
 *
 * @param {YeastType} type the yeast
 * @return {YeastUnit[]} grams first, then the packs it is sold in
 */
export const unitsOf = (type: YeastType): YeastUnit[] =>
  ['grams', ...(Object.keys(UNITS) as Exclude<YeastUnit, 'grams'>[]).filter((unit) => UNITS[unit].types.includes(type))];

export const gramsOf = (amount: number, unit: YeastUnit): number => unit === 'grams' ? amount : amount * UNITS[unit].grams;

/**
 * Grams of one yeast that leaven like an amount of another.
 *
 * @param {number} grams the amount the recipe asks for
 * @param {YeastType} from its yeast
 * @param {YeastType} to the yeast at hand
 * @return {number} grams of the yeast at hand
 */
export const convertYeast = (grams: number, from: YeastType, to: YeastType): number =>
  grams / PER_GRAM_OF_FRESH[from] * PER_GRAM_OF_FRESH[to];

/**
 * How many packs an amount is, for the packs a yeast is sold in.
 *
 * @param {number} grams the amount
 * @param {YeastType} type its yeast
 * @return {Array} the unit and count per pack it is sold in
 */
export const inPacks = (grams: number, type: YeastType): {unit: YeastUnit, count: number}[] =>
  unitsOf(type).filter((unit) => unit !== 'grams')
      .map((unit) => ({unit, count: grams / UNITS[unit as Exclude<YeastUnit, 'grams'>].grams}));

export type YeastTarget = YeastType | 'sourdough';

export const YEAST_TARGETS: readonly YeastTarget[] = [...YEAST_TYPES, 'sourdough'];

export interface YeastInputs {
  amount: number;
  unit: YeastUnit;
  from: YeastType;
  to: YeastTarget;
  /** Sourdough leavens at its own pace, so the starter is matched at the dough's temperature. */
  temperatureC: number;
  /** The flour the recipe is written for, in grams; 0 when not scaling. */
  recipeFlourG: number;
  /** The flour at hand, in grams. */
  myFlourG: number;
}

export const DEFAULT_YEAST_INPUTS: YeastInputs = {amount: 1, unit: 'cube', from: 'fresh', to: 'instant',
  temperatureC: 24, recipeFlourG: 0, myFlourG: 500};

export const parseYeastInputs = (raw: unknown): YeastInputs => {
  const fields = asRawInputs(raw);
  const d = DEFAULT_YEAST_INPUTS;
  const from = readChoice(fields, 'from', YEAST_TYPES, d.from);
  const unit = readChoice(fields, 'unit', ['grams', 'cube', 'sachet', 'packet'] as const, d.unit);
  return {
    amount: readNumber(fields, 'amount', d.amount, 0.25, 1000),
    unit: unitsOf(from).includes(unit) ? unit : 'grams',
    from,
    to: readChoice(fields, 'to', YEAST_TARGETS, d.to),
    temperatureC: readNumber(fields, 'temperatureC', d.temperatureC, 10, 35),
    recipeFlourG: readNumber(fields, 'recipeFlourG', d.recipeFlourG, 0, 100000),
    myFlourG: readNumber(fields, 'myFlourG', d.myFlourG, 1, 100000),
  };
};

/**
 * Grams of the yeast at hand for what the recipe asks, scaled to the flour at hand when the recipe's is given.
 *
 * @param {YeastInputs} inputs the recipe's yeast and the yeast and flour at hand
 * @return {number} grams of the yeast at hand
 */
export const yeastNeeded = (inputs: YeastInputs & {to: YeastType}): number => {
  const scale = inputs.recipeFlourG > 0 ? inputs.myFlourG / inputs.recipeFlourG : 1;
  return convertYeast(gramsOf(inputs.amount, inputs.unit), inputs.from, inputs.to) * scale;
};

/** Ripe starter in place of fresh yeast, in g per g, from a 7 g sachet of instant yeast. */
const STARTER_PER_FRESH_G = median([100, 140])! / convertYeast(7, 'instant', 'fresh');

/**
 * The ripe starter in place of the recipe's yeast, for the flour at hand, with the
 * hours the dough takes with it.
 *
 * @param {YeastInputs} inputs the recipe's yeast, the flour at hand and the dough's temperature
 * @return {object} grams of starter and hours until ready; Infinity when too cold
 */
export const starterNeeded = (inputs: YeastInputs): {grams: number, hours: number} => {
  const grams = yeastNeeded({...inputs, to: 'fresh'}) * STARTER_PER_FRESH_G;
  return {grams, hours: hoursUntilReady(BREAD_CALIBRATION, 'sourdough', grams / inputs.myFlourG * 100,
      inputs.temperatureC)};
};
