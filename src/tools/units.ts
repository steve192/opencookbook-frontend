/** Metric or imperial units, as the user chose or the device suggests. */
export type UnitSystem = 'metric' | 'imperial';

const GRAMS_PER_OUNCE = 28.349523125;
const OUNCES_PER_POUND = 16;
const MILLILITRES_PER_FLUID_OUNCE = 29.5735295625;
const CENTIMETRES_PER_INCH = 2.54;

export const celsiusToFahrenheit = (celsius: number): number => celsius * 9 / 5 + 32;

export const fahrenheitToCelsius = (fahrenheit: number): number => (fahrenheit - 32) * 5 / 9;

export const inchesToCentimetres = (inches: number): number => inches * CENTIMETRES_PER_INCH;

export const centimetresToInches = (centimetres: number): number => centimetres / CENTIMETRES_PER_INCH;

export const ouncesToGrams = (ounces: number): number => ounces * GRAMS_PER_OUNCE;

export const gramsToOunces = (grams: number): number => grams / GRAMS_PER_OUNCE;

export const fluidOuncesToMillilitres = (fluidOunces: number): number => fluidOunces * MILLILITRES_PER_FLUID_OUNCE;

export const millilitresToFluidOunces = (millilitres: number): number => millilitres / MILLILITRES_PER_FLUID_OUNCE;

/**
 * Rounds to a number of significant digits, so 0.237 g of yeast and 1234 g of flour both read sensibly.
 *
 * @param {number} value the value
 * @param {number} digits significant digits to keep
 * @return {number} the rounded value
 */
export const roundSignificant = (value: number, digits: number): number => {
  if (value === 0 || !Number.isFinite(value)) {
    return value;
  }
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = 10 ** (digits - 1 - magnitude);
  return Math.round(value * factor) / factor;
};

// A no-break space keeps a number and its unit on one line.
const withUnit = (value: number, locale: string, maximumFractionDigits: number, unit: string) =>
  `${new Intl.NumberFormat(locale, {maximumFractionDigits}).format(value)}\u00a0${unit.replace(' ', '\u00a0')}`;

/**
 * A weight for display. Small amounts keep decimals, because a gram of yeast matters. Imperial
 * amounts below an ounce add the grams, as kitchen scales also show grams.
 *
 * @param {number} grams the weight
 * @param {UnitSystem} system the units to show
 * @param {string} locale the locale to format in
 * @return {string} e.g. "612 g", "1.2 kg", "0.03 g", "21.6 oz", "0.04 oz (1.2 g)"
 */
export const formatWeight = (grams: number, system: UnitSystem, locale: string): string => {
  if (system === 'metric') {
    if (grams >= 1000) {
      return withUnit(grams / 1000, locale, 2, 'kg');
    }
    return withUnit(roundSignificant(grams, grams < 10 ? 2 : 3), locale, grams < 1 ? 2 : 1, 'g');
  }
  const ounces = gramsToOunces(grams);
  if (ounces >= OUNCES_PER_POUND) {
    return withUnit(ounces / OUNCES_PER_POUND, locale, 2, 'lb');
  }
  if (ounces >= 1) {
    return withUnit(ounces, locale, 1, 'oz');
  }
  return `${withUnit(roundSignificant(ounces, 2), locale, 3, 'oz')} (${formatWeight(grams, 'metric', locale)})`;
};

/**
 * A volume for display.
 *
 * @param {number} millilitres the volume
 * @param {UnitSystem} system the units to show
 * @param {string} locale the locale to format in
 * @return {string} e.g. "250 ml", "1.5 l", "8.5 fl oz"
 */
export const formatVolume = (millilitres: number, system: UnitSystem, locale: string): string => {
  if (system === 'imperial') {
    return withUnit(roundSignificant(millilitresToFluidOunces(millilitres), 3), locale, 1, 'fl oz');
  }
  if (millilitres >= 1000) {
    return withUnit(millilitres / 1000, locale, 2, 'l');
  }
  return withUnit(roundSignificant(millilitres, 3), locale, 0, 'ml');
};

