import {asRawInputs, readChoice, readNumber, readOptionalNumber} from '../inputs';
import {median, medianRange, midpoint, nearest, Range, requiredMedian, stepsBetween} from '../numbers';

export type CoffeeMethod = 'pourOver' | 'filterMachine' | 'frenchPress' | 'aeroPress' | 'moka' | 'espresso' |
  'fullyAutomatic' | 'coldBrewConcentrate' | 'coldBrewReady' | 'japaneseIced';

export const COFFEE_METHODS: readonly CoffeeMethod[] = ['pourOver', 'filterMachine', 'frenchPress', 'aeroPress', 'moka',
  'espresso', 'fullyAutomatic', 'coldBrewConcentrate', 'coldBrewReady', 'japaneseIced'];

export type Strength = 'mild' | 'medium' | 'strong';

export const STRENGTHS: readonly Strength[] = ['mild', 'medium', 'strong'];

export type Roast = 'light' | 'medium' | 'dark';

export const ROASTS: readonly Roast[] = ['light', 'medium', 'dark'];

/** From finest to coarsest. */
export type Grind = 'extraFine' | 'fine' | 'mediumFine' | 'medium' | 'mediumCoarse' | 'coarse';

export const GRINDS: readonly Grind[] = ['extraFine', 'fine', 'mediumFine', 'medium', 'mediumCoarse', 'coarse'];

/** How strength is judged: by filter coffee's band, espresso's, a moka's or cold brew's. */
export type TasteBand = 'filter' | 'espresso' | 'moka' | 'coldBrew';

/** Where cold brew steeps. */
export type Steeping = 'fridge' | 'room';

export const STEEPINGS: readonly Steeping[] = ['fridge', 'room'];

/**
 * Where the water's heat comes from: a kettle or an espresso machine one sets, a fully automatic machine's levels, a
 * filter machine's own, or none to speak of (a stove, cold water).
 */
export type Heat = 'kettle' | 'machine' | 'levels' | 'fixed' | 'none';

export type TimeUnit = 'seconds' | 'minutes' | 'hours';

/** The steps a brew time is chosen in: whole seconds, quarter minutes, half hours. */
export const TIME_STEPS: Record<TimeUnit, number> = {seconds: 1, minutes: 0.25, hours: 0.5};

interface MethodData {
  /**
   * Grams of water per gram of coffee for each strength, the least water strong and the most mild. A fully automatic
   * machine doses by its own levels.
   */
  strengths?: Record<Strength, number[]>;
  heat: Heat;
  /** A filter machine's water, °C. */
  waterC?: Range[];
  /**
   * Brew times; `limits` where the time is a dial, as in a steeped brew. A dripped or pressed one runs as
   * long as grind and pouring make it, so its time is a target. Cold brew takes its times from where it steeps.
   */
  brewTime?: {ranges?: Range[], unit: TimeUnit, limits?: Range};
  /** Steeped whole: the grounds hold liquid as strong as the drink, so the strength spreads over all the water. */
  immersion?: boolean;
  /** Steeped cold: it extracts by where and how long it steeps, not by the water's heat. */
  cold?: boolean;
  /** The usual grinds; their median is recommended. */
  grinds: Grind[];
  /** Share of the water that goes in as ice. */
  iceShare?: Range[];
  /** Water to add per gram of concentrate. */
  dilution?: number[];
  taste?: TasteBand;
}

const HOT = [{low: 92, high: 96}, {low: 90.5, high: 96}];

const exactly = (value: number): Range => ({low: value, high: value});

const POUR_OVER_GRINDS: Grind[] = ['mediumFine', 'mediumFine', 'mediumCoarse', 'medium', 'mediumFine', 'medium',
  'medium'];

const ESPRESSO_GRINDS: Grind[] = ['fine', 'extraFine', 'fine'];

