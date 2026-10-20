import {asRawInputs, readChoice, readNumber, readOptionalNumber} from '../inputs';
import {median, medianRange, midpoint, Range, requiredMedian} from '../sources';

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

/** How strength is judged: filter coffee's band or espresso's. */
type TasteBand = 'filter' | 'espresso';

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
   * Grams of water per gram of coffee for each strength: what the calculators give for it, or the ends of the guides'
   * ranges, the least water strong and the most mild. A fully automatic machine doses by its own levels.
   */
  strengths?: Record<Strength, number[]>;
  heat: Heat;
  /** A filter machine's water, °C. */
  waterC?: Range[];
  /** The guides' brew times; `limits` are what can be chosen where the brewer sets the time. */
  brewTime?: {ranges: Range[], unit: TimeUnit, limits?: Range};
  /** As each guide gives it. */
  grinds: Grind[];
  /** Share of the water that goes in as ice. */
  iceShare?: Range[];
  /** Water to add per gram of concentrate. */
  dilution?: number[];
  taste?: TasteBand;
}

const HOT = [{low: 92, high: 96}, {low: 90.5, high: 96}];

const exactly = (value: number): Range => ({low: value, high: value});

// Grinds from five guides: pour-over medium-fine three times, medium-coarse once, medium three times.
const POUR_OVER_GRINDS: Grind[] = ['mediumFine', 'mediumFine', 'mediumCoarse', 'medium', 'mediumFine', 'medium',
  'medium'];

const ESPRESSO_GRINDS: Grind[] = ['fine', 'extraFine', 'fine'];

// Strengths from three calculators (mild, average, strong or robust) and the guides' ranges; brew times from five
// guides and calculators.
export const METHODS: Record<CoffeeMethod, MethodData> = {
  pourOver: {strengths: {mild: [18, 18], medium: [16, 16, 16], strong: [15, 13, 13]}, heat: 'kettle',
    brewTime: {ranges: [{low: 2.5, high: 4}, {low: 2.5, high: 4}, {low: 3, high: 4}, {low: 3, high: 4}],
      unit: 'minutes', limits: {low: 1.5, high: 6}}, grinds: POUR_OVER_GRINDS, taste: 'filter'},
  filterMachine: {strengths: {mild: [18, 1000 / 55], medium: [16, 17], strong: [13, 1000 / 60]}, heat: 'fixed',
    waterC: HOT, grinds: ['mediumFine', 'mediumFine', 'mediumFine', 'medium', 'medium'], taste: 'filter'},
  frenchPress: {strengths: {mild: [17, 18, 17, 17], medium: [15, 15, 15, 14.5], strong: [13, 13, 13, 12, 14]},
    heat: 'kettle', brewTime: {ranges: [exactly(4), exactly(4), exactly(4), exactly(4), exactly(4), exactly(6)],
      unit: 'minutes', limits: {low: 2, high: 10}}, grinds: ['coarse', 'coarse', 'coarse', 'coarse', 'coarse',
      'coarse'], taste: 'filter'},
  aeroPress: {strengths: {mild: [18, 16, 16, 13], medium: [14, 11, 14.5, 14, 12], strong: [13, 12, 11]},
    heat: 'kettle', brewTime: {ranges: [{low: 1, high: 2.5}, exactly(2)], unit: 'minutes', limits: {low: 0.5, high: 4}},
    grinds: ['mediumFine', 'mediumFine', 'mediumFine', 'mediumFine', 'medium'], taste: 'filter'},
  moka: {strengths: {mild: [9, 9, 9, 10], medium: [8, 8, 10, 7], strong: [6, 6, 7]}, heat: 'none',
    grinds: ['fine', 'fine', 'fine', 'mediumFine', 'fine']},
  // Lungo, normale and ristretto, from two calculators and four guides.
  espresso: {strengths: {mild: [3.5, 3], medium: [2, 2, 2, 2, 2, 2], strong: [1.25, 1.5]}, heat: 'machine',
    brewTime: {ranges: [{low: 25, high: 30}, {low: 25, high: 30}, {low: 25, high: 35}, exactly(20),
      {low: 25, high: 30}], unit: 'seconds', limits: {low: 15, high: 45}}, grinds: ESPRESSO_GRINDS, taste: 'espresso'},
  // It brews like an espresso machine; its band follows the drink chosen.
  fullyAutomatic: {heat: 'levels', grinds: ESPRESSO_GRINDS},
  coldBrewConcentrate: {strengths: {mild: [10, 5, 8], medium: [8, 40 / 9, 6, 4.5, 8], strong: [5, 4]}, heat: 'none',
    brewTime: {ranges: [{low: 12, high: 18}, {low: 12, high: 24}, {low: 16, high: 18}, {low: 12, high: 24}],
      unit: 'hours', limits: {low: 8, high: 30}}, grinds: ['coarse', 'coarse', 'coarse', 'coarse'], dilution: [1, 1]},
  coldBrewReady: {strengths: {mild: [15, 8], medium: [13.5, 8], strong: [12, 8]}, heat: 'none',
    brewTime: {ranges: [{low: 12, high: 18}, {low: 16, high: 18}], unit: 'hours', limits: {low: 8, high: 30}},
    grinds: ['coarse', 'coarse', 'coarse', 'coarse']},
  // Water and ice together per gram: 1:15 four times, 600 g on 35 g, 500 g on 35 g. Ice: 35 to 40 %, 35 to 45 %,
  // 40 %, 200 of 600 g, 165 of 500 g, 100 of 300 g.
  japaneseIced: {strengths: {mild: [600 / 35], medium: [15, 15, 15, 600 / 35, 500 / 35, 15], strong: [500 / 35]},
    heat: 'kettle', grinds: POUR_OVER_GRINDS, iceShare: [{low: 0.35, high: 0.40}, {low: 0.35, high: 0.45},
      exactly(0.4), exactly(200 / 600), exactly(165 / 500), exactly(100 / 300)], taste: 'filter'},
};

