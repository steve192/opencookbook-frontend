import {RawInputs, asRawInputs, readBoolean, readChoice, readNumber} from '../inputs';
import {median} from '../numbers';

/** How a recipe or an appliance heats. */
export type HeatMode = 'topBottom' | 'fan' | 'airFryer';

export const HEAT_MODES: readonly HeatMode[] = ['topBottom', 'fan', 'airFryer'];

export interface OvenInputs {
  from: HeatMode;
  to: HeatMode;
  /** As the recipe says, in °C. */
  temperatureC: number;
  /** As the recipe says; 0 when it gives none. */
  minutes: number;
  /** Frozen food in the air fryer keeps its temperature and cooks for a shorter time. */
  frozen: boolean;
}

export interface OvenResult {
  temperatureC: number;
  /** Settings many appliances do not reach. */
  warnings: ('airFryerTooHot' | 'ovenTooHot')[];
  /** Undefined when the recipe gave no time. */
  minutes?: number;
  /** Start checking this many minutes before the converted time; undefined when that would be half of it or more. */
  checkEarlyMinutes?: number;
}

/** Fan ovens move the heat to the food, so the common rule sets them 20 °C lower than top and bottom heat. */
const FAN_OFFSET_C = 20;
/** An air fryer is a small, strong fan oven: another 20 °C below a fan oven. */
const AIR_FRYER_OFFSET_C = 20;
/** Air fryers need about a fifth less time than an oven. */
const AIR_FRYER_TIME_FACTOR = 0.8;
/** Frozen food in the air fryer against the package's oven setting: how much cooler, in °C, and the share of time. */
const FROZEN_OFFSET_C = median([20, 20, 20, 20, 20, 10, 0, 0, 0, 25 * 5 / 9, 20, 50 * 5 / 9])!;
const FROZEN_TIME_FACTOR = median([9 / 13, 10 / 16.5, 11 / 14, 7 / 8, 12.5 / 18, 7.5 / 11, 5 / 6.25, 8 / 13.5,
  13.5 / 22.5, 11 / 17.5, 0.5, 0.6, (2 / 3 + 1 / 2) / 2])!;
/** Many air fryers go up to 200 °C; some reach 230 to 240 °C. */
const AIR_FRYER_MAX_C = 200;

/** Home ovens reach 250 °C, some up to 275 °C. */
const OVEN_MAX_C = 275;

/** Minutes early to check, as another oven may run faster. */
const CHECK_EARLY_MINUTES = 5;

/** Degrees below top and bottom heat, per mode. */
export const OFFSETS: Record<HeatMode, number> = {
  topBottom: 0,
  fan: FAN_OFFSET_C,
  airFryer: FAN_OFFSET_C + AIR_FRYER_OFFSET_C,
};

export const DEFAULT_OVEN_INPUTS: OvenInputs = {from: 'topBottom', to: 'fan', temperatureC: 180, minutes: 30,
  frozen: false};

export const parseOvenInputs = (raw: unknown): OvenInputs => {
  const fields: RawInputs = asRawInputs(raw);
  const d = DEFAULT_OVEN_INPUTS;
  return {
    from: readChoice(fields, 'from', HEAT_MODES, d.from),
    to: readChoice(fields, 'to', HEAT_MODES, d.to),
    temperatureC: readNumber(fields, 'temperatureC', d.temperatureC, 30, 300),
    minutes: readNumber(fields, 'minutes', d.minutes, 0, 600),
    frozen: readBoolean(fields, 'frozen', d.frozen),
  };
};

/**
 * Converts a recipe's temperature and time from one way of heating to another.
 *
 * @param {OvenInputs} inputs what the recipe says and what is at hand
 * @return {OvenResult} the setting to use
 */
export const convertOven = (inputs: OvenInputs): OvenResult => {
  const frozenInAirFryer = inputs.frozen && inputs.to === 'airFryer' && inputs.from !== 'airFryer';
  const temperatureC = frozenInAirFryer ? inputs.temperatureC - FROZEN_OFFSET_C :
    inputs.temperatureC + OFFSETS[inputs.from] - OFFSETS[inputs.to];
  const airFryer = inputs.to === 'airFryer';
  const minutes = inputs.minutes > 0 ? Math.round(inputs.minutes * timeFactor(inputs, frozenInAirFryer)) : undefined;
  return {
    temperatureC,
    warnings: tooHot(airFryer, temperatureC),
    minutes,
    checkEarlyMinutes: minutes != null && minutes <= 2 * CHECK_EARLY_MINUTES ? undefined : CHECK_EARLY_MINUTES,
  };
};

const tooHot = (airFryer: boolean, temperatureC: number): OvenResult['warnings'] => {
  if (airFryer) {
    return temperatureC > AIR_FRYER_MAX_C ? ['airFryerTooHot'] : [];
  }
  return temperatureC > OVEN_MAX_C ? ['ovenTooHot'] : [];
};

const timeFactor = (inputs: OvenInputs, frozenInAirFryer: boolean): number => {
  if (frozenInAirFryer) {
    return FROZEN_TIME_FACTOR;
  }
  const into = inputs.to === 'airFryer' ? AIR_FRYER_TIME_FACTOR : 1;
  const outOf = inputs.from === 'airFryer' ? AIR_FRYER_TIME_FACTOR : 1;
  return into / outOf;
};