export const METHODS: Record<CoffeeMethod, MethodData> = {
  pourOver: {strengths: {mild: [18, 18], medium: [16, 16, 16], strong: [15, 13, 13]}, heat: 'kettle',
    brewTime: {ranges: [{low: 2.5, high: 4}, {low: 2.5, high: 4}, {low: 3, high: 4}, {low: 3, high: 4}],
      unit: 'minutes'}, grinds: POUR_OVER_GRINDS, taste: 'filter'},
  filterMachine: {strengths: {mild: [18, 1000 / 55], medium: [16, 17], strong: [13, 1000 / 60]}, heat: 'fixed',
    waterC: HOT, grinds: ['mediumFine', 'mediumFine', 'mediumFine', 'medium', 'medium'], taste: 'filter'},
  frenchPress: {strengths: {mild: [17, 18, 17, 17], medium: [15, 15, 15, 14.5], strong: [13, 13, 13, 12, 14]},
    heat: 'kettle', immersion: true, brewTime: {ranges: [exactly(4), exactly(4), exactly(4), exactly(4), exactly(4), exactly(6)],
      unit: 'minutes', limits: {low: 2, high: 10}}, grinds: ['coarse', 'coarse', 'coarse', 'coarse', 'coarse',
      'coarse'], taste: 'filter'},
  aeroPress: {strengths: {mild: [18, 16, 16, 13], medium: [14, 11, 14.5, 14, 12], strong: [13, 12, 11]},
    heat: 'kettle', immersion: true, brewTime: {ranges: [{low: 1, high: 2.5}, exactly(2)], unit: 'minutes', limits: {low: 1, high: 4}},
    grinds: ['mediumFine', 'mediumFine', 'mediumFine', 'mediumFine', 'medium'], taste: 'filter'},
  moka: {strengths: {mild: [9, 9, 9, 10], medium: [8, 8, 10, 7], strong: [6, 6, 7]}, heat: 'none',
    grinds: ['fine', 'fine', 'fine', 'mediumFine', 'fine'], taste: 'moka'},
  // Mild, medium and strong are a lungo, a normale and a ristretto.
  espresso: {strengths: {mild: [3.5, 3], medium: [2, 2, 2, 2, 2, 2], strong: [1.25, 1.5]}, heat: 'machine',
    brewTime: {ranges: [{low: 25, high: 30}, {low: 25, high: 30}, {low: 25, high: 35}, exactly(20),
      {low: 25, high: 30}], unit: 'seconds'}, grinds: ESPRESSO_GRINDS, taste: 'espresso'},
  // It brews like an espresso machine; its band follows the drink chosen.
  fullyAutomatic: {heat: 'levels', grinds: ESPRESSO_GRINDS},
  coldBrewConcentrate: {strengths: {mild: [10, 5, 8], medium: [8, 40 / 9, 6, 4.5, 8], strong: [5, 4]}, heat: 'none',
    brewTime: {unit: 'hours', limits: {low: 8, high: 30}}, immersion: true, cold: true,
    grinds: ['coarse', 'coarse', 'coarse', 'coarse'], dilution: [1, 1], taste: 'coldBrew'},
  // Drunk as it is, without diluting.
  coldBrewReady: {strengths: {mild: [15, 15], medium: [13.5, 13.5, 15], strong: [12, 12]}, heat: 'none',
    brewTime: {unit: 'hours', limits: {low: 8, high: 30}}, immersion: true, cold: true,
    grinds: ['coarse', 'coarse', 'coarse', 'coarse'], taste: 'coldBrew'},
  // Its strengths count water and ice together.
  japaneseIced: {strengths: {mild: [600 / 35], medium: [15, 15, 15, 600 / 35, 500 / 35, 15], strong: [500 / 35]},
    heat: 'kettle', grinds: POUR_OVER_GRINDS, iceShare: [{low: 0.35, high: 0.40}, {low: 0.35, high: 0.45},
      exactly(0.4), exactly(200 / 600), exactly(165 / 500), exactly(100 / 300)], taste: 'filter'},
};

const fahrenheit = (low: number, high: number): Range => ({low: (low - 32) / 1.8, high: (high - 32) / 1.8});

/** Water by roast: darker roasts give up their solubles at cooler water. */
export const ROAST_C: Record<Roast, Range[]> = {
  light: [fahrenheit(199, 205), fahrenheit(203, 212), {low: 93, high: 96}, fahrenheit(205, 205), fahrenheit(203, 207),
    {low: 90, high: 96}, {low: 96, high: 100}],
  medium: [fahrenheit(194, 200), fahrenheit(194, 203), {low: 90, high: 93}, {low: 87, high: 95}],
  dark: [fahrenheit(188, 194), fahrenheit(185, 195), {low: 88, high: 90}, fahrenheit(194, 200), {low: 82, high: 93},
    {low: 80, high: 85}],
};

