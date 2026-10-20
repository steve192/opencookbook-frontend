import {asRawInputs, readChoice, readNumber, readOptionalNumber} from '../inputs';
import {median, medianRange, midpoint, Range, requiredMedian} from '../sources';

export type TeaType = 'black' | 'green' | 'white' | 'oolong' | 'herbal' | 'rooibos' | 'matchaUsucha' | 'matchaKoicha';

export const TEA_TYPES: readonly TeaType[] = ['black', 'green', 'white', 'oolong', 'herbal', 'rooibos', 'matchaUsucha',
  'matchaKoicha'];

/** Steeped hot, in cold water for hours in the fridge, or hot at twice the strength over ice. */
export type TeaMethod = 'hot' | 'coldBrew' | 'iced';

export const TEA_METHODS: readonly TeaMethod[] = ['hot', 'coldBrew', 'iced'];

/** More or less tea for the same water and time: more leaf makes tea stronger, a longer steep only bitter. */
export type TeaStrength = 'light' | 'normal' | 'strong';

export const TEA_STRENGTHS: readonly TeaStrength[] = ['light', 'normal', 'strong'];

interface TeaData {
  /** Grams of tea per litre of water. */
  gramsPerLitre: number[];
  temperatureC: Range[];
  /** Steeping minutes; matcha is whisked instead. */
  minutes?: Range[];
  /** How many times the same leaves are steeped, hot; one when the sources give no more. */
  infusions?: number[];
  /** Hours in the fridge, for the teas that are cold brewed. */
  coldBrewHours?: number[];
}

// The open calculator gives 2 g per 200 ml for green and white tea and matcha, 3 g for black, herbal and rooibos,
// 3.5 g for fruit tea; 5 to 8 min for rooibos, 70 to 80 °C for matcha. Oolong: 3 g per 200 ml, 1 g per 50 to 60 ml,
// 2 to 3 g per 200 ml. Infusions, from five guides: black once but in one up to three times; green and white two to
// three, white three to five in one; oolong up to five, three to five, three to six and four. Cold brew: black 6 to
// 8 h, 12 h, 8 to 12 h; green 2 to 4 h, 3 to 6 h, 6 to 8 h, 2 to 4 h twice; white 2 to 4 h twice, 12 h twice; oolong
// 6 to 8 h twice, 12 h, up to 10 h, 6 to 10 h.
export const TEAS: Record<TeaType, TeaData> = {
  black: {gramsPerLitre: [11, 15], temperatureC: [{low: 100, high: 100}, {low: 90, high: 95}],
    minutes: [{low: 2, high: 5}, {low: 3, high: 5}, {low: 2, high: 4}], infusions: [1, 1, 3, 1, 1],
    coldBrewHours: [7, 12, 10]},
  green: {gramsPerLitre: [9, 12],
    temperatureC: [{low: 75, high: 85}, {low: 70, high: 80}],
    minutes: [{low: 1, high: 3}, {low: 3, high: 5}, {low: 1, high: 3}], infusions: [2.5, 3, 2.5, 3, 3],
    coldBrewHours: [3, 4.5, 7, 3, 3]},
  white: {gramsPerLitre: [7, 10], temperatureC: [{low: 75, high: 85}, {low: 75, high: 75}],
    minutes: [{low: 2, high: 4}, {low: 3, high: 4}, {low: 2, high: 3}], infusions: [2.5, 3, 3, 4],
    coldBrewHours: [3, 12, 3, 12]},
  oolong: {gramsPerLitre: [15, 1000 / 55, 12.5],
    temperatureC: [{low: 85, high: 96}, {low: 85, high: 90.5}, {low: 85, high: 95}, {low: 80, high: 80}],
    minutes: [{low: 3, high: 5}, {low: 1, high: 3}, {low: 3, high: 5}, {low: 1, high: 4}, {low: 2, high: 3},
      {low: 3, high: 5}], infusions: [5, 4, 4.5, 4, 4], coldBrewHours: [7, 12, 7, 10, 8]},
  // Cold brew: fruit tea 8 to 12 h, herbal 12 h, fresh herbs 5 h.
  herbal: {gramsPerLitre: [11, (15 + 17.5) / 2], temperatureC: [{low: 100, high: 100}, {low: 100, high: 100}],
    minutes: [{low: 5, high: 8}, {low: 4, high: 10}], coldBrewHours: [10, 12, 5]},
  // Cold brew: 4 h, 6 to 10 h, 8 to 10 h, from three brands.
  rooibos: {gramsPerLitre: [9, 15], temperatureC: [{low: 100, high: 100}, {low: 95, high: 95}],
    minutes: [{low: 6, high: 9}, {low: 5, high: 8}], coldBrewHours: [4, 8, 9]},
  matchaUsucha: {gramsPerLitre: [2 / 65 * 1000, 2 / 70 * 1000],
    temperatureC: [{low: 75, high: 80}, {low: 70, high: 80}]},
  matchaKoicha: {gramsPerLitre: [4 / 30 * 1000, 3.75 / 40 * 1000],
    temperatureC: [{low: 75, high: 80}, {low: 70, high: 80}]},
};

