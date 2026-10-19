import React from 'react';
import {useTranslation} from 'react-i18next';
import {SegmentedButtons} from 'react-native-paper';
import {OptionList} from '../../../components/OptionList';
import {QuestionSection} from '../../../components/QuestionSection';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {calculateCoffee, COFFEE_METHODS, CoffeeMethod, METHODS, parseCoffeeInputs, Strength,
  STRENGTHS} from '../../../tools/coffee/coffee';
import {medianRange, Range} from '../../../tools/sources';
import {formatTemperature, formatVolume, formatWeight} from '../../../tools/units';
import {COFFEE_METHOD_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

export const CoffeeTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('coffee', parseCoffeeInputs);
  const result = calculateCoffee(inputs);
  const locale = i18n.language;
  const temperatures = (range: Range) => range.low === range.high ? formatTemperature(range.low, system, locale) :
    t('tools.range', {low: formatTemperature(range.low, system, locale), high: formatTemperature(range.high, system,
        locale)});
  const ratios = (range: Range) => oneDecimal(range.low) === oneDecimal(range.high) ?
    t('tools.coffee.ratioValue', {water: oneDecimal(range.low)}) :
    t('tools.coffee.ratioRange', {low: oneDecimal(range.low), high: oneDecimal(range.high)});
  // What the guides give for a method, so it can be compared before it is chosen.
  const facts = (method: CoffeeMethod) => {
    const data = METHODS[method];
    return [ratios(medianRange(data.ratios)), ...(data.waterC ? [temperatures(medianRange(data.waterC))] : [])]
        .join(' · ');
  };
  const water = result.iceG != null ? result.waterMl - result.iceG : result.waterMl;

  return (
    <ToolFrame result={
      <ToolResult title={t('tools.coffee.resultTitle', {method: t(`tools.coffee.methods.${inputs.method}`)})}
        sections={[
          {title: t('tools.coffee.toWeigh'), icon: 'scale-balance', lines: [
            {label: t('tools.coffee.coffee'), value: formatWeight(result.coffeeG, system, locale)},
            {label: t(result.iceG != null ? 'tools.coffee.hotWater' : 'tools.coffee.water'),
              value: formatVolume(water, system, locale)},
            ...(result.iceG != null ? [{label: t('tools.coffee.ice'), value: formatWeight(result.iceG, system, locale)}] :
              []),
          ]},
          {title: t('tools.coffee.brewing'), icon: 'coffee-outline', lines: [
            {label: t('tools.coffee.ratio'), value: t('tools.coffee.ratioValue', {water: oneDecimal(result.ratio)})},
            ...(result.waterC ? [{label: t('tools.coffee.waterTemperature'), value: temperatures(result.waterC)}] : []),
            ...(result.steep ? [{label: t('tools.coffee.steep'), value: t(`tools.coffee.steepValue.${result.steep.unit}`,
                {low: result.steep.low, high: result.steep.high})}] : []),
            ...(result.dilutionMl != null ? [{label: t('tools.coffee.dilution'),
              value: formatVolume(result.dilutionMl, system, locale)}] : []),
          ]},
        ]} />}>
      <UnitSwitch />
      <OptionList title={t('tools.coffee.method')} chosen={inputs.method} onChoose={(method) => change({method})}
        options={COFFEE_METHODS.map((method) => ({value: method, title: t(`tools.coffee.methods.${method}`),
          description: `${t(`tools.coffee.methodDescriptions.${method}`)} ${facts(method)}`,
          image: COFFEE_METHOD_PHOTOS[method]}))} />
      <QuestionSection title={t('tools.coffee.strength')} info={t('tools.coffee.strengthInfo')}>
        <SegmentedButtons value={inputs.strength} onValueChange={(strength) => change({strength: strength as Strength})}
          buttons={STRENGTHS.map((strength) => ({value: strength, label: t(`tools.coffee.strengths.${strength}`)}))} />
      </QuestionSection>
      <QuestionSection title={t('tools.coffee.basis')}>
        <SegmentedButtons value={inputs.basis}
          onValueChange={(basis) => change({basis: basis as 'water' | 'coffee'})}
          buttons={[{value: 'water', label: t('tools.coffee.bases.water'), icon: 'cup-water'},
            {value: 'coffee', label: t('tools.coffee.bases.coffee'), icon: 'coffee-outline'}]} />
        {inputs.basis === 'water' ?
          <MeasureSlider label={t('tools.coffee.drink')} measure="volume" value={inputs.waterMl} min={20} max={2000}
            step={{metric: 10, imperial: 1}} onChange={(waterMl) => change({waterMl})} /> :
          <MeasureSlider label={t('tools.coffee.coffeeOnHand')} measure="weight" value={inputs.coffeeG} min={2}
            max={250} step={{metric: 1, imperial: 0.1}} onChange={(coffeeG) => change({coffeeG})} />}
      </QuestionSection>
    </ToolFrame>
  );
};
