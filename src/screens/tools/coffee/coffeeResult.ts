import {TFunction} from 'i18next';
import {CoffeeInputs, CoffeeResult, Grind, METHODS, Taste, TimeUnit} from '../../../tools/coffee/coffee';
import {Range} from '../../../tools/numbers';
import {ResultLine, ResultSection} from '../../../tools/result';
import {formatTemperature, formatVolume, formatWeight} from '../../../tools/units';
import {sectorKey} from './TasteChart';
import {ResultFormat} from '../resultFormat';


const SECONDS: Record<TimeUnit, number> = {seconds: 1, minutes: 60, hours: 3600};

const oneDecimal = (value: number) => Math.round(value * 10) / 10;
const capitalised = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * How the coffee tool puts its numbers into words, for its questions and its result alike.
 *
 * @param {ResultFormat} format translations and units
 * @return {object} the formatters
 */
export const coffeeWords = ({t, system, locale}: ResultFormat) => {
  const temperature = (celsius: number) => formatTemperature(celsius, system, locale);
  const clock = (minutes: number) => {
    const seconds = Math.round(minutes * 60);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  const time = (value: number, unit: TimeUnit) => unit === 'minutes' ?
    t('tools.coffee.brewTimeValue.clock', {time: clock(value)}) : t(`tools.coffee.brewTimeValue.${unit}`, {value});
  return {
    t,
    weight: (grams: number) => formatWeight(grams, system, locale),
    volume: (ml: number) => formatVolume(ml, system, locale),
    temperature,
    temperatures: (range: Range) => t('tools.range', {low: temperature(range.low), high: temperature(range.high)}),
    ratio: (water: number) => t('tools.coffee.ratioValue', {water: oneDecimal(water)}),
    ratioRange: (low: number, high: number) => t('tools.coffee.ratioRange', {low: oneDecimal(low),
      high: oneDecimal(high)}),
    clock,
    time,
    times: (range: Range, unit: TimeUnit) => range.low === range.high ? time(range.low, unit) :
      t('tools.range', {low: time(range.low, unit), high: time(range.high, unit)}),
    grindName: (grind: Grind) => t(`tools.coffee.grinds.${grind}`),
  };
};

export type CoffeeWords = ReturnType<typeof coffeeWords>;

/**
 * The seconds the timer runs to: the time brewed, to the 5 seconds; none for a brew that takes hours.
 *
 * @param {object} brewTime the result's brew time, if any
 * @return {number | undefined} seconds
 */
export const timerSeconds = (brewTime: CoffeeResult['brewTime']): number | undefined =>
  brewTime && brewTime.unit !== 'hours' ? Math.round(brewTime.brewed * SECONDS[brewTime.unit] / 5) * 5 : undefined;

/**
 * Said below the chart: how cold brew extracts where it steeps, and where the recommended settings come out stronger
 * than balanced.
 *
 * @param {TFunction} t translations
 * @param {CoffeeInputs} inputs the settings
 * @param {CoffeeResult} recommended what the recommended settings come to
 * @return {string | undefined} the note, if any
 */
export const chartNote = (t: TFunction, inputs: CoffeeInputs, recommended: CoffeeResult): string | undefined =>
  [METHODS[inputs.method].cold && t(`tools.coffee.taste.coldBrewNote.${inputs.steeping}`),
    recommended.taste?.strength === 'strong' && t('tools.coffee.taste.strongByDesign')]
      .filter(Boolean).join(' ') || undefined;

const waterLabel = (inputs: CoffeeInputs, result: CoffeeResult) => {
  if (inputs.method === 'fullyAutomatic') {
    return 'tools.coffee.cup';
  }
  return result.iceG != null ? 'tools.coffee.hotWater' : 'tools.coffee.water';
};

const brewingLines = ({t, ...words}: CoffeeWords, result: CoffeeResult): ResultLine[] => {
  const brewTime = result.brewTime;
  return [
    {label: t('tools.coffee.ratio'), value: words.ratio(result.ratio)},
    {label: t('tools.coffee.grind'), value: words.grindName(result.grind)},
    ...(result.temperatureC != null ? [{label: t('tools.coffee.waterTemperature'),
      value: words.temperature(result.temperatureC)}] : []),
    ...(brewTime ? [{label: t('tools.coffee.brewTime'), value: brewTime.chosen != null ?
      words.time(brewTime.chosen, brewTime.unit) : words.times(brewTime.recommended, brewTime.unit)}] : []),
    ...(result.dilutionMl != null ? [{label: t('tools.coffee.dilution'), value: words.volume(result.dilutionMl)}] : []),
  ];
};

const tasteLines = ({t}: CoffeeWords, inputs: CoffeeInputs, taste: Taste): ResultLine[] => {
  const info = METHODS[inputs.method].cold ? 'tools.coffee.taste.coldExtractionInfo' :
    'tools.coffee.taste.extractionInfo';
  return [
    {label: t('tools.coffee.taste.strength'), value: t(`tools.coffee.taste.strengths.${taste.strength}`)},
    {label: t('tools.coffee.taste.extraction'),
      value: t('tools.coffee.taste.extractionValue', {percent: Math.round(taste.extraction)}), info: t(info)},
    {label: t('tools.coffee.taste.profile'), value: capitalised(t(sectorKey(taste)))},
  ];
};

/**
 * The coffee tool's result: what to weigh, how to brew, where it lands in taste and the steps.
 *
 * @param {CoffeeWords} words the tool's formatters
 * @param {CoffeeInputs} inputs the settings
 * @param {CoffeeResult} result what they come to
 * @return {ResultSection[]} the sections
 */
export const coffeeSections = (words: CoffeeWords, inputs: CoffeeInputs, result: CoffeeResult): ResultSection[] => {
  const {t} = words;
  const water = result.waterMl - (result.iceG ?? 0);
  const steps = t(`tools.coffee.steps.${inputs.method}`, {returnObjects: true, coffee: words.weight(result.coffeeG),
    water: words.volume(water), grind: words.grindName(result.grind).toLowerCase(),
    temperature: result.temperatureC != null ? words.temperature(result.temperatureC) : '',
    time: result.brewTime ? words.time(result.brewTime.brewed, result.brewTime.unit) : '',
    bloom: words.weight(2 * result.coffeeG), ice: words.weight(result.iceG ?? 0),
    dilution: words.volume(result.dilutionMl ?? 0), place: t(`tools.coffee.steepIn.${inputs.steeping}`),
  }) as unknown as string[];
  return [
    {title: t('tools.coffee.toWeigh'), icon: 'scale-balance', lines: [
      {label: t('tools.coffee.coffee'), value: words.weight(result.coffeeG)},
      {label: t(waterLabel(inputs, result)), value: words.volume(water)},
      ...(result.iceG != null ? [{label: t('tools.coffee.ice'), value: words.weight(result.iceG)}] : []),
    ]},
    {title: t('tools.coffee.brewing'), icon: 'coffee-outline', lines: brewingLines(words, result)},
    ...(result.taste ? [{title: t('tools.coffee.taste.title'), icon: 'chart-scatter-plot',
      lines: tasteLines(words, inputs, result.taste)}] : []),
    {title: t('tools.coffee.stepsTitle'), icon: 'format-list-numbered', lines: [], steps},
  ];
};
