import {BreadInputs, BreadResult} from '../../../tools/bread/bread';
import {BreadFlour, RYE_FLOURS} from '../../../tools/bread/breadData';
import {KNEAD_MINUTES} from '../../../tools/dough/dough';
import {ResultLine, ResultSection} from '../../../tools/result';
import {formatTemperature, formatWeight} from '../../../tools/units';
import {ingredientLines, timelineSection} from '../dough/doughResult';
import {ResultFormat} from '../resultFormat';

const toFive = (minutes: number) => Math.round(minutes / 5) * 5;

/**
 * The steps from the sour and soaker to the loaf done.
 *
 * @param {ResultFormat} format translations and units
 * @param {BreadInputs} inputs the bread
 * @param {BreadResult} result what it comes to
 * @return {string[]} the steps
 */
const breadSteps = ({t, system, locale}: ResultFormat, inputs: BreadInputs, result: BreadResult): string[] => {
  const temperature = (celsius: number) => formatTemperature(celsius, system, locale);
  const guide = result.guide;
  return [
    ...(result.sour ? [t('tools.bread.steps.sour')] : []),
    ...(result.soaker ? [t('tools.bread.steps.soaker')] : []),
    guide.ryeDough ? t('tools.bread.steps.mixRye') :
      t('tools.bread.steps.knead', {minutes: KNEAD_MINUTES[inputs.kneading]}),
    guide.foldSets > 0 ? t('tools.bread.steps.fold', {count: guide.foldSets}) : t('tools.bread.steps.rise'),
    t('tools.bread.steps.shape', {hours: Math.round(guide.shapeHoursBefore * 4) / 4, count: result.pieces}),
    t('tools.bread.steps.bake', {start: temperature(guide.startC), after: toFive(guide.lowerAfterMinutes),
      lower: temperature(guide.lowerC), minutes: toFive(guide.minutes)}),
    t(guide.ryeDough ? 'tools.bread.steps.doneRye' : 'tools.bread.steps.done', {core: temperature(guide.coreC)}),
  ];
};

/**
 * The sour to make ahead, named by the rye it is made of where the mix has one.
 *
 * @param {ResultFormat} format translations and units
 * @param {BreadInputs} inputs the bread
 * @param {object} sour the sour
 * @return {ResultLine[]} its lines
 */
const sourLines = ({t, system, locale}: ResultFormat, inputs: BreadInputs,
    sour: NonNullable<BreadResult['sour']>): ResultLine[] => {
  const weight = (grams: number) => formatWeight(grams, system, locale);
  const rye = inputs.flours.filter((part) => RYE_FLOURS.includes(part.flour)).sort((a, b) => b.share - a.share)[0];
  return [
    {label: t('tools.bread.sourStarter'), value: weight(sour.starter)},
    {label: t('tools.dough.water'), value: weight(sour.water)},
    {label: rye ? t(`tools.dough.flours.${rye.flour}`) : t('tools.bread.sourFlour'), value: weight(sour.flour)},
    {label: t('tools.bread.sourTime'), value: t('tools.bread.sourTimeValue', {hours: sour.hours,
      temperature: formatTemperature(sour.temperatureC, system, locale)})},
  ];
};

/**
 * The bread tool's result: the ingredients, the preparation, the sour and soaker, the timeline and the steps.
 *
 * @param {ResultFormat} format translations and units
 * @param {BreadInputs} inputs the bread
 * @param {BreadResult} result what it comes to
 * @return {ResultSection[]} the sections
 */
export const breadSections = (format: ResultFormat, inputs: BreadInputs, result: BreadResult): ResultSection[] => {
  const {t, system, locale} = format;
  const weight = (grams: number) => formatWeight(grams, system, locale);
  const flourName = (flour: BreadFlour) => t(`tools.dough.flours.${flour}`);
  const doughHydration = result.doughWater / result.amounts.totalFlour * 100;
  const leavenerLabel = inputs.method === 'yeast' ? t(`tools.dough.leaveners.${inputs.yeast}`) :
    t(`tools.bread.inDough.${inputs.method}`);
  const byAbsorption = (soaked: boolean) => inputs.additions.filter((addition) => (addition.soakAbsorption != null) === soaked)
      .map((addition) => ({label: addition.name, value: weight(addition.grams)}));
  const flourLines = result.flourSplit.filter((part) => part.grams > 0)
      .map((part) => ({label: flourName(part.flour), value: weight(part.grams)}));
  const extraLines = [
    ...(result.yeastGrams ? [{label: t(`tools.dough.leaveners.${inputs.yeast}`), value: weight(result.yeastGrams)}] : []),
    ...byAbsorption(false),
  ];
  return [
    {title: t('tools.result.ingredients'), icon: 'basket-outline',
      lines: ingredientLines(format, result.amounts, leavenerLabel, flourLines, extraLines)},
    {title: t('tools.result.preparation'), icon: 'chef-hat', lines: [
      // All the dough's water, the starter's and the additions' included, so it matches the percentage.
      {label: t('tools.bread.doughWater'), value: t('tools.bread.doughWaterValue', {
        grams: weight(result.doughWater), percent: Math.round(doughHydration), yield: Math.round(100 + doughHydration)})},
      ...(result.amounts.additionWater > 0 ?
        [{label: t('tools.bread.fromAdditions'), value: weight(result.amounts.additionWater)}] : []),
      {label: t('tools.bread.loaves', {count: result.pieces}), value: weight(result.pieceWeight)},
      {label: t('tools.dough.waterTemperature'), value: formatTemperature(result.waterTemperatureC, system, locale)},
    ]},
    ...(result.sour ? [{title: t('tools.bread.sourTitle'), icon: 'flask-outline',
      lines: sourLines(format, inputs, result.sour)}] : []),
    ...(result.soaker ? [{title: t('tools.bread.soakerTitle'), icon: 'water-outline', lines: [
      ...byAbsorption(true),
      {label: t('tools.dough.water'), value: weight(result.soaker.water)},
      {label: t('tools.bread.soakerTime'), value: t('tools.bread.soakerTimeValue', {hours: result.soaker.hours})},
    ]}] : []),
    timelineSection(format, result.stages, inputs, new Date(), inputs.kneading, [
      ...(result.sour ? [{label: t('tools.bread.startSour'), hoursBeforeMix: result.sour.hours}] : []),
      ...(result.soaker ? [{label: t('tools.bread.startSoaker'), hoursBeforeMix: result.soaker.hours}] : []),
    ], result.guide.ryeDough ? t('tools.bread.mixOnly') : undefined),
    {title: t('tools.bread.stepsTitle'), icon: 'format-list-numbered', lines: [], steps: breadSteps(format, inputs, result)},
  ];
};
