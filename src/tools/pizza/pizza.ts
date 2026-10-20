import {pizzaCalibration, recommendedDoughC} from '../dough/calibration';
import {DOUGH_LEAVENERS, DoughAmounts, DoughLeavener, doughWarnings, DoughWarning, isTooLittleToWeigh, Kneading,
  KNEADINGS, leavenerNeeded, waterTemperature, weighDough} from '../dough/dough';
import {BakeTime, FRIDGE_MAX_C, presetStages, readBakeTime, readStages, ROOM_C, SCHEDULE_CHOICES, ScheduleChoice,
  scheduleStages, totalHours} from '../dough/stages';
import {Calibration, Stage} from '../fermentation/fermentation';
import {asRawInputs, readChoice, readNumber, readOptionalNumber} from '../inputs';
import {convertYeast} from '../yeast/yeast';
import {median, medianRange, Range, requiredMedian} from '../sources';
import {BakeOven, BakeRecipe, FLOURS, HOME_OVEN_RECIPES, PIZZA_DIAMETERS, PIZZA_FLOURS, PIZZA_OVENS, PIZZA_STYLES, PizzaFlour,
  PizzaOven, PizzaStyle, PIZZA_YEAST_RECIPES, STYLES, W_BANDS} from './pizzaData';

export type AmountMode = 'balls' | 'pizzas' | 'trays' | 'flour';

export interface PizzaInputs extends BakeTime {
  style: PizzaStyle;
  amountMode: AmountMode;
  count: number;
  ballWeightG: number;
  diameterCm: number;
  trayWidthCm: number;
  trayLengthCm: number;
  flourG: number;
  flour: PizzaFlour;
  /** From the bag, when known: overrides the flour's typical W. */
  wValue?: number;
  leavener: DoughLeavener;
  preset: ScheduleChoice;
  /** The stages of one's own schedule; a preset's follow the room temperature. */
  stages: Stage[];
  roomC: number;
  kneading: Kneading;
  oven: PizzaOven;
  /** The hottest a home oven gets. */
  ovenMaxC: number;
}

export type PizzaWarning = 'flourTooWeakForTime' | 'tooLittleToWeigh' | 'impossibleSchedule' |
  'moreYeastThanStyleAllows' | DoughWarning;

export interface BakeAdvice {
  temperatureC: number;
  minutes: Range;
  /** Recipes near this temperature give the time; else it is a bound from cooler ('orLess') or hotter recipes. */
  fit: 'near' | 'orLess' | 'atLeast';
  /** Set when the oven is cooler than the style wants: the oven and temperature it is made for. */
  madeFor?: {oven: BakeOven, temperatureC: number};
}

export interface PizzaResult {
  amounts: DoughAmounts;
  /** Rice and soy flour of a pinsa, out of the flour. */
  blend?: {rice: number, soy: number};
  pieces: number;
  pieceWeight: number;
  waterTemperatureC: number;
  bake: BakeAdvice;
  warnings: PizzaWarning[];
  /** The water in % of the flour, when the flour takes another amount than the style's own. */
  waterForFlour?: {percent: number, stylePercent: number};
}

export const AMOUNT_MODES: readonly AmountMode[] = ['balls', 'pizzas', 'trays', 'flour'];

/**
 * How a style can be sized: round styles by balls or pizzas, pan styles by trays; every style by flour.
 *
 * @param {PizzaStyle} style the style
 * @return {AmountMode[]} the ways it can be sized
 */
export const amountModesOf = (style: PizzaStyle): AmountMode[] => {
  const data = STYLES[style];
  if (data.shape === 'pan') {
    return ['trays', 'flour'];
  }
  return data.thickness ? ['balls', 'pizzas', 'flour'] : ['balls', 'flour'];
};

/**
 * The flour a style's recipes use, whose water its hydration is.
 *
 * @param {PizzaStyle} style the style
 * @return {PizzaFlour} its flour
 */
const styleFlour = (style: PizzaStyle): PizzaFlour => STYLES[style].flour ?? 'tipo00';

/**
 * A style's dough formula: the median of what its sources say. Every flour takes its own amount of water, so another
 * flour gets the style's water in proportion to the most its recipes take. Neapolitan salt follows its water.
 *
 * @param {PizzaStyle} style the style
 * @param {PizzaFlour} flour the flour used
 * @return {object} hydration, salt, oil and sugar as fractions of the flour
 */
