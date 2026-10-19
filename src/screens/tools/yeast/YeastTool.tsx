import React from 'react';
import {useTranslation} from 'react-i18next';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {SliderField} from '../../../components/tools/SliderField';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {ResultLine} from '../../../tools/result';
import {formatWeight} from '../../../tools/units';
import {inPacks, parseYeastInputs, starterNeeded, unitsOf, YEAST_TARGETS, YEAST_TYPES, yeastNeeded}
  from '../../../tools/yeast/yeast';
import {LeavenerChoice} from '../dough/LeavenerChoice';
import {useToolInputs} from '../useToolInputs';

// The flour sliders reach a large home batch; bigger ones scale the same way.
const FLOUR_MAX_G = 3000;
const FLOUR_STEP = {metric: 50, imperial: 2};

export const YeastTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('yeastConverter', parseYeastInputs);
  const weight = (grams: number) => formatWeight(grams, system, i18n.language);
  const count = (value: number) => new Intl.NumberFormat(i18n.language, {maximumFractionDigits: 2}).format(value);

  const lines = (): ResultLine[] => {
    if (inputs.to === 'sourdough') {
      const starter = starterNeeded(inputs);
      return [
        {label: t('tools.dough.leaveners.sourdough'), value: weight(starter.grams)},
        {label: t('tools.yeastConverter.flourAndWaterOff'), value: weight(starter.grams / 2)},
        {label: t('tools.yeastConverter.readyIn'), value: Number.isFinite(starter.hours) ?
          t('tools.yeastConverter.hours', {count: Math.round(starter.hours)}) : t('tools.yeastConverter.tooCold')},
      ];
    }
    const grams = yeastNeeded({...inputs, to: inputs.to});
    return [
      {label: t(`tools.dough.leaveners.${inputs.to}`), value: weight(grams)},
      ...inPacks(grams, inputs.to).map((pack) =>
        ({label: t(`tools.yeastConverter.units.${pack.unit}`), value: count(pack.count)})),
    ];
  };

  return (
    <ToolFrame result={
      <ToolResult title={t('tools.yeastConverter.resultTitle')}
        sections={[{title: t('tools.yeastConverter.youNeed'), icon: 'scale-balance', lines: lines()}]} />}>
      <UnitSwitch />
      <LeavenerChoice title={t('tools.yeastConverter.recipeSays')} chosen={inputs.from} leaveners={YEAST_TYPES}
        onChoose={(from) => change({from, unit: unitsOf(from).includes(inputs.unit) ? inputs.unit : 'grams'})} />
      <ChoiceChips values={unitsOf(inputs.from)} label={(unit) => t(`tools.yeastConverter.units.${unit}`)}
        isChosen={(unit) => unit === inputs.unit} onToggle={(unit) => change({unit})} />
      {inputs.unit === 'grams' ?
        <MeasureSlider label={t('tools.yeastConverter.amount')} measure="weight" value={inputs.amount} min={0.5}
          max={50} step={{metric: 0.5, imperial: 0.02}} onChange={(amount) => change({amount})} /> :
        <SliderField label={t('tools.yeastConverter.amount')} value={inputs.amount} min={0.25} max={4} step={0.25}
          format={count} onChange={(amount) => change({amount})} />}
      <MeasureSlider label={t('tools.yeastConverter.recipeFlour')} hint={t('tools.yeastConverter.recipeFlourHint')}
        measure="weight" value={inputs.recipeFlourG} min={0} max={FLOUR_MAX_G} step={FLOUR_STEP}
        onChange={(recipeFlourG) => change({recipeFlourG})} />

      <LeavenerChoice title={t('tools.yeastConverter.iHave')} chosen={inputs.to} leaveners={YEAST_TARGETS}
        onChoose={(to) => change({to})} />
      <MeasureSlider label={t('tools.dough.flourOnHand')} measure="weight" value={inputs.myFlourG} min={FLOUR_STEP.metric}
        max={FLOUR_MAX_G} step={FLOUR_STEP} onChange={(myFlourG) => change({myFlourG})} />
      {inputs.to === 'sourdough' &&
        <MeasureSlider label={t('tools.yeastConverter.doughTemperature')} info={t('tools.yeastConverter.sourdoughHint')}
          measure="temperature" value={inputs.temperatureC} min={10} max={35} step={{metric: 1, imperial: 1}}
          onChange={(temperatureC) => change({temperatureC})} />}
    </ToolFrame>
  );
};