export type AutomatLevel = 'low' | 'normal' | 'high';

export const AUTOMAT_TEMPERATURES: readonly AutomatLevel[] = ['low', 'normal', 'high'];

export type AutomatDrink = 'espresso' | 'coffee';

/**
 * A fully automatic machine: its strength levels, the coffee it grinds per cup at the mildest and strongest, its water
 * at the lowest and highest setting, the water per cup for each drink, and its smallest cup, a ristretto.
 */
export const AUTOMAT = {
  levels: [8, 3, 5],
  doseG: {least: [6, 6, 5, 7], most: [14, 12, 12, 12, 16]},
  temperatureC: {low: [85, 90, 90], high: [95, 95, 98]},
  cupMl: {espresso: [45, 32.5, 27, 32.5], coffee: [100, 120, 130, 125]} satisfies Record<AutomatDrink, number[]>,
  smallestCupMl: 25,
};

/** What dissolves, in % of the coffee, in an ideal brew. */
const EXTRACTION_BAND: Range[] = [{low: 18, high: 22}, {low: 18, high: 22}, {low: 18, high: 22}];

/** Water the spent grounds keep, in g per g. */
const RETAINED = [2, 3, 2.25, 2];

/** Water a spent espresso puck keeps, in g per g. */
const PUCK_RETAINED = [1, 18 / 15];

/** A balanced strength in % dissolved solids for each kind of brew; cold brew as drunk, before ice or milk. */
const BANDS: Record<TasteBand, Range[]> = {
  filter: [{low: 1.15, high: 1.35}, {low: 1.30, high: 1.55}, {low: 1.15, high: 1.45}, {low: 1.15, high: 1.45}],
  espresso: [{low: 8, high: 12}, {low: 8, high: 12}],
  moka: [{low: 3, high: 4}, {low: 3, high: 4}, exactly(2.5), {low: 3, high: 5}, exactly(2)],
  coldBrew: [{low: 1.0, high: 1.5}, {low: 1.0, high: 1.6}, {low: 1.4, high: 1.6}, {low: 1.6, high: 2.2}],
};

interface ColdBrewData {
  equilibrium: Record<Roast, number[]>;
  hoursToEquilibrium: number[];
  steep: Range[];
}

/**
 * Cold brew by where it steeps: its extraction in % once it stops rising, by roast, the hours it takes to get there and
 * the usual steeping times.
 */
const COLD_BREW: Record<Steeping, ColdBrewData> = {
  fridge: {equilibrium: {light: [19.64, 21.16, 20.83], medium: [19.80, 20.24, 19.64], dark: [18.13, 17.92, 18.56]},
    hoursToEquilibrium: [30, 26], steep: [{low: 18, high: 24}, {low: 16, high: 18}, {low: 12, high: 18},
      {low: 12, high: 15}, {low: 12, high: 18}]},
  room: {equilibrium: {light: [20.98, 21.98, 22.08], medium: [20.29, 21.27, 21.43], dark: [19.43, 19.37, 19.91]},
    hoursToEquilibrium: [13, 10, 6.5], steep: [{low: 12, high: 16}, {low: 12, high: 14}, {low: 8, high: 12},
      {low: 12, high: 18}]},
};

/**
 * Cold brew's extraction after some hours: rising towards where it stops, 95 % of the way after the hours it takes to
 * get there, so three time constants.
 *
 * @param {Steeping} steeping where it steeps
 * @param {Roast} roast the roast
 * @param {number} hours how long it steeps
 * @return {number} extraction in %
 */
const coldExtraction = (steeping: Steeping, roast: Roast, hours: number): number => {
  const data = COLD_BREW[steeping];
  const tau = requiredMedian(data.hoursToEquilibrium, 'the hours to equilibrium') / 3;
  return requiredMedian(data.equilibrium[roast], 'the equilibrium') * (1 - Math.exp(-hours / tau));
};

