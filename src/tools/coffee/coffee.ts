import {asRawInputs, readChoice, readNumber} from '../inputs';
import {median, medianRange, midpoint, Range} from '../sources';

export type CoffeeMethod = 'pourOver' | 'filterMachine' | 'frenchPress' | 'aeroPress' | 'moka' | 'espresso' |
  'coldBrewConcentrate' | 'coldBrewReady' | 'japaneseIced';

export const COFFEE_METHODS: readonly CoffeeMethod[] = ['pourOver', 'filterMachine', 'frenchPress', 'aeroPress', 'moka',
  'espresso', 'coldBrewConcentrate', 'coldBrewReady', 'japaneseIced'];

export type Strength = 'mild' | 'medium' | 'strong';

export const STRENGTHS: readonly Strength[] = ['mild', 'medium', 'strong'];

interface MethodData {
  /** Grams of water per gram of coffee, as each published guide gives its range. */
  ratios: Range[];
  /** Hot water, °C. */
  waterC?: Range[];
  /** Contact time as each guide gives it: minutes, hours for cold brew. */
  steep?: {ranges: Range[], unit: 'minutes' | 'hours'};
  /** Share of the water that goes in as ice. */
  iceShare?: Range[];
  /** Water to add per gram of concentrate. */
  dilution?: number[];
}

const HOT = [{low: 92, high: 96}, {low: 90.5, high: 96}];

const exactly = (value: number): Range => ({low: value, high: value});

export const METHODS: Record<CoffeeMethod, MethodData> = {
  pourOver: {ratios: [exactly(16), {low: 15, high: 17}], waterC: HOT},
  filterMachine: {ratios: [exactly(1000 / 55), {low: 1000 / 60, high: 1000 / 55}], waterC: HOT},
  frenchPress: {ratios: [{low: 12, high: 17}, {low: 14, high: 15}, {low: 15, high: 17}], waterC: HOT,
    steep: {ranges: [exactly(4), exactly(4), exactly(4)], unit: 'minutes'}},
  aeroPress: {ratios: [{low: 13, high: 16}, {low: 12, high: 16}, {low: 11, high: 13}], waterC: HOT},
  moka: {ratios: [{low: 7, high: 9}, exactly(7), exactly(10)]},
  // The open calculator: 33 to 67 g per 100 ml, 1:2 at normal strength.
  espresso: {ratios: [exactly(2), exactly(2), exactly(2), exactly(2), {low: 100 / 67, high: 100 / 33}]},
  coldBrewConcentrate: {ratios: [{low: 4, high: 5}, exactly(6), exactly(8)],
    steep: {ranges: [{low: 12, high: 18}, {low: 12, high: 24}, {low: 16, high: 18}, {low: 12, high: 24}],
      unit: 'hours'}, dilution: [1, 1]},
  coldBrewReady: {ratios: [{low: 12, high: 15}, exactly(8)],
    steep: {ranges: [{low: 12, high: 18}, {low: 16, high: 18}], unit: 'hours'}},
  // Water and ice together per gram: 1:15 four times, 600 g on 35 g, 500 g on 35 g. Ice: 35 to 40 %, 35 to 45 %,
  // 40 %, 200 of 600 g, 165 of 500 g, 100 of 300 g.
  japaneseIced: {ratios: [exactly(15), exactly(15), exactly(15), exactly(600 / 35), exactly(500 / 35), exactly(15)],
    waterC: HOT, iceShare: [{low: 0.35, high: 0.40}, {low: 0.35, high: 0.45}, exactly(0.4), exactly(200 / 600),
      exactly(165 / 500), exactly(100 / 300)]},
};

export interface CoffeeInputs {
  method: CoffeeMethod;
  /** What is given: the drink's water or the coffee at hand. */
  basis: 'water' | 'coffee';
  waterMl: number;
  coffeeG: number;
  strength: Strength;
}

export const DEFAULT_COFFEE_INPUTS: CoffeeInputs = {method: 'pourOver', basis: 'water', waterMl: 500, coffeeG: 30,
  strength: 'medium'};

export const parseCoffeeInputs = (raw: unknown): CoffeeInputs => {
  const fields = asRawInputs(raw);
  const d = DEFAULT_COFFEE_INPUTS;
  return {
    method: readChoice(fields, 'method', COFFEE_METHODS, d.method),
    basis: readChoice(fields, 'basis', ['water', 'coffee'] as const, d.basis),
    waterMl: readNumber(fields, 'waterMl', d.waterMl, 10, 10000),
    coffeeG: readNumber(fields, 'coffeeG', d.coffeeG, 1, 1000),
    strength: readChoice(fields, 'strength', STRENGTHS, d.strength),
  };
};

export interface CoffeeResult {
  /** Grams of water per gram of coffee. */
  ratio: number;
  coffeeG: number;
  /** All the water, ice included. */
  waterMl: number;
  iceG?: number;
  /** Water to add to the concentrate before drinking. */
  dilutionMl?: number;
  waterC?: {low: number, high: number};
  steep?: {low: number, high: number, unit: 'minutes' | 'hours'};
}

/**
 * Coffee and water for a method and strength: strong uses the least water per gram the guides give, mild the most.
 *
 * @param {CoffeeInputs} inputs the method, strength and what is given
 * @return {CoffeeResult} what to weigh
 */
export const calculateCoffee = (inputs: CoffeeInputs): CoffeeResult => {
  const data = METHODS[inputs.method];
  const ratios = medianRange(data.ratios);
  const ratio = {strong: ratios.low, medium: midpoint(ratios), mild: ratios.high}[inputs.strength];
  // A millilitre of water weighs a gram.
  const coffeeG = inputs.basis === 'coffee' ? inputs.coffeeG : inputs.waterMl / ratio;
  const waterMl = coffeeG * ratio;
  const ice = data.iceShare && midpoint(medianRange(data.iceShare));
  const dilution = data.dilution && median(data.dilution);
  return {
    ratio,
    coffeeG,
    waterMl,
    iceG: ice != null ? waterMl * ice : undefined,
    dilutionMl: dilution ? waterMl * dilution : undefined,
    waterC: data.waterC && medianRange(data.waterC),
    steep: data.steep && {...medianRange(data.steep.ranges), unit: data.steep.unit},
  };
};