export const styleFormula = (style: PizzaStyle, flour: PizzaFlour = styleFlour(style)) => {
  const data = STYLES[style];
  const takes = (of: PizzaFlour) => requiredMedian(FLOURS[of].maxHydration, `the water ${of} takes`);
  const hydration = requiredMedian(data.hydration, `the hydration of ${style}`) / 100 * takes(flour) /
    takes(styleFlour(style));
  const saltPerLitre = median(data.saltPerLitreWater ?? []);
  return {
    hydration,
    salt: saltPerLitre != null ? saltPerLitre / 1000 * hydration : requiredMedian(data.salt, `the salt of ${style}`) / 100,
    oil: (median(data.oil) ?? 0) / 100,
    sugar: (median(data.sugar) ?? 0) / 100,
  };
};

/**
 * The dough for one pizza of a diameter, from how thin the style is.
 *
 * @param {PizzaStyle} style a round style that says how thin it is
 * @param {number} diameterCm the pizza's diameter
 * @return {number} grams
 */
export const doughForDiameter = (style: PizzaStyle, diameterCm: number): number =>
  requiredMedian(STYLES[style].thickness ?? [], `the thickness of ${style}`) * Math.PI * (diameterCm / 2) ** 2;

/**
 * Ball sizes to choose from: the dough for the usual small, medium and large pizza where the style says how thin it
 * is, else the lightest, the median and the heaviest ball its sources give.
 *
 * @param {PizzaStyle} style a round style
 * @return {object[]} grams per ball and, where known, the diameter in cm
 */
export const ballPresets = (style: PizzaStyle): {weightG: number, diameterCm?: number}[] => {
  const data = STYLES[style];
  if (data.thickness) {
    return PIZZA_DIAMETERS.map((diameterCm) => ({weightG: Math.round(doughForDiameter(style, diameterCm)), diameterCm}));
  }
  const weights = data.ballWeight ?? [];
  const middle = requiredMedian(weights, `the ball weight of ${style}`);
  return [...new Set([Math.min(...weights), middle, Math.max(...weights)].map(Math.round))]
      .map((weightG) => ({weightG}));
};

/**
 * The ball a style starts with: the middle of its presets.
 *
 * @param {PizzaStyle} style a round style
 * @return {number} grams
 */
export const defaultBallWeight = (style: PizzaStyle): number => {
  const presets = ballPresets(style);
  return presets[Math.floor(presets.length / 2)].weightG;
};

export const defaultPizzaInputs = (style: PizzaStyle = 'neapolitan'): PizzaInputs => ({
  style,
  amountMode: amountModesOf(style)[0],
  count: 4,
  // Pan styles are sized by trays; a round default keeps the field valid when switching back.
  ballWeightG: defaultBallWeight(STYLES[style].shape === 'round' ? style : 'neapolitan'),
  diameterCm: 30,
  trayWidthCm: 30,
  trayLengthCm: 40,
  flourG: 1000,
  flour: STYLES[style].flour ?? 'tipo00',
  leavener: 'fresh',
  preset: STYLES[style].schedules?.[0] ?? 'fridge24',
  stages: presetStages(STYLES[style].schedules?.[0] ?? 'fridge24', ROOM_C),
  roomC: ROOM_C,
  kneading: 'hand',
  oven: 'tray',
  ovenMaxC: 250,
  bakeDayOffset: 1,
  bakeTime: '19:00',
});

export const parsePizzaInputs = (raw: unknown): PizzaInputs => {
  const fields = asRawInputs(raw);
  const style = readChoice(fields, 'style', PIZZA_STYLES, 'neapolitan');
  const d = defaultPizzaInputs(style);
  const amountMode = readChoice(fields, 'amountMode', AMOUNT_MODES, d.amountMode);
  return {
    style,
    amountMode: amountModesOf(style).includes(amountMode) ? amountMode : d.amountMode,
    count: Math.round(readNumber(fields, 'count', d.count, 1, 100)),
    ballWeightG: readNumber(fields, 'ballWeightG', d.ballWeightG, 50, 3000),
    diameterCm: readNumber(fields, 'diameterCm', d.diameterCm, 10, 60),
    trayWidthCm: readNumber(fields, 'trayWidthCm', d.trayWidthCm, 10, 80),
    trayLengthCm: readNumber(fields, 'trayLengthCm', d.trayLengthCm, 10, 80),
    flourG: readNumber(fields, 'flourG', d.flourG, 50, 50000),
    flour: readChoice(fields, 'flour', PIZZA_FLOURS, d.flour),
    wValue: readOptionalNumber(fields, 'wValue', 100, 500),
    leavener: readChoice(fields, 'leavener', DOUGH_LEAVENERS, d.leavener),
    preset: readChoice(fields, 'preset', SCHEDULE_CHOICES, d.preset),
    stages: readStages(fields, d.stages),
    roomC: readNumber(fields, 'roomC', d.roomC, 10, 35),
    kneading: readChoice(fields, 'kneading', KNEADINGS, d.kneading),
    oven: readChoice(fields, 'oven', PIZZA_OVENS, d.oven),
    ovenMaxC: readNumber(fields, 'ovenMaxC', d.ovenMaxC, 150, 350),
    ...readBakeTime(fields, d),
  };
};