/**
 * Hot extraction in % at equilibrium, by roast. Darker roasts give up less, so a roast moves extraction by its median
 * against medium's.
 */
const ROAST_EXTRACTION: Record<Roast, number[]> = {
  light: [22.47, 23.29, 23.12], medium: [21.92, 22.52, 22.47], dark: [21.54, 21.16, 22.08],
};

/** Extraction in % of one pour-over at three grinds: the espresso setting, the filter one and French press. */
const GRIND_EXTRACTION: [Grind, number][] = [['fine', 21], ['mediumFine', 18.8], ['coarse', 15]];

/** French press extraction in % against minutes; it levels off after about 4 min. */
const STEEP_EXTRACTION: [number, number][] = [[2.75, 15.75], [4, 19]];

export interface CoffeeInputs {
  method: CoffeeMethod;
  /** What is given: the drink's water or the coffee at hand. */
  basis: 'water' | 'coffee';
  /** The drink's water; for a fully automatic machine the cup. */
  waterMl: number;
  coffeeG: number;
  /** Water per gram of coffee, one of the method's strength ratios; undefined takes its medium. */
  ratio?: number;
  roast: Roast;
  /** Undefined takes the method's usual grind. */
  grind?: Grind;
  /** A kettle's or espresso machine's water, °C; undefined takes the middle of what suits the roast. */
  temperatureC?: number;
  /** In the method's unit; undefined takes the middle of its usual time. */
  brewTime?: number;
  automatLevel: number;
  automatDrink: AutomatDrink;
  automatTemperature: AutomatLevel;
  steeping: Steeping;
}

export const DEFAULT_COFFEE_INPUTS: CoffeeInputs = {method: 'pourOver', basis: 'water', waterMl: 500, coffeeG: 30,
  roast: 'medium', automatLevel: 3, automatDrink: 'coffee', automatTemperature: 'normal', steeping: 'fridge'};

/**
 * How many strength levels a fully automatic machine has, as the median machine.
 *
 * @return {number} the levels
 */
export const automatLevels = (): number => Math.round(requiredMedian(AUTOMAT.levels, 'the strength levels'));

export const parseCoffeeInputs = (raw: unknown): CoffeeInputs => {
  const fields = asRawInputs(raw);
  const d = DEFAULT_COFFEE_INPUTS;
  return {
    method: readChoice(fields, 'method', COFFEE_METHODS, d.method),
    basis: readChoice(fields, 'basis', ['water', 'coffee'] as const, d.basis),
    waterMl: readNumber(fields, 'waterMl', d.waterMl, 10, 10000),
    coffeeG: readNumber(fields, 'coffeeG', d.coffeeG, 1, 1000),
    ratio: readOptionalNumber(fields, 'ratio', 1, 30),
    roast: readChoice(fields, 'roast', ROASTS, d.roast),
    grind: GRINDS.includes(fields.grind as Grind) ? fields.grind as Grind : undefined,
    temperatureC: readOptionalNumber(fields, 'temperatureC', 70, 100),
    brewTime: readOptionalNumber(fields, 'brewTime', 0.1, 48),
    automatLevel: Math.round(readNumber(fields, 'automatLevel', d.automatLevel, 1, automatLevels())),
    automatDrink: readChoice(fields, 'automatDrink', ['espresso', 'coffee'] as const, d.automatDrink),
    automatTemperature: readChoice(fields, 'automatTemperature', AUTOMAT_TEMPERATURES, d.automatTemperature),
    steeping: readChoice(fields, 'steeping', STEEPINGS, d.steeping),
  };
};

/**
 * Where a brew lands: its strength against the band for its kind and its extraction against the ideal band, both
 * estimated, as nothing is measured.
 */
export interface Taste {
  /** What the brew is judged as, which also names how it tastes. */
  kind: TasteBand;
  /** % dissolved solids. */
  tds: number;
  band: Range;
  /** % of the coffee dissolved. */
  extraction: number;
  extractionBand: Range;
  strength: 'weak' | 'balanced' | 'strong';
  extracted: 'under' | 'ideal' | 'over';
  /** % dissolved solids per % extracted at each of the method's strengths, for the chart's lines. */
  lines: {ratio: number, slope: number}[];
}

