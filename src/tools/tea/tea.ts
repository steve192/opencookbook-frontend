import {asRawInputs, readChoice, readNumber} from '../inputs';
import {median, medianRange, Range} from '../sources';

export type TeaType = 'black' | 'green' | 'white' | 'herbal' | 'rooibos' | 'matchaUsucha' | 'matchaKoicha';

export const TEA_TYPES: readonly TeaType[] = ['black', 'green', 'white', 'herbal', 'rooibos', 'matchaUsucha',
  'matchaKoicha'];

interface TeaData {
  /** Grams of tea per litre of water. */
  gramsPerLitre: number[];
  temperatureC: Range[];
  /** Steeping minutes; matcha is whisked instead. */
  minutes?: Range[];
}

// The open calculator gives 2 g per 200 ml for green and white tea and matcha, 3 g for black, herbal and rooibos,
// 3.5 g for fruit tea; 5 to 8 min for rooibos, 70 to 80 °C for matcha.
export const TEAS: Record<TeaType, TeaData> = {
  black: {gramsPerLitre: [11, 15], temperatureC: [{low: 100, high: 100}, {low: 90, high: 95}],
    minutes: [{low: 2, high: 5}, {low: 3, high: 5}, {low: 2, high: 4}]},
  green: {gramsPerLitre: [9, 12],
    temperatureC: [{low: 75, high: 85}, {low: 70, high: 80}],
    minutes: [{low: 1, high: 3}, {low: 3, high: 5}, {low: 1, high: 3}]},
  white: {gramsPerLitre: [7, 10], temperatureC: [{low: 75, high: 85}, {low: 75, high: 75}],
    minutes: [{low: 2, high: 4}, {low: 3, high: 4}, {low: 2, high: 3}]},
  herbal: {gramsPerLitre: [11, (15 + 17.5) / 2], temperatureC: [{low: 100, high: 100}, {low: 100, high: 100}],
    minutes: [{low: 5, high: 8}, {low: 4, high: 10}]},
  rooibos: {gramsPerLitre: [9, 15], temperatureC: [{low: 100, high: 100}, {low: 95, high: 95}],
    minutes: [{low: 6, high: 9}, {low: 5, high: 8}]},
  matchaUsucha: {gramsPerLitre: [2 / 65 * 1000, 2 / 70 * 1000],
    temperatureC: [{low: 75, high: 80}, {low: 70, high: 80}]},
  matchaKoicha: {gramsPerLitre: [4 / 30 * 1000, 3.75 / 40 * 1000],
    temperatureC: [{low: 75, high: 80}, {low: 70, high: 80}]},
};

/** Iced tea, as tea guides and tea sellers agree: brew it twice as strong and pour it over the same weight of ice. */
export const ICED_TEA = {strengthFactor: 2, iceToTea: 1};

export const ICED_TEA_TYPES: readonly TeaType[] = ['black', 'green'];

export interface TeaInputs {
  type: TeaType;
  waterMl: number;
  iced: boolean;
}

export const DEFAULT_TEA_INPUTS: TeaInputs = {type: 'black', waterMl: 500, iced: false};

export const parseTeaInputs = (raw: unknown): TeaInputs => {
  const fields = asRawInputs(raw);
  const type = readChoice(fields, 'type', TEA_TYPES, DEFAULT_TEA_INPUTS.type);
  return {
    type,
    waterMl: readNumber(fields, 'waterMl', DEFAULT_TEA_INPUTS.waterMl, 10, 10000),
    iced: ICED_TEA_TYPES.includes(type) && fields.iced === true,
  };
};

export interface TeaResult {
  teaG: number;
  temperatureC: {low: number, high: number};
  minutes?: {low: number, high: number};
  iceG?: number;
}

/**
 * Tea, water temperature and steeping time for a pot or a cup.
 *
 * @param {TeaInputs} inputs the tea and the water
 * @return {TeaResult} what to do
 */
export const calculateTea = (inputs: TeaInputs): TeaResult => {
  const data = TEAS[inputs.type];
  const strength = inputs.iced ? ICED_TEA.strengthFactor : 1;
  return {
    teaG: median(data.gramsPerLitre)! * inputs.waterMl / 1000 * strength,
    temperatureC: medianRange(data.temperatureC),
    minutes: data.minutes && medianRange(data.minutes),
    iceG: inputs.iced ? inputs.waterMl * ICED_TEA.iceToTea : undefined,
  };
};
