import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons, Text} from 'react-native-paper';
import {OptionList} from '../../../components/OptionList';
import {HintText, QuestionSection} from '../../../components/QuestionSection';
import {TimerControl} from '../../../components/TimerControl';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {SliderField} from '../../../components/tools/SliderField';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {toolTimerKey} from '../../../helper/cookingTimers';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {AUTOMAT, AUTOMAT_TEMPERATURES, automatCup, AutomatDrink, automatDose, AutomatLevel, automatLevels,
  calculateCoffee, COFFEE_METHODS, CoffeeMethod, GRINDS, METHODS, parseCoffeeInputs, Roast, ROASTS, roastC, Strength,
  STRENGTHS, TIME_STEPS, TimeUnit} from '../../../tools/coffee/coffee';
import {toolDefinition} from '../../../tools/registry';
import {ResultLine, ResultSection} from '../../../tools/result';
import {midpoint, Range, requiredMedian} from '../../../tools/sources';
import {formatTemperature, formatVolume, formatWeight} from '../../../tools/units';
import {COFFEE_METHOD_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';
import {TasteChart} from './TasteChart';

const SLUG = toolDefinition('coffee').slug;

// A choice with its name above it, as the sliders show theirs.
const Labelled = ({label, children}: {label: string, children: React.ReactNode}) => (
  <View style={styles.labelled}>
    <Text variant="bodyLarge">{label}</Text>
    {children}
  </View>
);

const oneDecimal = (value: number) => Math.round(value * 10) / 10;
const capitalised = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const CoffeeTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('coffee', parseCoffeeInputs);
  const result = calculateCoffee(inputs);
  const data = METHODS[inputs.method];
  const automat = inputs.method === 'fullyAutomatic';
  const locale = i18n.language;
  const weight = (grams: number) => formatWeight(grams, system, locale);
  const volume = (ml: number) => formatVolume(ml, system, locale);
  const temperature = (celsius: number) => formatTemperature(celsius, system, locale);
  const temperatures = (range: Range) => t('tools.range', {low: temperature(range.low), high: temperature(range.high)});
  const ratio = (water: number) => t('tools.coffee.ratioValue', {water: oneDecimal(water)});
  const ratioOf = (method: CoffeeMethod, strength: Strength) =>
    oneDecimal(requiredMedian(METHODS[method].strengths![strength], 'the ratio'));
  // What the guides give for a method, so it can be compared before it is chosen.
  const facts = (method: CoffeeMethod) => METHODS[method].strengths ?
    t('tools.coffee.ratioRange', {low: ratioOf(method, 'strong'), high: ratioOf(method, 'mild')}) : '';
  const clock = (minutes: number) => {
    const seconds = Math.round(minutes * 60);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  const time = (value: number, unit: TimeUnit) => unit === 'minutes' ?
    t('tools.coffee.brewTimeValue.clock', {time: clock(value)}) : t(`tools.coffee.brewTimeValue.${unit}`, {value});
  const times = (range: Range, unit: TimeUnit) => range.low === range.high ? time(range.low, unit) :
    t('tools.range', {low: time(range.low, unit), high: time(range.high, unit)});
  const grindName = (grind: typeof GRINDS[number]) => t(`tools.coffee.grinds.${grind}`);
  const water = result.iceG != null ? result.waterMl - result.iceG : result.waterMl;
  const brewTime = result.brewTime;
  // The timer runs to the time chosen, to the 5 seconds.
  const timerSeconds = brewTime?.chosen != null && brewTime.unit !== 'hours' ?
    Math.round(brewTime.chosen * (brewTime.unit === 'minutes' ? 60 : 1) / 5) * 5 : undefined;

  const chooseMethod = (method: CoffeeMethod) => {
    const reset = {method, grind: undefined, temperatureC: undefined, brewTime: undefined};
    if (method === 'fullyAutomatic') {
      change({...reset, waterMl: automatCup(inputs.automatDrink)});
      return;
    }
    // Another method keeps the coffee at hand, so 500 ml of filter coffee does not become 500 ml of espresso.
    const kept = requiredMedian(METHODS[method].strengths![inputs.strength], 'the ratio') * result.coffeeG;
    change({...reset, waterMl: Math.max(20, Math.round(kept / 10) * 10)});
  };

  const brewing: ResultLine[] = [
    {label: t('tools.coffee.ratio'), value: ratio(result.ratio)},
    {label: t('tools.coffee.grind'), value: grindName(result.grind)},
    ...(result.temperatureC != null ? [{label: t('tools.coffee.waterTemperature'),
      value: temperature(result.temperatureC)}] : []),
    ...(brewTime ? [{label: t('tools.coffee.brewTime'), value: brewTime.chosen != null ?
      time(brewTime.chosen, brewTime.unit) : times(brewTime.recommended, brewTime.unit)}] : []),
    ...(result.dilutionMl != null ? [{label: t('tools.coffee.dilution'), value: volume(result.dilutionMl)}] : []),
  ];
  const steps = t(`tools.coffee.steps.${inputs.method}`, {returnObjects: true, coffee: weight(result.coffeeG),
    water: volume(water), grind: grindName(result.grind).toLowerCase(),
    temperature: result.temperatureC != null ? temperature(result.temperatureC) : '',
    time: brewTime ? time(brewTime.chosen ?? midpoint(brewTime.recommended), brewTime.unit) : '',
    bloom: weight(2 * result.coffeeG), ice: weight(result.iceG ?? 0), dilution: volume(result.dilutionMl ?? 0),
  }) as unknown as string[];
  const sections: ResultSection[] = [
    {title: t('tools.coffee.toWeigh'), icon: 'scale-balance', lines: [
      {label: t('tools.coffee.coffee'), value: weight(result.coffeeG)},
      {label: t(automat ? 'tools.coffee.cup' : result.iceG != null ? 'tools.coffee.hotWater' : 'tools.coffee.water'),
        value: volume(water)},
      ...(result.iceG != null ? [{label: t('tools.coffee.ice'), value: weight(result.iceG)}] : []),
    ]},
    {title: t('tools.coffee.brewing'), icon: 'coffee-outline', lines: brewing},
    ...(result.taste ? [{title: t('tools.coffee.taste.title'), icon: 'chart-scatter-plot', lines: [
      {label: t('tools.coffee.taste.strength'), value: t(`tools.coffee.taste.strengths.${result.taste.strength}`)},
      {label: t('tools.coffee.taste.extraction'), value: t('tools.coffee.taste.extractionValue',
          {percent: Math.round(result.taste.extraction)}), info: t('tools.coffee.taste.extractionInfo')},
      {label: t('tools.coffee.taste.profile'),
        value: capitalised(t(`tools.coffee.taste.sectors.${result.taste.strength}.${result.taste.extracted}`))},
    ]}] : []),
    {title: t('tools.coffee.stepsTitle'), icon: 'format-list-numbered', lines: [], steps},
  ];

  return (
    <ToolFrame result={
      <ToolResult title={t('tools.coffee.resultTitle', {method: t(`tools.coffee.methods.${inputs.method}`)})}
        sections={sections}>
        {result.taste && <TasteChart taste={result.taste} ratio={result.ratio} ratioLabel={ratio} />}
        {timerSeconds != null &&
          <TimerControl timerKey={toolTimerKey(SLUG, timerSeconds)} title={t('tools.coffee.name')}
            target={{toolSlug: SLUG}} duration={{seconds: timerSeconds, label: t('tools.coffee.brewTimeValue.clock',
                {time: clock(timerSeconds / 60)})}} />}
      </ToolResult>}>
      <UnitSwitch />
      <OptionList title={t('tools.coffee.method')} chosen={inputs.method} onChoose={chooseMethod}
        options={COFFEE_METHODS.map((method) => ({value: method, title: t(`tools.coffee.methods.${method}`),
          description: `${t(`tools.coffee.methodDescriptions.${method}`)} ${facts(method)}`.trim(),
          image: COFFEE_METHOD_PHOTOS[method]}))} />

      {automat ?
        <QuestionSection title={t('tools.coffee.automat.title')} hint={t('tools.coffee.automat.hint')}>
          <Labelled label={t('tools.coffee.automat.drink')}>
            <SegmentedButtons value={inputs.automatDrink}
              onValueChange={(drink) => change({automatDrink: drink as AutomatDrink,
                waterMl: automatCup(drink as AutomatDrink)})}
              buttons={(['espresso', 'coffee'] as const).map((drink) => ({value: drink,
                label: t(`tools.coffee.automat.drinks.${drink}`)}))} />
            {inputs.automatDrink === 'espresso' && <HintText>{t('tools.coffee.automat.espressoHint')}</HintText>}
          </Labelled>
          <SliderField label={t('tools.coffee.strength')} value={inputs.automatLevel} min={1} max={automatLevels()}
            step={1} format={(level) => t('tools.coffee.automat.level', {level, levels: automatLevels(),
              dose: weight(automatDose(level))})} onChange={(automatLevel) => change({automatLevel})} />
          <MeasureSlider label={t('tools.coffee.cup')} measure="volume" value={inputs.waterMl}
            min={AUTOMAT.smallestCupMl} max={400}
            step={{metric: 5, imperial: 0.5}} onChange={(waterMl) => change({waterMl})} />
          <Labelled label={t('tools.coffee.automat.temperature')}>
            <SegmentedButtons value={inputs.automatTemperature}
              onValueChange={(level) => change({automatTemperature: level as AutomatLevel})}
              buttons={AUTOMAT_TEMPERATURES.map((level) => ({value: level,
                label: t(`tools.coffee.automat.temperatures.${level}`)}))} />
            <HintText>{t('tools.coffee.roastWater', {range: temperatures(roastC(inputs.roast))})}</HintText>
          </Labelled>
        </QuestionSection> :
        <QuestionSection title={t('tools.coffee.strength')} info={t('tools.coffee.strengthInfo')}>
          <SegmentedButtons value={inputs.strength} onValueChange={(strength) => change({strength: strength as Strength})}
            buttons={STRENGTHS.map((strength) => ({value: strength,
              label: t(`tools.coffee.strengths.${inputs.method === 'espresso' ? 'espresso' : 'brew'}.${strength}`)}))} />
        </QuestionSection>}

      <QuestionSection title={t('tools.coffee.beans')} info={t('tools.coffee.beansInfo')}>
        <SegmentedButtons value={inputs.roast}
          // A new roast brings its own water, until one is chosen again.
          onValueChange={(roast) => change({roast: roast as Roast, temperatureC: undefined})}
          buttons={ROASTS.map((roast) => ({value: roast, label: t(`tools.coffee.roasts.${roast}`)}))} />
        <SliderField label={t('tools.coffee.grind')} value={GRINDS.indexOf(result.grind)} min={0}
          max={GRINDS.length - 1} step={1} format={(index) => grindName(GRINDS[index])}
          onChange={(index) => change({grind: GRINDS[index]})} />
        <HintText>{t('tools.coffee.grindHint', {grind: grindName(result.recommendedGrind)})}</HintText>
      </QuestionSection>

      {(data.heat === 'kettle' || data.heat === 'machine') &&
        <QuestionSection title={t('tools.coffee.waterTemperatureTitle')}>
          <MeasureSlider label={t('tools.coffee.waterTemperature')} measure="temperature" value={result.temperatureC!}
            min={80} max={100} step={{metric: 1, imperial: 1}} onChange={(temperatureC) => change({temperatureC})} />
          <HintText>{t(data.heat === 'machine' ? 'tools.coffee.machineWater' : 'tools.coffee.roastWater',
              {range: temperatures(roastC(inputs.roast))})}</HintText>
        </QuestionSection>}
      {data.heat === 'fixed' && result.recommendedC &&
        <HintText>{t('tools.coffee.fixedWater', {range: temperatures(result.recommendedC)})}</HintText>}

      {brewTime?.chosen != null && data.brewTime?.limits &&
        <QuestionSection title={t('tools.coffee.brewTime')}>
          <SliderField label={t('tools.coffee.brewTime')} value={brewTime.chosen} min={data.brewTime.limits.low}
            max={data.brewTime.limits.high} step={TIME_STEPS[brewTime.unit]}
            format={(value) => time(value, brewTime.unit)} onChange={(value) => change({brewTime: value})} />
          <HintText>{t('tools.coffee.brewTimeHint', {range: times(brewTime.recommended, brewTime.unit)})}</HintText>
        </QuestionSection>}

      {!automat &&
        <QuestionSection title={t('tools.coffee.basis')}>
          <SegmentedButtons value={inputs.basis}
            onValueChange={(basis) => change({basis: basis as 'water' | 'coffee'})}
            buttons={[{value: 'water', label: t('tools.coffee.bases.water')},
              {value: 'coffee', label: t('tools.coffee.bases.coffee')}]} />
          {inputs.basis === 'water' ?
            <MeasureSlider label={t('tools.coffee.drink')} measure="volume" value={inputs.waterMl} min={20} max={2000}
              step={{metric: 10, imperial: 1}} onChange={(waterMl) => change({waterMl})} /> :
            <MeasureSlider label={t('tools.coffee.coffeeOnHand')} measure="weight" value={inputs.coffeeG} min={2}
              max={250} step={{metric: 1, imperial: 0.1}} onChange={(coffeeG) => change({coffeeG})} />}
        </QuestionSection>}
    </ToolFrame>
  );
};

const styles = StyleSheet.create({
  labelled: {gap: 6},
});