export interface CoffeeResult {
  /** Grams of water per gram of coffee. */
  ratio: number;
  coffeeG: number;
  /** All the water, ice included; for a fully automatic machine the cup. */
  waterMl: number;
  iceG?: number;
  /** Water to add to the concentrate before drinking. */
  dilutionMl?: number;
  heat: Heat;
  /** The water as brewed, °C. */
  temperatureC?: number;
  /** What suits the roast, or a filter machine's water. */
  recommendedC?: Range;
  /** `chosen` where the time is a dial; `brewed` is the time chosen or, where none can be, the usual. */
  brewTime?: {chosen?: number, brewed: number, recommended: Range, unit: TimeUnit};
  grind: Grind;
  recommendedGrind: Grind;
  taste?: Taste;
}

/**
 * A method's usual grind: the median of its grinds on the scale from fine to coarse.
 *
 * @param {Grind[]} grinds the method's usual grinds
 * @return {Grind} the grind
 */
const grindOf = (grinds: Grind[]): Grind =>
  GRINDS[Math.round(requiredMedian(grinds.map((grind) => GRINDS.indexOf(grind)), 'the grind'))];

/**
 * The water that suits a roast.
 *
 * @param {Roast} roast the roast
 * @return {Range} °C
 */
export const roastC = (roast: Roast): Range => medianRange(ROAST_C[roast]);

/**
 * The coffee a fully automatic machine grinds at a strength level: its least to its most, in even steps.
 *
 * @param {number} level 1 to the number of levels
 * @return {number} grams
 */
export const automatDose = (level: number): number => {
  const least = requiredMedian(AUTOMAT.doseG.least, 'the mildest dose');
  const most = requiredMedian(AUTOMAT.doseG.most, 'the strongest dose');
  return least + (level - 1) / (automatLevels() - 1) * (most - least);
};

/**
 * The cup a fully automatic machine pours for a drink, to 5 ml.
 *
 * @param {AutomatDrink} drink espresso or coffee
 * @return {number} ml of water
 */
export const automatCup = (drink: AutomatDrink): number =>
  Math.round(requiredMedian(AUTOMAT.cupMl[drink], `the ${drink} cup`) / 5) * 5;

const automatC = (level: AutomatLevel): number => {
  const low = requiredMedian(AUTOMAT.temperatureC.low, 'the lowest level');
  const high = requiredMedian(AUTOMAT.temperatureC.high, 'the highest level');
  return {low, normal: (low + high) / 2, high}[level];
};

/** Extraction in percentage points per grind step finer: the slope through the three grinds above. */
const GRIND_SLOPE = (() => {
  const points = GRIND_EXTRACTION.map(([grind, extraction]) => [GRINDS.indexOf(grind), extraction]);
  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const x = mean(points.map(([step]) => step));
  const y = mean(points.map(([, extraction]) => extraction));
  return points.reduce((sum, [step, extraction]) => sum + (step - x) * (extraction - y), 0) /
    points.reduce((sum, [step]) => sum + (step - x) ** 2, 0);
})();

/**
 * How fast extraction levels off, as a share of the recommended time: the time constant that puts the French press
 * points on one curve of 1 - e^(-t / τ), found by halving.
 */
const TIME_CONSTANT_SHARE = (() => {
  // Indexed rather than destructured: the web build's minifier folds this destructuring into NaN.
  const early = STEEP_EXTRACTION[0][0];
  const usual = STEEP_EXTRACTION[1][0];
  const target = STEEP_EXTRACTION[0][1] / STEEP_EXTRACTION[1][1];
  const rise = (tau: number) => (1 - Math.exp(-early / tau)) / (1 - Math.exp(-usual / tau));
  let low = 0.1;
  let high = 100;
  for (let step = 0; step < 60; step++) {
    const middle = (low + high) / 2;
    // A longer time constant rises more evenly, so the early point falls further below the usual one.
    if (rise(middle) < target) {
      high = middle;
    } else {
      low = middle;
    }
  }
  return (low + high) / 2 / usual;
})();

