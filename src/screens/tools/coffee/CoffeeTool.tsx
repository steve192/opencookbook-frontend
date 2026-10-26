import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons, Text} from 'react-native-paper';
import {OptionList} from '../../../components/OptionList';
import {HintText, QuestionSection} from '../../../components/QuestionSection';
import {TimerControl} from '../../../components/TimerControl';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {RecommendedButton} from '../../../components/tools/RecommendedButton';
import {SliderField} from '../../../components/tools/SliderField';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {toolTimerKey} from '../../../helper/cookingTimers';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {AUTOMAT, AUTOMAT_TEMPERATURES, automatCup, AutomatDrink, automatDose, AutomatLevel, automatLevels,
  calculateCoffee, carriedRatio, chosenRatio, COFFEE_METHODS, CoffeeInputs, CoffeeMethod, CoffeeResult, GRINDS,
  METHODS, parseCoffeeInputs, recommendedCoffeeInputs, Roast, ROASTS, roastC, Steeping, STEEPINGS, strengthRatios,
  TIME_STEPS} from '../../../tools/coffee/coffee';
import {toolDefinition} from '../../../tools/registry';
import {COFFEE_METHOD_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';
import {chartNote, coffeeSections, CoffeeWords, coffeeWords, timerSeconds} from './coffeeResult';
import {TasteChart} from './TasteChart';

const SLUG = toolDefinition('coffee').slug;

// A choice with its name above it, as the sliders show theirs.
const Labelled = ({label, children}: {label: string, children: React.ReactNode}) => (
  <View style={styles.labelled}>
    <Text variant="bodyLarge">{label}</Text>
    {children}
  </View>
);

interface QuestionProps {
  inputs: CoffeeInputs;
  result: CoffeeResult;
  change: (changes: Partial<CoffeeInputs>) => void;
  words: CoffeeWords;
}

const AutomatQuestions = ({inputs, change, words: {t, ...words}}: QuestionProps) => (
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
        dose: words.weight(automatDose(level))})} onChange={(automatLevel) => change({automatLevel})} />
    <MeasureSlider label={t('tools.coffee.cup')} hint={t('tools.coffee.automat.cupHint')} measure="volume"
      value={inputs.waterMl} min={AUTOMAT.smallestCupMl} max={400} step={{metric: 5, imperial: 0.5}}
      onChange={(waterMl) => change({waterMl})} />
    <Labelled label={t('tools.coffee.automat.temperature')}>
      <SegmentedButtons value={inputs.automatTemperature}
        onValueChange={(level) => change({automatTemperature: level as AutomatLevel})}
        buttons={AUTOMAT_TEMPERATURES.map((level) => ({value: level,
          label: t(`tools.coffee.automat.temperatures.${level}`)}))} />
      <HintText>{t('tools.coffee.roastWater', {range: words.temperatures(roastC(inputs.roast))})}</HintText>
    </Labelled>
  </QuestionSection>
);

const StrengthQuestion = ({inputs, change, words: {t, ...words}}: QuestionProps) => {
  const scale = strengthRatios(inputs.method);
  // A ratio named as the flavour profile judges it with everything else as set, so slider and chart say the same.
  const strengthName = (water: number) => {
    const verdict = calculateCoffee({...inputs, ratio: water}).taste?.strength;
    return verdict ? t(`tools.coffee.taste.strengths.${verdict}`) : '';
  };
  return (
    <QuestionSection title={t('tools.coffee.strength')} info={t('tools.coffee.strengthInfo')}>
      {/* Mildest to strongest, as the machine's levels run. */}
      <SliderField label={t('tools.coffee.ratio')} value={scale.indexOf(chosenRatio(inputs.method, inputs.ratio))}
        min={0} max={scale.length - 1} step={1}
        format={(index) => t('tools.coffee.strengthValue', {ratio: words.ratio(scale[index]),
          name: strengthName(scale[index])})}
        onChange={(index) => change({ratio: scale[index]})} />
    </QuestionSection>
  );
};

const WaterQuestion = ({inputs, result, change, words: {t, ...words}}: QuestionProps) => {
  const heat = METHODS[inputs.method].heat;
  if (heat === 'fixed' && result.recommendedC) {
    return <HintText>{t('tools.coffee.fixedWater', {range: words.temperatures(result.recommendedC)})}</HintText>;
  }
  if (heat !== 'kettle' && heat !== 'machine') {
    return null;
  }
  return (
    <QuestionSection title={t('tools.coffee.waterTemperatureTitle')}>
      <MeasureSlider label={t('tools.coffee.waterTemperature')} measure="temperature" value={result.temperatureC!}
        min={80} max={100} step={{metric: 1, imperial: 1}} onChange={(temperatureC) => change({temperatureC})} />
      <HintText>{t(heat === 'machine' ? 'tools.coffee.machineWater' : 'tools.coffee.roastWater',
          {range: words.temperatures(roastC(inputs.roast))})}</HintText>
    </QuestionSection>
  );
};

