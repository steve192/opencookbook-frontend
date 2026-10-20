import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button, SegmentedButtons} from 'react-native-paper';
import {CountStepper} from '../../../components/CountStepper';
import {Notice} from '../../../components/Notice';
import {OptionList} from '../../../components/OptionList';
import {HintText, QuestionSection} from '../../../components/QuestionSection';
import {SwitchRow} from '../../../components/SwitchRow';
import {MeasureField} from '../../../components/tools/MeasureField';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {SliderField} from '../../../components/tools/SliderField';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {BREAD_METHODS, calculateBread, FLOUR_SHARE_STEP, FlourShare, flourWater, maxFlourShare, methodFor,
  parseBreadInputs, recommendedHydration, SOUR_HOURS, sourRiseHours, withFlourShare, withoutFlour}
  from '../../../tools/bread/bread';
import {BREAD_FLOURS, BreadFlour, RYE_FLOURS} from '../../../tools/bread/breadData';
import {KNEAD_MINUTES} from '../../../tools/dough/dough';
import {ResultSection} from '../../../tools/result';
import {formatTemperature, formatWeight} from '../../../tools/units';
import {YEAST_TYPES} from '../../../tools/yeast/yeast';
import {DoughSchedule} from '../dough/DoughSchedule';
import {DoughTemperatures} from '../dough/DoughTemperatures';
import {ingredientLines, timelineSection} from '../dough/doughResult';
import {LeavenerChoice} from '../dough/LeavenerChoice';
import {BREAD_METHOD_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';
import {AdditionsEditor} from './AdditionsEditor';

const MAX_FLOURS = 4;
// A flour added to the mix starts small, as a second flour usually is.
const NEW_FLOUR_SHARE = 20;
const percent = (value: number) => `${Math.round(value)} %`;
const toFive = (minutes: number) => Math.round(minutes / 5) * 5;

export const BreadTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('bread', parseBreadInputs);
  const result = calculateBread(inputs);
  const format = {t, system, locale: i18n.language};
  const weight = (grams: number) => formatWeight(grams, system, i18n.language);
  const temperature = (celsius: number) => formatTemperature(celsius, system, i18n.language);
  const flourName = (flour: BreadFlour) => t(`tools.dough.flours.${flour}`);
  const flourDescription = (flour: BreadFlour) => {
    const maxShare = maxFlourShare(flour);
    return [t(`tools.dough.flourDescriptions.${flour}`), t('tools.bread.flourTakes', {water: Math.round(flourWater(flour))}),
      ...(maxShare != null ? [t('tools.bread.flourMaxShare', {share: Math.round(maxShare)})] : [])].join(' ');
  };
  // A mix without rye cannot make a sour.
  const changeFlours = (flours: FlourShare[]) => change({flours, method: methodFor(inputs.method, flours)});
  const replaceFlour = (index: number, flour: BreadFlour) =>
    changeFlours(inputs.flours.map((part, at) => at === index ? {...part, flour} : part));
  const methods = BREAD_METHODS.filter((method) => methodFor(method, inputs.flours) === method);
  const usesYeast = inputs.method === 'yeast' || inputs.withYeast;
  const sourSetsSchedule = inputs.method === 'sour' && !inputs.withYeast;
  // A sour of very little rye may never raise the dough alone; the schedule is chosen then.
  const riseHours = sourSetsSchedule ? sourRiseHours(inputs) : undefined;
  const sourRises = riseHours != null && Number.isFinite(riseHours.high);
  const recommendedWater = recommendedHydration(inputs.flours);
  const doughHydration = result.doughWater / result.amounts.totalFlour * 100;
  const sourFlour = inputs.flours.filter((part) => RYE_FLOURS.includes(part.flour))
      .sort((a, b) => b.share - a.share)[0]?.flour;
  const {guide} = result;
  const breadName = t(`tools.bread.resultTitles.${inputs.method}`);

  const sections: ResultSection[] = [
    {title: t('tools.result.ingredients'), icon: 'basket-outline', lines: ingredientLines(format, result.amounts,
      inputs.method === 'yeast' ? t(`tools.dough.leaveners.${inputs.yeast}`) : t(`tools.bread.inDough.${inputs.method}`),
      result.flourSplit.filter((part) => part.grams > 0).map((part) =>
        ({label: flourName(part.flour), value: weight(part.grams)})), [
        ...(result.yeastGrams ?
          [{label: t(`tools.dough.leaveners.${inputs.yeast}`), value: weight(result.yeastGrams)}] : []),
        ...inputs.additions.filter((addition) => addition.soakAbsorption == null)
            .map((addition) => ({label: addition.name, value: weight(addition.grams)})),
      ])},
    {title: t('tools.result.preparation'), icon: 'chef-hat', lines: [
      // All the dough's water, the starter's and the additions' included, so it matches the percentage.
      {label: t('tools.bread.doughWater'), value: t('tools.bread.doughWaterValue', {
        grams: weight(result.doughWater), percent: Math.round(doughHydration), yield: Math.round(100 + doughHydration)})},
      ...(result.amounts.additionWater > 0 ?
        [{label: t('tools.bread.fromAdditions'), value: weight(result.amounts.additionWater)}] : []),
      {label: t('tools.bread.loaves', {count: result.pieces}), value: weight(result.pieceWeight)},
      {label: t('tools.dough.waterTemperature'), value: temperature(result.waterTemperatureC)},
    ]},
    ...(result.sour ? [{title: t('tools.bread.sourTitle'), icon: 'flask-outline', lines: [
      {label: t('tools.bread.sourStarter'), value: weight(result.sour.starter)},
      {label: t('tools.dough.water'), value: weight(result.sour.water)},
      {label: sourFlour ? flourName(sourFlour) : t('tools.bread.sourFlour'), value: weight(result.sour.flour)},
      {label: t('tools.bread.sourTime'), value: t('tools.bread.sourTimeValue', {hours: result.sour.hours,
        temperature: temperature(result.sour.temperatureC)})},
    ]}] : []),
    ...(result.soaker ? [{title: t('tools.bread.soakerTitle'), icon: 'water-outline', lines: [
      ...inputs.additions.filter((addition) => addition.soakAbsorption != null)
          .map((addition) => ({label: addition.name, value: weight(addition.grams)})),
      {label: t('tools.dough.water'), value: weight(result.soaker.water)},
      {label: t('tools.bread.soakerTime'), value: t('tools.bread.soakerTimeValue', {hours: result.soaker.hours})},
    ]}] : []),
    timelineSection(format, result.stages, inputs, new Date(), inputs.kneading, [
      ...(result.sour ? [{label: t('tools.bread.startSour'), hoursBeforeMix: result.sour.hours}] : []),
      ...(result.soaker ? [{label: t('tools.bread.startSoaker'), hoursBeforeMix: result.soaker.hours}] : []),
    ], guide.ryeDough ? t('tools.bread.mixOnly') : undefined),
    {title: t('tools.bread.stepsTitle'), icon: 'format-list-numbered', lines: [], steps: [
      ...(result.sour ? [t('tools.bread.steps.sour')] : []),
      ...(result.soaker ? [t('tools.bread.steps.soaker')] : []),
      guide.ryeDough ? t('tools.bread.steps.mixRye') :
        t('tools.bread.steps.knead', {minutes: KNEAD_MINUTES[inputs.kneading]}),
      guide.foldSets > 0 ? t('tools.bread.steps.fold', {count: guide.foldSets}) : t('tools.bread.steps.rise'),
      t('tools.bread.steps.shape', {hours: Math.round(guide.shapeHoursBefore * 4) / 4}),
      t('tools.bread.steps.bake', {start: temperature(guide.startC), after: toFive(guide.lowerAfterMinutes),
        lower: temperature(guide.lowerC), minutes: toFive(guide.minutes)}),
      t(guide.ryeDough ? 'tools.bread.steps.doneRye' : 'tools.bread.steps.done', {core: temperature(guide.coreC)}),
    ]},
  ];

  return (
    <ToolFrame result={<>
      {result.warnings.map((warning) => (
        <Notice key={warning} icon="alert-outline" tone="warning">{t(`tools.dough.warnings.${warning}`)}</Notice>
      ))}
      <ToolResult title={inputs.method !== 'yeast' && inputs.withYeast ?
        t('tools.bread.resultWithYeast', {bread: breadName}) : breadName} sections={sections} />
    </>}>
      <UnitSwitch />
      {inputs.flours.map((part, index) => (
        <OptionList key={index} chosen={part.flour} onChoose={(flour) => replaceFlour(index, flour)}
          title={inputs.flours.length > 1 ? t('tools.bread.flourN', {n: index + 1}) : t('tools.dough.flourType')}
          hint={inputs.flours.length > 1 && index === 0 ? t('tools.bread.flourMixHint') : undefined}
          options={BREAD_FLOURS.map((flour) => ({value: flour, title: flourName(flour),
            description: flourDescription(flour)}))}>
          {inputs.flours.length > 1 && <>
            <SliderField label={t('tools.bread.share')} value={part.share} min={FLOUR_SHARE_STEP}
              max={100 - FLOUR_SHARE_STEP * (inputs.flours.length - 1)} step={FLOUR_SHARE_STEP}
              format={percent} onChange={(share) => change({flours: withFlourShare(inputs.flours, index, share)})} />
            <Button icon="delete-outline" style={styles.remove}
              onPress={() => changeFlours(withoutFlour(inputs.flours, index))}>
              {t('tools.bread.removeFlour')}
            </Button>
          </>}
        </OptionList>
      ))}
      {inputs.flours.length < MAX_FLOURS &&
        <Button icon="plus" style={styles.add} onPress={() => change({flours: withFlourShare([...inputs.flours,
          {flour: 'type1050', share: 0}], inputs.flours.length, NEW_FLOUR_SHARE)})}>{t('tools.bread.addFlour')}</Button>}

      <OptionList title={t('tools.bread.method')} chosen={inputs.method} onChoose={(method) => change({method})}
        hint={methods.includes('sour') ? undefined : t('tools.bread.sourNeedsRye')}
        options={methods.map((method) => ({value: method, title: t(`tools.bread.methods.${method}`),
          description: t(`tools.bread.methodDescriptions.${method}`), image: BREAD_METHOD_PHOTOS[method]}))}>
        {inputs.method !== 'yeast' &&
          <SwitchRow label={t('tools.bread.withYeast')} explanation={t('tools.bread.withYeastHint')}
            value={inputs.withYeast} onChange={(withYeast) => change({withYeast})} />}
        {inputs.method === 'sour' &&
          <SliderField label={t('tools.bread.sourHours')} hint={t('tools.bread.sourHoursHint')}
            value={inputs.sourHours} min={SOUR_HOURS.low} max={SOUR_HOURS.high} step={0.5}
            format={(hours) => t('tools.bread.hoursValue', {hours})} onChange={(sourHours) => change({sourHours})} />}
        {inputs.method === 'starter' && inputs.withYeast &&
          <SliderField label={t('tools.bread.starterPercent')} info={t('tools.bread.starterPercentHint')}
            value={inputs.starterPercent} min={1} max={50} step={1} format={percent}
            onChange={(starterPercent) => change({starterPercent})} />}
      </OptionList>
      {usesYeast &&
        <LeavenerChoice title={t('tools.dough.yeast')} chosen={inputs.yeast} leaveners={YEAST_TYPES}
          onChoose={(yeast) => change({yeast})} />}

      <QuestionSection title={t('tools.bread.hydration')} info={t('tools.bread.hydrationInfo')}>
        <SwitchRow label={t('tools.bread.ownHydration')} value={inputs.hydration != null}
          onChange={(own) => change({hydration: own ? Math.round(recommendedWater) : undefined})} />
        {inputs.hydration != null ?
          <SliderField label={t('tools.bread.hydration')} value={inputs.hydration} min={40} max={120} step={1}
            format={(hydration) => t('tools.bread.hydrationValue', {percent: hydration, yield: 100 + hydration})}
            onChange={(hydration) => change({hydration})} /> :
          <HintText>{t('tools.bread.recommendedHydration', {percent: Math.round(recommendedWater),
            yield: Math.round(100 + recommendedWater)})}</HintText>}
      </QuestionSection>

      <QuestionSection title={t('tools.bread.amount')}>
        <SegmentedButtons value={inputs.amountMode}
          onValueChange={(amountMode) => change({amountMode: amountMode as 'loaves' | 'flour'})}
          buttons={(['loaves', 'flour'] as const).map((mode) => ({value: mode,
            label: t(`tools.bread.amountModes.${mode}`)}))} />
        {inputs.amountMode === 'loaves' ? <>
          <CountStepper label={t('tools.bread.loafCount')} value={String(inputs.count)}
            decreaseLabel={t('tools.fewer')} increaseLabel={t('tools.more')} canDecrease={inputs.count > 1}
            canIncrease={inputs.count < 50} onDecrease={() => change({count: inputs.count - 1})}
            onIncrease={() => change({count: inputs.count + 1})} />
          <MeasureSlider label={t('tools.bread.loafWeight')} measure="weight" value={inputs.loafWeightG} min={250}
            max={2500} step={{metric: 50, imperial: 1}} onChange={(loafWeightG) => change({loafWeightG})} />
        </> : <MeasureField label={t('tools.dough.flourOnHand')} measure="weight" value={inputs.flourG} min={50}
          max={50000} onChange={(flourG) => change({flourG})} />}
      </QuestionSection>

      <AdditionsEditor additions={inputs.additions} onChange={(additions) => change({additions})} />

      {sourRises &&
        <QuestionSection title={t('tools.bread.sourRise')}>
          <SliderField label={t('tools.bread.sourRiseLabel', {temperature: temperature(inputs.roomC)})}
            value={result.stages[0].hours} min={riseHours.low} max={riseHours.high} step={0.25}
            format={(hours) => t('tools.bread.hoursValue', {hours})}
            onChange={(sourRiseHours) => change({sourRiseHours})} />
          <HintText>{t('tools.bread.sourRiseHint', {low: riseHours.low, high: riseHours.high})}</HintText>
        </QuestionSection>}
      <DoughSchedule preset={inputs.preset} stages={result.stages} roomC={inputs.roomC} showStages={!sourRises}
        bakeDayOffset={inputs.bakeDayOffset} bakeTime={inputs.bakeTime} onChange={change} />
      <DoughTemperatures roomC={inputs.roomC} kneading={inputs.kneading} onChange={change} />
    </ToolFrame>
  );
};

const styles = StyleSheet.create({
  add: {alignSelf: 'flex-start'},
  remove: {alignSelf: 'flex-start'},
});