const fahrenheit = (low: number, high: number): Range => ({low: (low - 32) / 1.8, high: (high - 32) / 1.8});

/** Water by roast from seven brewing guides and calculators: darker roasts give up their solubles at cooler water. */
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
 * A fully automatic machine, from manuals and dealers: strength levels (8, 3 and 5 bean symbols); the coffee it grinds
 * per cup at the mildest and strongest (6 to 14, 6 to 12, 5 to 12, 7 to 12 g, up to 16 g); its water at the lowest and
 * highest level (85 to 95, 90 to 95, 90 to 98 °C); the water per cup (an espresso of 45 ml as one maker sets it, 25 to
 * 40, 27 and 30 to 35 ml in guides; a coffee of 100 and 120 ml as the same maker sets it, 130 ml as another states and
 * 125 ml or more in a guide), and its smallest, a ristretto of 25 ml.
 */
export const AUTOMAT = {
  levels: [8, 3, 5],
  doseG: {least: [6, 6, 5, 7], most: [14, 12, 12, 12, 16]},
  temperatureC: {low: [85, 90, 90], high: [95, 95, 98]},
  cupMl: {espresso: [45, 32.5, 27, 32.5], coffee: [100, 120, 130, 125]} satisfies Record<AutomatDrink, number[]>,
  smallestCupMl: 25,
};

/** What dissolves, in % of the coffee, as the brewing standards and two espresso guides want it: 18 to 22 %. */
const EXTRACTION_BAND: Range[] = [{low: 18, high: 22}, {low: 18, high: 22}, {low: 18, high: 22}];

/** Water the spent grounds keep, in g per g: about 2 dripped, about 3 steeped, 2 to 2.5 at most, 1.8 to 2.2. */
const RETAINED = [2, 3, 2.25, 2];

/** Water a spent espresso puck keeps, in g per g: about 1, and about 18 g in a 15 g puck. */
const PUCK_RETAINED = [1, 18 / 15];

