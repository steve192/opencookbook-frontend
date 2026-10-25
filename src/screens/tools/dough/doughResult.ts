import {TFunction} from 'i18next';
import {DoughAmounts, KNEAD_MINUTES, Kneading, timeline} from '../../../tools/dough/dough';
import {BakeTime, bakeMoment, FRIDGE_MAX_C} from '../../../tools/dough/stages';
import {Stage} from '../../../tools/fermentation/fermentation';
import {ResultLine, ResultSection} from '../../../tools/result';
import {formatTemperature, formatWeight, UnitSystem} from '../../../tools/units';

interface Format {
  t: TFunction;
  system: UnitSystem;
  locale: string;
}

const weight = ({system, locale}: Format, grams: number) => formatWeight(grams, system, locale);

const FIVE_MINUTES = 5 * 60_000;

/**
 * The ingredients of a dough as result lines; ingredients the formula has none of are left out.
 *
 * @param {Format} format translations and units
 * @param {DoughAmounts} amounts what to weigh
 * @param {string} leavenerLabel what leavens it, in words
 * @param {ResultLine[]} flourLines lines replacing the single flour line, such as a pinsa's blend
 * @param {ResultLine[]} extraLines further ingredients, before the total
 * @return {ResultLine[]} the lines
 */
export const ingredientLines = (format: Format, amounts: DoughAmounts, leavenerLabel: string,
    flourLines?: ResultLine[], extraLines: ResultLine[] = []): ResultLine[] => {
  const {t} = format;
  const line = (label: string, grams: number): ResultLine[] => grams > 0 ? [{label, value: weight(format, grams)}] : [];
  return [
    ...(flourLines ?? line(t('tools.dough.flour'), amounts.flour)),
    ...line(t('tools.dough.water'), amounts.water),
    ...line(leavenerLabel, amounts.leavener),
    ...line(t('tools.dough.salt'), amounts.salt),
    ...line(t('tools.dough.oil'), amounts.oil),
    ...line(t('tools.dough.sugar'), amounts.sugar),
    ...extraLines,
    {label: t('tools.dough.total'), value: weight(format, amounts.total)},
  ];
};

/**
 * One stage in words: its hours, and in the fridge or at its temperature.
 *
 * @param {Format} format translations and units
 * @param {Stage} stage the stage
 * @return {string} such as "21 h in the fridge"
 */
export const stageText = ({t, system, locale}: Format, stage: Stage): string => {
  const where = stage.temperatureC <= FRIDGE_MAX_C ? t('tools.dough.inTheFridge') :
    t('tools.dough.at', {temperature: formatTemperature(stage.temperatureC, system, locale)});
  return t('tools.dough.stageLine', {hours: stage.hours, where});
};

/**
 * The schedule as clock times, ending in the oven.
 *
 * @param {Format} format translations and units
 * @param {Stage[]} stages the schedule
 * @param {BakeTime} bake when it is baked
 * @param {Date} now the current moment
 * @param {Kneading} kneading by hand or in a stand mixer
 * @param {Array} preparations what starts that many hours before mixing, such as a sour or a soaker
 * @param {string} mixLabel names the mixing where it is not kneading, such as a rye dough's
 * @return {ResultSection} the timeline
 */
export const timelineSection = (format: Format, stages: Stage[], bake: BakeTime, now: Date, kneading: Kneading,
    preparations: {label: string, hoursBeforeMix: number}[] = [], mixLabel?: string): ResultSection => {
  const {t, locale} = format;
  // To the 5 minutes, rounded down: starting a little early does no harm.
  const clock = (at: Date) => new Date(Math.floor(at.getTime() / FIVE_MINUTES) * FIVE_MINUTES)
      .toLocaleString(locale, {weekday: 'short', hour: '2-digit', minute: '2-digit'});
  const steps = timeline(stages, bakeMoment(bake, now), kneading);
  const mixAt = steps[0].at.getTime();
  return {
    title: t('tools.dough.timeline'),
    icon: 'clock-outline',
    lines: [
      ...[...preparations].sort((a, b) => b.hoursBeforeMix - a.hoursBeforeMix).map((preparation) =>
        ({label: preparation.label, value: clock(new Date(mixAt - preparation.hoursBeforeMix * 3_600_000))})),
      ...steps.map((step) => {
        if (step.kind === 'mix') {
          return {label: mixLabel ?? t('tools.dough.mixKnead', {minutes: KNEAD_MINUTES[kneading]}),
            value: clock(step.at)};
        }
        if (step.kind === 'bake') {
          return {label: t('tools.dough.bake'), value: clock(step.at)};
        }
        return {label: stageText(format, step.stage!), value: clock(step.at)};
      }),
    ],
  };
};