/**
 * A method's ratio for a strength, as the median.
 *
 * @param {CoffeeMethod} method the method
 * @param {Strength} strength mild, medium or strong
 * @return {number} grams of water per gram of coffee
 */
const namedRatio = (method: CoffeeMethod, strength: Strength): number =>
  requiredMedian(METHODS[method].strengths![strength], `the ${strength} ${method}`);

/**
 * The ratios a method's strength is chosen from, mildest first: from its mild to its strong in steps of 0.1, 0.2, 0.5
 * or 1, whichever cuts the range into about ten.
 *
 * @param {CoffeeMethod} method a method with strengths
 * @return {number[]} grams of water per gram of coffee
 */
export const strengthRatios = (method: CoffeeMethod): number[] => {
  const mild = namedRatio(method, 'mild');
  const strong = namedRatio(method, 'strong');
  const step = [0.1, 0.2, 0.5].find((candidate) => candidate >= (mild - strong) / 10) ?? 1;
  return stepsBetween(mild, strong, step);
};

/**
 * The ratio a brew takes: the method's scale nearest the one chosen, or nearest its medium.
 *
 * @param {CoffeeMethod} method the method
 * @param {number} chosen the ratio chosen, if any
 * @return {number} grams of water per gram of coffee
 */
export const chosenRatio = (method: CoffeeMethod, chosen?: number): number =>
  nearest(strengthRatios(method), chosen ?? namedRatio(method, 'medium'));

/**
 * The same place on another method's scale, so a strong pour-over becomes a strong espresso.
 *
 * @param {CoffeeMethod} from the method chosen so far
 * @param {CoffeeMethod} to the method chosen now
 * @param {number} ratio the ratio chosen so far, if any
 * @return {number | undefined} the ratio on the new scale, or none to take its medium
 */
export const carriedRatio = (from: CoffeeMethod, to: CoffeeMethod, ratio?: number): number | undefined => {
  if (ratio == null || !METHODS[from].strengths || !METHODS[to].strengths) {
    return undefined;
  }
  const before = strengthRatios(from);
  const after = strengthRatios(to);
  const share = before.indexOf(chosenRatio(from, ratio)) / (before.length - 1);
  return after[Math.round(share * (after.length - 1))];
};

/**
 * Hot extraction in % before the grind: the ideal band's middle at the recommended settings, more with a lighter roast,
 * hotter water (in proportion to °C) and a longer brew (levelling off as in the French press).
 *
 * @param {Roast} roast the roast
 * @param {number} temperatureC the water, if the brewer heats it
 * @param {number} brewed the time brewed, if the method has one
 * @param {number} usual the usual time
 * @return {number} extraction in %
 */
const hotExtraction = (roast: Roast, temperatureC?: number, brewed?: number, usual?: number): number => {
  const heat = temperatureC != null ? temperatureC / midpoint(roastC(roast)) : 1;
  const tau = usual && TIME_CONSTANT_SHARE * usual;
  const time = tau && brewed != null ? (1 - Math.exp(-brewed / tau)) / (1 - Math.exp(-usual! / tau)) : 1;
  const roastShare = requiredMedian(ROAST_EXTRACTION[roast], 'the roast\'s extraction') /
    requiredMedian(ROAST_EXTRACTION.medium, 'medium\'s extraction');
  return midpoint(medianRange(EXTRACTION_BAND)) * roastShare * heat * time;
};

/**
 * Coffee and water for what is given: a fully automatic machine's dose and cup, the coffee at hand or the drink.
 *
 * @param {CoffeeInputs} inputs the method and what is given
 * @return {object} grams of coffee and millilitres of water
 */
const amountsOf = (inputs: CoffeeInputs): {coffeeG: number, waterMl: number} => {
  if (inputs.method === 'fullyAutomatic') {
    return {coffeeG: automatDose(inputs.automatLevel), waterMl: Math.max(AUTOMAT.smallestCupMl, inputs.waterMl)};
  }
  const ratio = chosenRatio(inputs.method, inputs.ratio);
  const coffeeG = inputs.basis === 'coffee' ? inputs.coffeeG : inputs.waterMl / ratio;
  return {coffeeG, waterMl: coffeeG * ratio};
};