const maxHoursOf = (inputs: PizzaInputs): number | undefined => {
  if (inputs.wValue != null) {
    const band = W_BANDS.find((candidate) => inputs.wValue! <= candidate.upTo);
    return band && median(band.maxHours);
  }
  return median(FLOURS[inputs.flour].maxHours ?? []);
};

/**
 * The dough a pizza order needs: by balls, by pizzas of a size, by trays, or by the flour at hand.
 *
 * @param {PizzaInputs} inputs the order
 * @return {object} the dough or flour, the pieces and their weight
 */
const doughSize = (inputs: PizzaInputs): {size: {flour: number} | {dough: number}, pieces: number,
  pieceWeight?: number} => {
  const data = STYLES[inputs.style];
  switch (inputs.amountMode) {
    case 'balls':
      return {size: {dough: inputs.count * inputs.ballWeightG}, pieces: inputs.count, pieceWeight: inputs.ballWeightG};
    case 'pizzas': {
      const weight = doughForDiameter(inputs.style, inputs.diameterCm);
      return {size: {dough: inputs.count * weight}, pieces: inputs.count, pieceWeight: weight};
    }
    case 'trays': {
      const weight = requiredMedian(data.panDensity ?? [], `the dough per tray area of ${inputs.style}`) *
        inputs.trayWidthCm * inputs.trayLengthCm;
      return {size: {dough: inputs.count * weight}, pieces: inputs.count, pieceWeight: weight};
    }
    case 'flour':
      return {size: {flour: inputs.flourG}, pieces: 0};
  }
};

/** Recipes count as near an oven's temperature from 30 °C cooler to 10 °C hotter, as ovens run that far off. */
const NEAR_BELOW_C = 30;
const NEAR_ABOVE_C = 10;

/**
 * The time recipes give near an oven's temperature. Without any near it, the hottest cooler recipes give an upper
 * bound, as a hotter oven bakes no slower, and else the coolest hotter recipes a lower one.
 *
 * @param {BakeRecipe[]} recipes what recipes say
 * @param {number} ovenC the oven's temperature
 * @return {object} the minutes and how they relate to the oven
 */
const timeNear = (recipes: BakeRecipe[], ovenC: number): {minutes: Range, fit: BakeAdvice['fit']} => {
  const known = recipes.filter((recipe): recipe is Required<BakeRecipe> => recipe.temperatureC != null);
  const minutesAt = (temperatureC: number) =>
    medianRange(known.filter((recipe) => recipe.temperatureC === temperatureC).map((recipe) => recipe.minutes));
  const near = known.filter((recipe) => recipe.temperatureC >= ovenC - NEAR_BELOW_C &&
    recipe.temperatureC <= ovenC + NEAR_ABOVE_C);
  if (near.length > 0) {
    return {minutes: medianRange(near.map((recipe) => recipe.minutes)), fit: 'near'};
  }
  const cooler = known.filter((recipe) => recipe.temperatureC < ovenC).map((recipe) => recipe.temperatureC);
  if (cooler.length > 0) {
    return {minutes: minutesAt(Math.max(...cooler)), fit: 'orLess'};
  }
  return {minutes: minutesAt(Math.min(...known.map((recipe) => recipe.temperatureC))), fit: 'atLeast'};
};

/**
 * How to bake the style with the oven at hand. A pizza oven bakes round styles as their recipes do; so does a home
 * oven that gets as hot as they bake. A cooler home oven bakes at its hottest, for as long as recipes near that
 * temperature take: recipes for its tray, stone or steel for a pizza oven's style, the style's own for the others.
 * Pan pizzas bake in their pan, so for them only the heat counts.
 *
 * @param {PizzaInputs} inputs the style and the oven
 * @return {BakeAdvice} temperature and time
 */