/** Strength in % dissolved solids: filter coffee 1.15 to 1.35, 1.30 to 1.55 and twice 1.15 to 1.45; espresso 8 to 12. */
const BANDS: Record<TasteBand, Range[]> = {
  filter: [{low: 1.15, high: 1.35}, {low: 1.30, high: 1.55}, {low: 1.15, high: 1.45}, {low: 1.15, high: 1.45}],
  espresso: [{low: 8, high: 12}, {low: 8, high: 12}],
};

/** Extraction in % at three grinds of one V60 experiment: the espresso setting, the filter one and French press. */
const GRIND_EXTRACTION: [Grind, number][] = [['fine', 21], ['mediumFine', 18.8], ['coarse', 15]];

/**
 * French press extraction in % against minutes from two brewing guides: 15 to 16.5 % at 2.5 to 3 min, about 19 % at
 * 4 min; it levels off after, as Barista Hustle found plunging at 8 and at 10 min alike.
 */
const STEEP_EXTRACTION: [number, number][] = [[2.75, 15.75], [4, 19]];

export interface CoffeeInputs {
  method: CoffeeMethod;
  /** What is given: the drink's water or the coffee at hand. */
  basis: 'water' | 'coffee';
  /** The drink's water; for a fully automatic machine the cup. */
  waterMl: number;
  coffeeG: number;
  strength: Strength;
  roast: Roast;
  /** Undefined takes what the method's guides give. */
  grind?: Grind;
  /** A kettle's or espresso machine's water, °C; undefined takes the middle of what suits the roast. */
  temperatureC?: number;
  /** In the method's unit; undefined takes the middle of the guides' time. */
  brewTime?: number;
  automatLevel: number;
  automatDrink: AutomatDrink;
  automatTemperature: AutomatLevel;
}

export const DEFAULT_COFFEE_INPUTS: CoffeeInputs = {method: 'pourOver', basis: 'water', waterMl: 500, coffeeG: 30,
  strength: 'medium', roast: 'medium', automatLevel: 3, automatDrink: 'coffee', automatTemperature: 'normal'};

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
    strength: readChoice(fields, 'strength', STRENGTHS, d.strength),
    roast: readChoice(fields, 'roast', ROASTS, d.roast),
    grind: GRINDS.includes(fields.grind as Grind) ? fields.grind as Grind : undefined,
    temperatureC: readOptionalNumber(fields, 'temperatureC', 70, 100),
    brewTime: readOptionalNumber(fields, 'brewTime', 0.1, 48),
    automatLevel: Math.round(readNumber(fields, 'automatLevel', d.automatLevel, 1, automatLevels())),
    automatDrink: readChoice(fields, 'automatDrink', ['espresso', 'coffee'] as const, d.automatDrink),
    automatTemperature: readChoice(fields, 'automatTemperature', AUTOMAT_TEMPERATURES, d.automatTemperature),
  };
};

/**
 * Where a brew lands: its strength against the band for its kind and its extraction against the standards', both
 * estimated, as nothing is measured.
 */
export interface Taste {
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
  brewTime?: {chosen?: number, recommended: Range, unit: TimeUnit};
  grind: Grind;
  recommendedGrind: Grind;
  taste?: Taste;
}

/**
 * The grind most guides give a method, as the median on the scale from fine to coarse.
 *
 * @param {Grind[]} grinds each guide's
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

/** Extraction in percentage points per grind step finer: the slope through the experiment's three grinds. */
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
 * Coffee and water for a method, strength and roast, and where the brew lands in taste. Extraction is estimated:
 * the standards' middle at what the guides recommend, more with finer grinding (the experiment's slope), hotter
 * water (in proportion to °C) and a longer brew (levelling off as in the French press).
 *
 * @param {CoffeeInputs} inputs the method, settings and what is given
 * @return {CoffeeResult} what to weigh and how to brew
 */