/** Iced tea, as tea guides and tea sellers agree: brew it twice as strong and pour it over the same weight of ice. */
export const ICED_TEA = {strengthFactor: 2, iceToTea: 1};

/** Cold brew in grams per litre, whatever the tea: 10, 6, 20, 12 and 12 g. */
const COLD_BREW_GRAMS_PER_LITRE = [10, 6, 20, 12, 12];

/** Tea against the usual amount: half a teaspoon less or more of one, 6 against 10 g, a heaped one or two, 3 against 2 g. */
const STRENGTH: Record<TeaStrength, number[]> = {light: [0.5, 0.6, 0.6], normal: [1], strong: [1.5, 1.625, 1.5]};

/** Minutes each further infusion steeps longer: 30 to 60 s, 30 to 60 s, 2 min, 30 s. */
const INFUSION_STEP_MINUTES = [0.75, 0.75, 2, 0.5];

/**
 * The methods a tea is made with: matcha is whisked hot, every steeped tea is also iced or cold brewed.
 *
 * @param {TeaType} type the tea
 * @return {TeaMethod[]} its methods
 */
export const methodsOf = (type: TeaType): TeaMethod[] =>
  TEA_METHODS.filter((method) => method === 'hot' || TEAS[type].minutes != null);

/**
 * Herbs, fruit and rooibos are dried, not heated, and can carry germs only boiling water kills: consumer advice is to
 * brew them hot and let them cool, unless sold for cold brewing (Verbraucherzentrale Bremen).
 */
export const RAW_HERBS: readonly TeaType[] = ['herbal', 'rooibos'];

/** Polyphenols, which taste astringent and bitter, keep dissolving until 6 to 8 min; little else is left after. */
const STEEP_PLATEAU_MINUTES = 7;

/**
 * The steeping minutes to choose from: the guides' shortest up to the plateau, or their longest if later.
 *
 * @param {TeaType} type a steeped tea
 * @return {Range} minutes
 */
export const steepRange = (type: TeaType): Range => {
  const guides = medianRange(TEAS[type].minutes ?? []);
  return {low: guides.low, high: Math.max(guides.high, STEEP_PLATEAU_MINUTES)};
};

/**
 * Whether a tea comes in strengths: steeped tea does; matcha's are its kinds.
 *
 * @param {TeaType} type the tea
 * @return {boolean} whether it does
 */
export const hasStrength = (type: TeaType): boolean => TEAS[type].minutes != null;

export interface TeaInputs {
  type: TeaType;
  method: TeaMethod;
  strength: TeaStrength;
  /** Hot or iced: the steeping time; undefined takes the middle of the guides'. */
  steepMinutes?: number;
  waterMl: number;
}

