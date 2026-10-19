import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {CountStepper} from '../../../components/CountStepper';
import {Notice} from '../../../components/Notice';
import {OptionList} from '../../../components/OptionList';
import {HintText, QuestionSection} from '../../../components/QuestionSection';
import {SwitchRow} from '../../../components/SwitchRow';
import {MeasureField} from '../../../components/tools/MeasureField';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {DoughBallPicture, PizzaSizePicture} from '../../../components/tools/PizzaPictures';
import {PresetTiles} from '../../../components/tools/PresetTiles';
import {SliderField} from '../../../components/tools/SliderField';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {amountModesOf, ballPresets, calculatePizza, defaultPizzaInputs, doughForDiameter, parsePizzaInputs, pizzaStages,
  PizzaInputs} from '../../../tools/pizza/pizza';
import {FLOURS, PIZZA_DIAMETERS, PIZZA_FLOURS, PIZZA_OVENS, PIZZA_STYLES, PizzaFlour, PizzaOven,
  STYLES} from '../../../tools/pizza/pizzaData';
import {median, Range} from '../../../tools/sources';
import {formatLength, formatTemperature, formatWeight} from '../../../tools/units';
import {DoughSchedule} from '../dough/DoughSchedule';
import {DoughTemperatures} from '../dough/DoughTemperatures';
import {ingredientLines, timelineSection} from '../dough/doughResult';
import {LeavenerChoice} from '../dough/LeavenerChoice';
import {PIZZA_STYLE_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';


const OVEN_ICONS: Record<PizzaOven, string> = {tray: 'stove', stone: 'stove', steel: 'stove', pizzaOven: 'fireplace'};

const CENTIMETRE = {metric: 1, imperial: 0.5};

const BAKE_VALUES = {
  near: 'tools.pizzaDough.bakeValue',
  orLess: 'tools.pizzaDough.bakeValueOrLess',
  atLeast: 'tools.pizzaDough.bakeValueAtLeast',
} as const;

export const PizzaTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('pizzaDough', parsePizzaInputs);
  const [knowsW, setKnowsW] = useState(inputs.wValue != null);
  const result = calculatePizza(inputs);
  const format = {t, system, locale: i18n.language};
  const weight = (grams: number) => formatWeight(grams, system, i18n.language);
  const length = (centimetres: number) => formatLength(centimetres, system, i18n.language);
  const temperature = (celsius: number) => formatTemperature(celsius, system, i18n.language);
  const round = STYLES[inputs.style].shape === 'round';
  const styleName = t(`tools.pizzaDough.styles.${inputs.style}`);

  // A Neapolitan bake of 60 to 90 seconds reads better in seconds than as a fraction of a minute.
  const bakeDuration = (minutes: Range) => {
    const inSeconds = minutes.high < 2;
    const shown = (value: number) => inSeconds ? Math.round(value * 12) * 5 : Math.round(value);
    const [low, high] = [shown(minutes.low), shown(minutes.high)];
    const unit = t(inSeconds ? 'tools.units.seconds' : 'tools.units.minutes');
    return `${low === high ? low : t('tools.range', {low, high})} ${unit}`;
  };

  const flourDescription = (flour: PizzaFlour) => {
    const water = median(FLOURS[flour].maxHydration);
    const hours = median(FLOURS[flour].maxHours ?? []);
    return [t(`tools.dough.flourDescriptions.${flour}`),
      ...(water != null ? [t('tools.dough.flourWater', {water: Math.round(water)})] : []),
      ...(hours != null ? [t('tools.dough.flourHours', {hours})] : [])].join(' ');
  };

  // A new style starts with what its recipes use: their flour and their schedule.
  const chooseStyle = (style: PizzaInputs['style']) => {
    const defaults = defaultPizzaInputs(style);
    change({style, amountMode: defaults.amountMode, ballWeightG: defaults.ballWeightG, flour: defaults.flour,
      ...(inputs.preset !== 'custom' ? {preset: defaults.preset} : {})});
  };
  const styleData = STYLES[inputs.style];
  const recommended = t('tools.pizzaDough.recommendedFor', {style: styleName});
  const stages = pizzaStages(inputs);

  const balls = round ? ballPresets(inputs.style) : [];
  const heaviestBall = Math.max(...balls.map((ball) => ball.weightG));
  const largestPizza = Math.max(...PIZZA_DIAMETERS);
  const madeFor = result.bake.madeFor;
  const madeForNotice = madeFor &&
    <Notice icon="information-outline" tone="information">
      {madeFor.oven === 'pizzaOven' && inputs.oven !== 'pizzaOven' ?
        t('tools.pizzaDough.madeForPizzaOven', {style: styleName, temperature: temperature(madeFor.temperatureC),
          max: temperature(result.bake.temperatureC), surface: t(`tools.pizzaDough.surfaces.${inputs.oven}`)}) :
        t('tools.pizzaDough.madeForHotterOven', {style: styleName, temperature: temperature(madeFor.temperatureC),
          max: temperature(result.bake.temperatureC)})}
    </Notice>;

  const resultColumn = <>
    {result.warnings.map((warning) => (
      <Notice key={warning} icon="alert-outline" tone="warning">{t(`tools.dough.warnings.${warning}`)}</Notice>
    ))}
    <ToolResult
      title={t('tools.pizzaDough.resultTitle', {style: styleName})}
      sections={[
        {title: t('tools.result.ingredients'), icon: 'basket-outline',
          lines: ingredientLines(format, result.amounts, inputs.leavener, result.blend && [
            {label: t('tools.dough.flour'), value: weight(result.amounts.flour)},
            {label: t('tools.pizzaDough.riceFlour'), value: weight(result.blend.rice)},
            {label: t('tools.pizzaDough.soyFlour'), value: weight(result.blend.soy)},
          ])},
        {title: t('tools.result.preparation'), icon: 'chef-hat', lines: [
          ...(result.pieces > 0 ? [{label: t(`tools.pizzaDough.pieces.${round ? 'balls' : 'trays'}`,
              {count: result.pieces}), value: weight(result.pieceWeight)}] : []),
          {label: t('tools.dough.waterTemperature'), value: temperature(result.waterTemperatureC)},
          {label: t('tools.pizzaDough.bake'), value: t(BAKE_VALUES[result.bake.fit],
              {temperature: temperature(result.bake.temperatureC), duration: bakeDuration(result.bake.minutes)})},
        ]},
        timelineSection(format, stages, inputs, new Date(), inputs.kneading),
      ]} />
  </>;

  return (
    <ToolFrame result={resultColumn}>
      <UnitSwitch />
      <OptionList title={t('tools.pizzaDough.style')} chosen={inputs.style} onChoose={chooseStyle}
        options={PIZZA_STYLES.map((style) => ({value: style, title: t(`tools.pizzaDough.styles.${style}`),
          description: t(`tools.pizzaDough.styleDescriptions.${style}`), image: PIZZA_STYLE_PHOTOS[style]}))} />

      <QuestionSection title={t('tools.pizzaDough.amount')}>
        <ChoiceChips values={amountModesOf(inputs.style)} label={(mode) => t(`tools.pizzaDough.amountModes.${mode}`)}
          isChosen={(mode) => mode === inputs.amountMode} onToggle={(amountMode) => change({amountMode})} />
        {inputs.amountMode !== 'flour' &&
          <CountStepper label={t(`tools.pizzaDough.counts.${inputs.amountMode}`)} value={String(inputs.count)}
            decreaseLabel={t('tools.fewer')} increaseLabel={t('tools.more')} canDecrease={inputs.count > 1}
            canIncrease={inputs.count < 100} onDecrease={() => change({count: inputs.count - 1})}
            onIncrease={() => change({count: inputs.count + 1})}
            entry={{min: 1, max: 100, onChange: (count) => change({count})}} />}
        {inputs.amountMode === 'balls' &&
          <PresetTiles value={inputs.ballWeightG} onChoose={(ballWeightG) => change({ballWeightG})}
            presets={balls.map((ball) => ({value: ball.weightG, label: weight(ball.weightG),
              caption: ball.diameterCm ? t('tools.pizzaDough.ballMakes', {diameter: length(ball.diameterCm)}) :
                undefined,
              picture: <DoughBallPicture grams={ball.weightG} heaviestGrams={heaviestBall} />}))}
            ownField={<MeasureSlider label={t('tools.pizzaDough.ballWeight')} measure="weight"
              value={inputs.ballWeightG} min={100} max={600} step={{metric: 5, imperial: 0.25}}
              onChange={(ballWeightG) => change({ballWeightG})} />} />}
        {inputs.amountMode === 'pizzas' &&
          <PresetTiles value={inputs.diameterCm} onChoose={(diameterCm) => change({diameterCm})}
            presets={PIZZA_DIAMETERS.map((diameterCm) => ({value: diameterCm, label: length(diameterCm),
              caption: weight(doughForDiameter(inputs.style, diameterCm)),
              picture: <PizzaSizePicture diameterCm={diameterCm} largestCm={largestPizza} />}))}
            ownField={<MeasureSlider label={t('tools.pizzaDough.diameter')} measure="length"
              value={inputs.diameterCm} min={15} max={50} step={CENTIMETRE}
              onChange={(diameterCm) => change({diameterCm})} />} />}
        {inputs.amountMode === 'trays' && <>
          <MeasureSlider label={t('tools.pizzaDough.trayWidth')} measure="length" value={inputs.trayWidthCm}
            min={15} max={60} step={CENTIMETRE} onChange={(trayWidthCm) => change({trayWidthCm})} />
          <MeasureSlider label={t('tools.pizzaDough.trayLength')} measure="length" value={inputs.trayLengthCm}
            min={15} max={60} step={CENTIMETRE} onChange={(trayLengthCm) => change({trayLengthCm})} />
        </>}
        {inputs.amountMode === 'flour' &&
          <MeasureField label={t('tools.dough.flourOnHand')} measure="weight" value={inputs.flourG} min={50} max={50000}
            onChange={(flourG) => change({flourG})} />}
      </QuestionSection>

      <OptionList title={t('tools.dough.flourType')} chosen={inputs.flour} onChoose={(flour) => change({flour})}
        options={PIZZA_FLOURS.map((flour) => ({value: flour, title: t(`tools.dough.flours.${flour}`),
          description: flourDescription(flour), badge: flour === styleData.flour ? recommended : undefined}))}>
        <SwitchRow label={t('tools.pizzaDough.knowsW')} explanation={t('tools.pizzaDough.knowsWHint')} value={knowsW}
          onChange={(known) => {
            setKnowsW(known);
            change({wValue: known ? inputs.wValue ?? 280 : undefined});
          }} />
        {knowsW && inputs.wValue != null &&
          <SliderField label={t('tools.pizzaDough.wValue')} value={inputs.wValue} min={100} max={500} step={10}
            format={String} onChange={(wValue) => change({wValue})} />}
      </OptionList>

      <LeavenerChoice chosen={inputs.leavener} onChoose={(leavener) => change({leavener})} />

      {round ?
        <OptionList title={t('tools.pizzaDough.oven')} info={t('tools.pizzaDough.ovenInfo')} chosen={inputs.oven}
          onChoose={(oven) => change({oven})}
          options={PIZZA_OVENS.map((oven) => ({value: oven, title: t(`tools.pizzaDough.ovens.${oven}`),
            description: t(`tools.pizzaDough.ovenDescriptions.${oven}`), icon: OVEN_ICONS[oven]}))}>
          {inputs.oven !== 'pizzaOven' && <OvenMaxSlider value={inputs.ovenMaxC} onChange={change} />}
          <HintText>{t(`tools.pizzaDough.ovenTips.${inputs.oven}`)}</HintText>
          {madeForNotice}
        </OptionList> :
        <QuestionSection title={t('tools.pizzaDough.oven')} info={t('tools.pizzaDough.ovenInfo')}>
          <OvenMaxSlider value={inputs.ovenMaxC} onChange={change} />
          <HintText>{t('tools.pizzaDough.ovenTips.pan')}</HintText>
          {madeForNotice}
        </QuestionSection>}

      <DoughSchedule preset={inputs.preset} stages={stages} roomC={inputs.roomC}
        recommended={styleData.schedules && {presets: styleData.schedules, label: recommended}}
        bakeDayOffset={inputs.bakeDayOffset} bakeTime={inputs.bakeTime} onChange={change} />
      <DoughTemperatures roomC={inputs.roomC} kneading={inputs.kneading} onChange={change} />
    </ToolFrame>
  );
};

// The hottest the home oven gets, which caps the bake temperature.
const OvenMaxSlider = (props: {value: number, onChange: (changes: Partial<PizzaInputs>) => void}) => {
  const {t} = useTranslation('translation');
  return (
    <MeasureSlider label={t('tools.pizzaDough.ovenMax')} info={t('tools.pizzaDough.ovenMaxInfo')} measure="temperature"
      value={props.value} min={150} max={350} step={{metric: 5, imperial: 10}}
      onChange={(ovenMaxC) => props.onChange({ovenMaxC})} />
  );
};