const BrewTimeQuestion = ({inputs, result, change, words: {t, ...words}}: QuestionProps) => {
  const data = METHODS[inputs.method];
  const brewTime = result.brewTime;
  const limits = data.brewTime?.limits;
  if (brewTime?.chosen == null || !limits) {
    return null;
  }
  return (
    <QuestionSection title={t('tools.coffee.brewTime')}>
      {data.cold &&
        <Labelled label={t('tools.coffee.steeping')}>
          {/* Each place has its own time, so a new place starts from it. */}
          <SegmentedButtons value={inputs.steeping}
            onValueChange={(steeping) => change({steeping: steeping as Steeping, brewTime: undefined})}
            buttons={STEEPINGS.map((steeping) => ({value: steeping, label: t(`tools.coffee.steepings.${steeping}`)}))} />
        </Labelled>}
      <SliderField label={t('tools.coffee.brewTime')} value={brewTime.chosen} min={limits.low} max={limits.high}
        step={TIME_STEPS[brewTime.unit]} format={(value) => words.time(value, brewTime.unit)}
        onChange={(value) => change({brewTime: value})} />
      <HintText>{t('tools.coffee.brewTimeHint', {range: words.times(brewTime.recommended, brewTime.unit)})}</HintText>
    </QuestionSection>
  );
};

const AmountQuestion = ({inputs, change, words: {t}}: QuestionProps) => (
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
  </QuestionSection>
);

export const CoffeeTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('coffee', parseCoffeeInputs);
  const result = calculateCoffee(inputs);
  const automat = inputs.method === 'fullyAutomatic';
  const words = coffeeWords({t, system, locale: i18n.language});
  const recommended = recommendedCoffeeInputs(inputs);
  const recommendedResult = calculateCoffee(recommended);
  const timer = timerSeconds(result.brewTime);
  // A method's ratio range, so it can be compared before it is chosen.
  const facts = (method: CoffeeMethod) => {
    if (!METHODS[method].strengths) {
      return '';
    }
    const ratios = strengthRatios(method);
    return words.ratioRange(ratios.at(-1)!, ratios[0]);
  };

  const chooseMethod = (method: CoffeeMethod) => {
    const reset = {method, grind: undefined, temperatureC: undefined, brewTime: undefined};
    if (method === 'fullyAutomatic') {
      change({...reset, waterMl: automatCup(inputs.automatDrink)});
      return;
    }
    // Another method keeps the coffee at hand, so 500 ml of filter coffee does not become 500 ml of espresso, and the
    // strength's place on the scale, so a strong pour-over becomes a strong espresso.
    const ratio = carriedRatio(inputs.method, method, inputs.ratio);
    const kept = chosenRatio(method, ratio) * result.coffeeG;
    change({...reset, ratio, waterMl: Math.max(20, Math.round(kept / 10) * 10)});
  };
  const questionProps = {inputs, result, change, words};

  return (
    <ToolFrame result={
      <ToolResult title={t('tools.coffee.resultTitle', {method: t(`tools.coffee.methods.${inputs.method}`)})}
        sections={coffeeSections(words, inputs, result)}>
        {result.taste && <TasteChart taste={result.taste} ratio={result.ratio} ratioLabel={words.ratio}
          note={chartNote(t, inputs, recommendedResult)} />}
        {timer != null &&
          <TimerControl timerKey={toolTimerKey(SLUG, timer)} title={t('tools.coffee.name')}
            target={{toolSlug: SLUG}} duration={{seconds: timer, label: t('tools.coffee.brewTimeValue.clock',
                {time: words.clock(timer / 60)})}} />}
      </ToolResult>}>
      <UnitSwitch />
      <OptionList title={t('tools.coffee.method')} chosen={inputs.method} onChoose={chooseMethod}
        options={COFFEE_METHODS.map((method) => ({value: method, title: t(`tools.coffee.methods.${method}`),
          description: [t(`tools.coffee.methodDescriptions.${method}`), facts(method)].filter(Boolean).join(' '),
          image: COFFEE_METHOD_PHOTOS[method]}))} />
      <RecommendedButton result={result} recommendedResult={recommendedResult} onPress={() => change(recommended)} />

      {automat ? <AutomatQuestions {...questionProps} /> : <StrengthQuestion {...questionProps} />}

      <QuestionSection title={t('tools.coffee.beans')} info={t('tools.coffee.beansInfo')}>
        <SegmentedButtons value={inputs.roast}
          // A new roast brings its own water, until one is chosen again.
          onValueChange={(roast) => change({roast: roast as Roast, temperatureC: undefined})}
          buttons={ROASTS.map((roast) => ({value: roast, label: t(`tools.coffee.roasts.${roast}`)}))} />
        <SliderField label={t('tools.coffee.grind')} value={GRINDS.indexOf(result.grind)} min={0}
          max={GRINDS.length - 1} step={1} format={(index) => words.grindName(GRINDS[index])}
          onChange={(index) => change({grind: GRINDS[index]})} />
        <HintText>{t('tools.coffee.grindHint', {grind: words.grindName(result.recommendedGrind)})}</HintText>
      </QuestionSection>

      <WaterQuestion {...questionProps} />
      <BrewTimeQuestion {...questionProps} />
      {!automat && <AmountQuestion {...questionProps} />}
    </ToolFrame>
  );
};

const styles = StyleSheet.create({
  labelled: {gap: 6},
});