export const DEFAULT_TEA_INPUTS: TeaInputs = {type: 'black', method: 'hot', strength: 'normal', waterMl: 500};

export const parseTeaInputs = (raw: unknown): TeaInputs => {
  const fields = asRawInputs(raw);
  const d = DEFAULT_TEA_INPUTS;
  const type = readChoice(fields, 'type', TEA_TYPES, d.type);
  return {
    type,
    method: readChoice(fields, 'method', methodsOf(type), d.method),
    strength: readChoice(fields, 'strength', TEA_STRENGTHS, d.strength),
    steepMinutes: readOptionalNumber(fields, 'steepMinutes', 0.25, 30),
    waterMl: readNumber(fields, 'waterMl', d.waterMl, 10, 10000),
  };
};

/**
 * How the steeping time shapes the cup, by thirds of the guides' time: the first fresher and lighter, the middle round,
 * the last fuller and more astringent, past it only more bitter; herbs and rooibos, with few tannins, milder, round,
 * stronger and past the guides very intense.
 */
export type SteepTaste = 'fresh' | 'round' | 'full' | 'bitter' | 'mild' | 'strong' | 'intense';

export interface TeaResult {
  teaG: number;
  /** Hot water; cold brew uses cold water. */
  temperatureC?: Range;
  /** The guides' steeping minutes. */
  minutes?: Range;
  /** The steeping minutes chosen, within the range to choose from. */
  steepMinutes?: number;
  taste?: SteepTaste;
  /** Cold brew's hours in the fridge. */
  hours?: number;
  iceG?: number;
  /** Hot tea steeped more than once: how often, and how many minutes longer each further time. */
  infusions?: {count: number, stepMinutes: number};
}

const steepTaste = (type: TeaType, steep: number, guides: Range): SteepTaste => {
  const herbs = RAW_HERBS.includes(type);
  if (steep > guides.high) {
    return herbs ? 'intense' : 'bitter';
  }
  const third = (guides.high - guides.low) / 3;
  if (steep < guides.low + third) {
    return herbs ? 'mild' : 'fresh';
  }
  return steep > guides.high - third ? (herbs ? 'strong' : 'full') : 'round';
};

/**
 * Tea, water temperature and steeping time for a pot or a cup.
 *
 * @param {TeaInputs} inputs the tea, how it is made and the water
 * @return {TeaResult} what to do
 */
export const calculateTea = (inputs: TeaInputs): TeaResult => {
  const data = TEAS[inputs.type];
  const strength = hasStrength(inputs.type) ? requiredMedian(STRENGTH[inputs.strength], 'the strength') : 1;
  const litres = inputs.waterMl / 1000;
  if (inputs.method === 'coldBrew') {
    return {teaG: requiredMedian(COLD_BREW_GRAMS_PER_LITRE, 'cold brew tea') * litres * strength,
      hours: requiredMedian(data.coldBrewHours ?? [], 'the hours of cold brew')};
  }
  const iced = inputs.method === 'iced';
  const infusions = iced ? 1 : Math.round(median(data.infusions ?? []) ?? 1);
  const minutes = data.minutes && medianRange(data.minutes);
  const range = minutes && steepRange(inputs.type);
  const steepMinutes = range && Math.min(range.high, Math.max(range.low, inputs.steepMinutes ?? midpoint(minutes!)));
  return {
    teaG: requiredMedian(data.gramsPerLitre, 'the tea') * litres * strength * (iced ? ICED_TEA.strengthFactor : 1),
    temperatureC: medianRange(data.temperatureC),
    minutes,
    steepMinutes,
    taste: steepMinutes != null ? steepTaste(inputs.type, steepMinutes, minutes!) : undefined,
    iceG: iced ? inputs.waterMl * ICED_TEA.iceToTea : undefined,
    infusions: infusions > 1 ?
      {count: infusions, stepMinutes: requiredMedian(INFUSION_STEP_MINUTES, 'the longer infusions')} : undefined,
  };
};