export const calculateCoffee = (inputs: CoffeeInputs): CoffeeResult => {
  const data = METHODS[inputs.method];
  const automat = inputs.method === 'fullyAutomatic';
  const ratioOf = (strength: Strength) => requiredMedian(data.strengths![strength], `the ${strength} ${inputs.method}`);
  const coffeeG = automat ? automatDose(inputs.automatLevel) :
    inputs.basis === 'coffee' ? inputs.coffeeG : inputs.waterMl / ratioOf(inputs.strength);
  const waterMl = automat ? Math.max(AUTOMAT.smallestCupMl, inputs.waterMl) : coffeeG * ratioOf(inputs.strength);
  const ice = data.iceShare && midpoint(medianRange(data.iceShare));
  const dilution = data.dilution && median(data.dilution);
  const dilutionMl = dilution ? waterMl * dilution : undefined;

  const suits = roastC(inputs.roast);
  const temperatureC = {kettle: inputs.temperatureC ?? midpoint(suits), machine: inputs.temperatureC ?? midpoint(suits),
    levels: automatC(inputs.automatTemperature), fixed: data.waterC && midpoint(medianRange(data.waterC)),
    none: undefined}[data.heat];
  const recommendedC = data.heat === 'fixed' ? medianRange(data.waterC!) : data.heat === 'none' ? undefined : suits;

  const recommendedTime = data.brewTime && medianRange(data.brewTime.ranges);
  const limits = data.brewTime?.limits;
  const step = TIME_STEPS[data.brewTime?.unit ?? 'minutes'];
  const usualTime = recommendedTime && Math.round(midpoint(recommendedTime) / step) * step;
  const chosenTime = usualTime != null && limits ?
    Math.min(limits.high, Math.max(limits.low, inputs.brewTime ?? usualTime)) : undefined;
  const recommendedGrind = grindOf(data.grinds);
  const grind = inputs.grind ?? recommendedGrind;

  const band = automat ? (inputs.automatDrink === 'espresso' ? 'espresso' : 'filter') : data.taste;
  const taste = band && (() => {
    const ideal = medianRange(EXTRACTION_BAND);
    const heat = temperatureC != null && data.heat !== 'none' ? temperatureC / midpoint(suits) : 1;
    const tau = usualTime && TIME_CONSTANT_SHARE * usualTime;
    const time = tau && chosenTime != null ? (1 - Math.exp(-chosenTime / tau)) / (1 - Math.exp(-usualTime! / tau)) : 1;
    const finer = GRINDS.indexOf(recommendedGrind) - GRINDS.indexOf(grind);
    const extraction = Math.min(30, Math.max(10, midpoint(ideal) * heat * time - GRIND_SLOPE * finer));
    // An espresso is weighed as the drink; a machine's cup and other brews lose the water the grounds keep.
    const retained = automat ? requiredMedian(PUCK_RETAINED, 'the water a puck keeps') :
      band === 'espresso' ? 0 : requiredMedian(RETAINED, 'the water grounds keep');
    const slope = (ratio: number) => 1 / (ratio - retained + ratio * (dilution ?? 0));
    const ratios = automat ? [1, Math.ceil(automatLevels() / 2), automatLevels()]
        .map((level) => waterMl / automatDose(level)) : STRENGTHS.map(ratioOf);
    const tds = extraction * slope(waterMl / coffeeG);
    const strengthBand = medianRange(BANDS[band]);
    return {tds, band: strengthBand, extraction, extractionBand: ideal,
      strength: tds < strengthBand.low ? 'weak' : tds > strengthBand.high ? 'strong' : 'balanced',
      extracted: extraction < ideal.low ? 'under' : extraction > ideal.high ? 'over' : 'ideal',
      lines: ratios.map((ratio) => ({ratio, slope: slope(ratio)}))} satisfies Taste;
  })();

  return {
    ratio: waterMl / coffeeG,
    coffeeG,
    waterMl,
    iceG: ice != null ? waterMl * ice : undefined,
    dilutionMl,
    heat: data.heat,
    temperatureC,
    recommendedC,
    brewTime: recommendedTime && {chosen: chosenTime, recommended: recommendedTime, unit: data.brewTime!.unit},
    grind,
    recommendedGrind,
    taste,
  };
};