export const bakeAdvice = (inputs: PizzaInputs): BakeAdvice => {
  const data = STYLES[inputs.style];
  const temperatures = data.bake.recipes.flatMap((recipe) => recipe.temperatureC != null ? [recipe.temperatureC] : []);
  const styleC = median(temperatures)!;
  const madeFor = {oven: data.bake.oven, temperatureC: styleC};
  if (data.bake.oven === 'pizzaOven' && inputs.oven !== 'pizzaOven') {
    const temperatureC = Math.min(inputs.ovenMaxC, styleC);
    return {temperatureC, ...timeNear(HOME_OVEN_RECIPES[inputs.oven], temperatureC), madeFor};
  }
  if (data.shape === 'round' && inputs.oven === 'pizzaOven' || styleC <= inputs.ovenMaxC) {
    return {temperatureC: styleC, minutes: medianRange(data.bake.recipes.map((recipe) => recipe.minutes)), fit: 'near'};
  }
  return {temperatureC: inputs.ovenMaxC, ...timeNear(data.bake.recipes, inputs.ovenMaxC), madeFor};
};

/**
 * The stages the dough goes through: the preset's at the room temperature, or one's own.
 *
 * @param {PizzaInputs} inputs the schedule
 * @return {Stage[]} the stages
 */
export const pizzaStages = (inputs: PizzaInputs): Stage[] =>
  scheduleStages(inputs.preset, inputs.stages, inputs.roomC);

/** What each style needs to rise, from its own recipes. */
const CALIBRATIONS = Object.fromEntries(PIZZA_STYLES.map((style) =>
  [style, pizzaCalibration(STYLES[style].yeastRecipes ?? PIZZA_YEAST_RECIPES)])) as Record<PizzaStyle, Calibration>;

/**
 * Everything to weigh for a pizza order, with the water temperature and what to watch out for.
 *
 * @param {PizzaInputs} inputs the order
 * @return {PizzaResult} the dough
 */
export const calculatePizza = (inputs: PizzaInputs): PizzaResult => {
  const formula = styleFormula(inputs.style, inputs.flour);
  const warnings: PizzaWarning[] = [];
  const stages = pizzaStages(inputs);
  const targetC = recommendedDoughC('pizza', stages);
  let leavenerPct = leavenerNeeded(CALIBRATIONS[inputs.style], inputs.leavener, stages, targetC);
  if (!Number.isFinite(leavenerPct)) {
    warnings.push('impossibleSchedule');
    leavenerPct = 0;
  }
  const {size, pieces, pieceWeight} = doughSize(inputs);
  const amounts = weighDough(formula, inputs.leavener, leavenerPct, size);
  if (isTooLittleToWeigh(amounts.leavener)) {
    warnings.push('tooLittleToWeigh');
  }
  const maxHours = maxHoursOf(inputs);
  if (maxHours != null && totalHours(stages) > maxHours) {
    warnings.push('flourTooWeakForTime');
  }
  const data = STYLES[inputs.style];
  const freshYeast = inputs.leavener === 'sourdough' ? 0 : convertYeast(leavenerPct, inputs.leavener, 'fresh');
  // The rules mature the dough at room temperature. Grams per litre of water as % of the flour: the litres per kg
  // are the hydration, the grams per kg tenfold the %.
  if (data.maxFreshYeastPerLitreWater != null && !stages.some((stage) => stage.temperatureC <= FRIDGE_MAX_C) &&
    freshYeast > data.maxFreshYeastPerLitreWater * formula.hydration / 10) {
    warnings.push('moreYeastThanStyleAllows');
  }
  const waterTemperatureC = waterTemperature({targetC, roomC: inputs.roomC, flourC: inputs.roomC,
    starterC: inputs.leavener === 'sourdough' ? inputs.roomC : undefined}, inputs.kneading);
  warnings.push(...doughWarnings(freshYeast, waterTemperatureC));
  const flourPieces = inputs.amountMode !== 'flour' ? pieces :
    data.shape === 'round' ? Math.max(1, Math.floor(amounts.total / defaultBallWeight(inputs.style))) : 0;
  const blend = data.blend && {rice: (median(data.blend.rice) ?? 0) / 100 * amounts.flour,
    soy: (median(data.blend.soy) ?? 0) / 100 * amounts.flour};
  return {
    amounts: blend ? {...amounts, flour: amounts.flour - blend.rice - blend.soy} : amounts,
    blend,
    pieces: flourPieces,
    pieceWeight: pieceWeight ?? (flourPieces > 0 ? amounts.total / flourPieces : 0),
    waterTemperatureC,
    bake: bakeAdvice(inputs),
    warnings,
    waterForFlour: waterForFlour(inputs, formula.hydration),
  };
};

const waterForFlour = (inputs: PizzaInputs, hydration: number): PizzaResult['waterForFlour'] => {
  const percent = Math.round(hydration * 100);
  const stylePercent = Math.round(styleFormula(inputs.style).hydration * 100);
  return percent !== stylePercent ? {percent, stylePercent} : undefined;
};