/**
 * Water the spent coffee keeps: a fully automatic machine's puck, none of an espresso weighed as the drink, else
 * the grounds'.
 *
 * @param {CoffeeMethod} method the method
 * @return {number} g per g of coffee
 */
const retainedOf = (method: CoffeeMethod): number => {
  if (method === 'fullyAutomatic') {
    return requiredMedian(PUCK_RETAINED, 'the water a puck keeps');
  }
  return METHODS[method].taste === 'espresso' ? 0 : requiredMedian(RETAINED, 'the water grounds keep');
};

/**
 * The water as brewed and what suits it: as chosen or the middle of what suits the roast where one sets it, a fully
 * automatic machine's level, a filter machine's own, or none.
 *
 * @param {CoffeeInputs} inputs the method, roast and settings
 * @return {object} the water, °C, and the recommended range
 */
const waterOf = (inputs: CoffeeInputs): {temperatureC?: number, recommendedC?: Range} => {
  const data = METHODS[inputs.method];
  const suits = roastC(inputs.roast);
  switch (data.heat) {
    case 'kettle':
    case 'machine':
      return {temperatureC: inputs.temperatureC ?? midpoint(suits), recommendedC: suits};
    case 'levels':
      return {temperatureC: automatC(inputs.automatTemperature), recommendedC: suits};
    case 'fixed': {
      const own = medianRange(data.waterC!);
      return {temperatureC: midpoint(own), recommendedC: own};
    }
    case 'none':
      return {};
  }
};

/**
 * A brew's time: the usual one, to the step; where the time is a dial, the one chosen within its limits; and the
 * one brewed.
 *
 * @param {CoffeeInputs} inputs the method, where cold brew steeps and the time chosen
 * @return {object} the time as shown, and the usual one, or nothing for a method without a time
 */
const brewTimeOf = (inputs: CoffeeInputs): {shown: NonNullable<CoffeeResult['brewTime']>, usual: number} |
    undefined => {
  const data = METHODS[inputs.method];
  const recommended = data.cold ? medianRange(COLD_BREW[inputs.steeping].steep) :
    data.brewTime?.ranges && medianRange(data.brewTime.ranges);
  if (!recommended || !data.brewTime) {
    return undefined;
  }
  const unit = data.brewTime.unit;
  const limits = data.brewTime.limits;
  const usual = Math.round(midpoint(recommended) / TIME_STEPS[unit]) * TIME_STEPS[unit];
  const chosen = limits && Math.min(limits.high, Math.max(limits.low, inputs.brewTime ?? usual));
  return {shown: {chosen, brewed: chosen ?? usual, recommended, unit}, usual};
};

/**
 * What a brew's strength is judged by: a fully automatic machine's by the drink it pours.
 *
 * @param {CoffeeInputs} inputs the method and a machine's drink
 * @return {TasteBand | undefined} the band, or none for a brew without one
 */
const tasteBandOf = (inputs: CoffeeInputs): TasteBand | undefined => {
  if (inputs.method !== 'fullyAutomatic') {
    return METHODS[inputs.method].taste;
  }
  return inputs.automatDrink === 'espresso' ? 'espresso' : 'filter';
};

/**
 * Where a value lies against a band.
 *
 * @param {number} value the value
 * @param {Range} band the band
 * @param {Array} names below, within and above it
 * @return {string} the name for where it lies
 */
const inBand = <T>(value: number, band: Range, names: readonly [T, T, T]): T => {
  if (value < band.low) {
    return names[0];
  }
  return value > band.high ? names[2] : names[1];
};

/** What a brew's taste depends on, as brewed. */
interface Brew {
  coffeeG: number;
  waterMl: number;
  temperatureC?: number;
  brewed?: number;
  usual?: number;
  grind: Grind;
  retained: number;
  dilution?: number;
}

/**
 * Where a brew lands in taste: its extraction, hot or cold and more with a finer grind, and the strength that gives
 * in the cup, with the lines of the method's mild, medium and strong or a machine's levels.
 *
 * @param {CoffeeInputs} inputs the method and settings
 * @param {TasteBand} band what its strength is judged by
 * @param {Brew} brew how it is brewed
 * @return {Taste} where it lands
 */