/**
 * A temperature for display, rounded to whole degrees.
 *
 * @param {number} celsius the temperature
 * @param {UnitSystem} system the units to show
 * @param {string} locale the locale to format in
 * @return {string} e.g. "180 °C", "356 °F"
 */
export const formatTemperature = (celsius: number, system: UnitSystem, locale: string): string =>
  system === 'imperial' ?
    withUnit(Math.round(celsiusToFahrenheit(celsius)), locale, 0, '°F') :
    withUnit(Math.round(celsius), locale, 0, '°C');

/**
 * A length for display.
 *
 * @param {number} centimetres the length
 * @param {UnitSystem} system the units to show
 * @param {string} locale the locale to format in
 * @return {string} e.g. "30 cm", "12 in"
 */
export const formatLength = (centimetres: number, system: UnitSystem, locale: string): string =>
  system === 'imperial' ?
    withUnit(centimetresToInches(centimetres), locale, 1, 'in') :
    withUnit(centimetres, locale, 1, 'cm');

/**
 * The units to start with until the user picks: imperial only where the device measures in US units,
 * since British recipes weigh in grams.
 *
 * @param {string | null} measurementSystem the device's measurement system
 * @return {UnitSystem} the units to show
 */
export const defaultUnitSystem = (measurementSystem: string | null): UnitSystem =>
  measurementSystem === 'us' ? 'imperial' : 'metric';

/** What a field measures; its value is always kept in metric units (°C, g, cm, ml). */
export type Measure = 'temperature' | 'weight' | 'length' | 'volume';

const IMPERIAL: Record<Measure, {label: string, fromMetric: (value: number) => number,
  toMetric: (value: number) => number}> = {
    temperature: {label: '°F', fromMetric: celsiusToFahrenheit, toMetric: fahrenheitToCelsius},
    weight: {label: 'oz', fromMetric: gramsToOunces, toMetric: ouncesToGrams},
    length: {label: 'in', fromMetric: centimetresToInches, toMetric: inchesToCentimetres},
    volume: {label: 'fl oz', fromMetric: millilitresToFluidOunces, toMetric: fluidOuncesToMillilitres},
  };

const METRIC_LABELS: Record<Measure, string> = {temperature: '°C', weight: 'g', length: 'cm', volume: 'ml'};

export const unitLabel = (measure: Measure, system: UnitSystem): string =>
  system === 'imperial' ? IMPERIAL[measure].label : METRIC_LABELS[measure];

/**
 * A metric value as a field shows it.
 *
 * @param {Measure} measure what it measures
 * @param {number} metric the value in °C, g, cm or ml
 * @param {UnitSystem} system the units shown
 * @return {number} the value in the units shown
 */
export const toDisplayed = (measure: Measure, metric: number, system: UnitSystem): number =>
  system === 'imperial' ? IMPERIAL[measure].fromMetric(metric) : metric;

/**
 * A value as typed, back in metric units.
 *
 * @param {Measure} measure what it measures
 * @param {number} displayed the value in the units shown
 * @param {UnitSystem} system the units shown
 * @return {number} the value in °C, g, cm or ml
 */
export const fromDisplayed = (measure: Measure, displayed: number, system: UnitSystem): number =>
  system === 'imperial' ? IMPERIAL[measure].toMetric(displayed) : displayed;

const FORMATTERS: Record<Measure, (metric: number, system: UnitSystem, locale: string) => string> = {
  temperature: formatTemperature,
  weight: formatWeight,
  length: formatLength,
  volume: formatVolume,
};

/**
 * A metric value for display in the units shown.
 *
 * @param {Measure} measure what it measures
 * @param {number} metric the value in °C, g, cm or ml
 * @param {UnitSystem} system the units to show
 * @param {string} locale the locale to format in
 * @return {string} e.g. "24 °C", "8.5 oz"
 */
export const formatMeasure = (measure: Measure, metric: number, system: UnitSystem, locale: string): string =>
  FORMATTERS[measure](metric, system, locale);