const tasteOf = (inputs: CoffeeInputs, band: TasteBand, brew: Brew): Taste => {
  const data = METHODS[inputs.method];
  const ideal = medianRange(EXTRACTION_BAND);
  const finer = GRINDS.indexOf(grindOf(data.grinds)) - GRINDS.indexOf(brew.grind);
  const extracted = data.cold ? coldExtraction(inputs.steeping, inputs.roast, brew.brewed!) :
    hotExtraction(inputs.roast, brew.temperatureC, brew.brewed, brew.usual);
  const extraction = Math.min(30, Math.max(10, extracted - GRIND_SLOPE * finer));
  // An espresso is weighed as the drink. Dripped, the drink is the water less what the grounds keep; steeped, the
  // grounds hold liquid as strong as the drink, so the strength spreads over all the water. Dilution adds to either.
  const slope = (ratio: number) => 1 / ((data.immersion ? ratio : ratio - brew.retained) * (1 + (brew.dilution ?? 0)));
  const ratios = inputs.method === 'fullyAutomatic' ?
    [1, Math.ceil(automatLevels() / 2), automatLevels()].map((level) => brew.waterMl / automatDose(level)) :
    STRENGTHS.map((strength) => chosenRatio(inputs.method, namedRatio(inputs.method, strength)));
  const tds = extraction * slope(brew.waterMl / brew.coffeeG);
  const strengthBand = medianRange(BANDS[band]);
  return {kind: band, tds, band: strengthBand, extraction, extractionBand: ideal,
    strength: inBand<Taste['strength']>(tds, strengthBand, ['weak', 'balanced', 'strong']),
    extracted: inBand<Taste['extracted']>(extraction, ideal, ['under', 'ideal', 'over']),
    lines: ratios.map((ratio) => ({ratio, slope: slope(ratio)}))};
};

/**
 * Coffee and water for a method, ratio and roast, and where the brew lands in taste.
 *
 * @param {CoffeeInputs} inputs the method, settings and what is given
 * @return {CoffeeResult} what to weigh and how to brew
 */
export const calculateCoffee = (inputs: CoffeeInputs): CoffeeResult => {
  const data = METHODS[inputs.method];
  const amounts = amountsOf(inputs);
  const ice = data.iceShare && midpoint(medianRange(data.iceShare));
  const dilution = data.dilution && median(data.dilution);
  const retained = retainedOf(inputs.method);
  const water = waterOf(inputs);
  const time = brewTimeOf(inputs);
  const recommendedGrind = grindOf(data.grinds);
  const grind = inputs.grind ?? recommendedGrind;
  const band = tasteBandOf(inputs);
  return {
    ratio: amounts.waterMl / amounts.coffeeG,
    coffeeG: amounts.coffeeG,
    waterMl: amounts.waterMl,
    iceG: ice != null ? amounts.waterMl * ice : undefined,
    // One part water to one of concentrate, which is the water less what the grounds keep.
    dilutionMl: dilution ? (amounts.waterMl - retained * amounts.coffeeG) * dilution : undefined,
    heat: data.heat,
    temperatureC: water.temperatureC,
    recommendedC: water.recommendedC,
    brewTime: time?.shown,
    grind,
    recommendedGrind,
    taste: band && tasteOf(inputs, band, {...amounts, temperatureC: water.temperatureC, brewed: time?.shown.brewed,
      usual: time?.usual, grind, retained, dilution}),
  };
};

/**
 * The recommended settings for a method, keeping the method, the beans, the amount and where cold brew steeps.
 *
 * @param {CoffeeInputs} inputs the settings now
 * @return {CoffeeInputs} the same, with strength, grind, water, time and a machine's levels as recommended
 */
export const recommendedCoffeeInputs = (inputs: CoffeeInputs): CoffeeInputs => ({
  ...inputs,
  ratio: undefined,
  grind: undefined,
  temperatureC: undefined,
  brewTime: undefined,
  automatLevel: DEFAULT_COFFEE_INPUTS.automatLevel,
  automatTemperature: DEFAULT_COFFEE_INPUTS.automatTemperature,
  waterMl: inputs.method === 'fullyAutomatic' ? automatCup(inputs.automatDrink) : inputs.waterMl,
});
