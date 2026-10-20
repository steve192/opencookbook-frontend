import React from 'react';
import {useTranslation} from 'react-i18next';
import {SegmentedButtons} from 'react-native-paper';
import {Notice} from '../../../components/Notice';
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
import {toolDefinition} from '../../../tools/registry';
import {ResultLine} from '../../../tools/result';
import {medianRange, Range} from '../../../tools/sources';
import {calculateTea, hasStrength, methodsOf, parseTeaInputs, RAW_HERBS, steepRange, TEA_STRENGTHS, TEA_TYPES,
  TeaMethod, TeaStrength, TeaType, TEAS} from '../../../tools/tea/tea';
import {formatTemperature, formatWeight} from '../../../tools/units';
import {TEA_TYPE_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';

const SLUG = toolDefinition('tea').slug;

const METHOD_ICONS: Record<TeaMethod, string> = {hot: 'kettle-outline', coldBrew: 'fridge-outline', iced: 'cube-outline'};

export const TeaTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('tea', parseTeaInputs);
  const result = calculateTea(inputs);
  const locale = i18n.language;
  // The timer runs to the steeping time chosen, to the 5 seconds.
  const steepSeconds = result.steepMinutes != null ? Math.round(result.steepMinutes * 12) * 5 : undefined;
  const herbs = RAW_HERBS.includes(inputs.type);
  const temperatures = (range: Range) => range.low === range.high ? formatTemperature(range.low, system, locale) :
    t('tools.range', {low: formatTemperature(range.low, system, locale), high: formatTemperature(range.high, system,
        locale)});
  const steeping = (minutes?: Range) => minutes ? t('tools.tea.minutes', {low: minutes.low, high: minutes.high}) :
    t('tools.tea.whisk');
  const clock = (minutes: number) => {
    const seconds = Math.round(minutes * 60);
    return t('tools.tea.clock', {minutes: Math.floor(seconds / 60), seconds: String(seconds % 60).padStart(2, '0')});
  };
  // What the sources give for a tea, so it can be compared before it is chosen.
  const facts = (type: TeaType) => {
    const data = TEAS[type];
    return [temperatures(medianRange(data.temperatureC)), steeping(data.minutes && medianRange(data.minutes))]
        .join(' · ');
  };
  const methods = methodsOf(inputs.type);

  const brewing: ResultLine[] = result.hours != null ? [
    {label: t('tools.tea.waterTemperature'), value: t('tools.tea.coldWater')},
    {label: t('tools.tea.steep'), value: t('tools.tea.inTheFridge', {hours: result.hours})},
  ] : [
    {label: t('tools.tea.waterTemperature'), value: temperatures(result.temperatureC!)},
    {label: t('tools.tea.steep'), value: result.steepMinutes != null ? clock(result.steepMinutes) : t('tools.tea.whisk')},
    ...(result.taste ? [{label: t('tools.tea.taste'), value: t('tools.tea.tasteValue', {
      strength: t(`tools.tea.strengthTastes.${inputs.strength}`),
      steep: t(`tools.tea.steepTastes.${result.taste}`)})}] : []),
    ...(result.infusions && result.steepMinutes != null ? [{label: t('tools.tea.infusions'),
      value: t('tools.tea.infusionsValue', {count: result.infusions.count}),
      info: t('tools.tea.infusionsInfo', {count: result.infusions.count,
        seconds: Math.round(result.infusions.stepMinutes * 60)}),
      details: Array.from({length: result.infusions.count}, (_, index) => ({
        label: t('tools.tea.infusion', {n: index + 1}),
        value: clock(result.steepMinutes! + index * result.infusions!.stepMinutes)}))}] : []),
  ];

  return (
    <ToolFrame result={<>
      {inputs.method === 'coldBrew' && herbs &&
        <Notice icon="alert-outline" tone="warning">{t('tools.tea.rawHerbsWarning')}</Notice>}
      <ToolResult title={t(`tools.tea.resultTitles.${inputs.method}`, {type: t(`tools.tea.types.${inputs.type}`)})}
        sections={[
          {title: t('tools.tea.toWeigh'), icon: 'scale-balance', lines: [
            {label: t('tools.tea.tea'), value: formatWeight(result.teaG, system, locale)},
            ...(result.iceG != null ? [{label: t('tools.tea.ice'), value: formatWeight(result.iceG, system, locale)}] : []),
          ]},
          {title: t('tools.tea.brewing'), icon: METHOD_ICONS[inputs.method], lines: brewing},
        ]}>
        {steepSeconds != null &&
          <TimerControl timerKey={toolTimerKey(SLUG, steepSeconds)} title={t('tools.tea.name')}
            target={{toolSlug: SLUG}}
            duration={{seconds: steepSeconds, label: clock(steepSeconds / 60)}} />}
      </ToolResult>
    </>}>
      <UnitSwitch />
      <OptionList title={t('tools.tea.type')} chosen={inputs.type}
        // Another tea starts from the middle of its own steeping time.
        onChoose={(type) => change({type, method: methodsOf(type).includes(inputs.method) ? inputs.method : 'hot',
          steepMinutes: undefined})}
        options={TEA_TYPES.map((type) => ({value: type, title: t(`tools.tea.types.${type}`),
          description: `${t(`tools.tea.typeDescriptions.${type}`)} ${facts(type)}`, image: TEA_TYPE_PHOTOS[type]}))} />
      {methods.length > 1 &&
        <QuestionSection title={t('tools.tea.method')}>
          <SegmentedButtons value={inputs.method} onValueChange={(method) => change({method: method as TeaMethod})}
            buttons={methods.map((method) => ({value: method, label: t(`tools.tea.methods.${method}`)}))} />
          <HintText>{t(`tools.tea.methodHints.${inputs.method}`)}</HintText>
        </QuestionSection>}
      {hasStrength(inputs.type) &&
        <QuestionSection title={t('tools.tea.strength')} hint={t('tools.tea.strengthHint')}
          info={t('tools.tea.amountAndTimeInfo')}>
          <SegmentedButtons value={inputs.strength}
            onValueChange={(strength) => change({strength: strength as TeaStrength})}
            buttons={TEA_STRENGTHS.map((strength) => ({value: strength, label: t(`tools.tea.strengths.${strength}`)}))} />
        </QuestionSection>}
      {result.steepMinutes != null && result.minutes &&
        <QuestionSection title={t('tools.tea.steepTime')} hint={t(herbs ? 'tools.tea.steepTimeHintHerbs' :
          'tools.tea.steepTimeHint')} info={t('tools.tea.amountAndTimeInfo')}>
          <SliderField label={t('tools.tea.steepFor')} value={result.steepMinutes} min={steepRange(inputs.type).low}
            max={steepRange(inputs.type).high} step={0.25} format={clock}
            onChange={(steepMinutes) => change({steepMinutes})} />
          <HintText>{t('tools.tea.steepGuides', {low: clock(result.minutes.low), high: clock(result.minutes.high)})}
          </HintText>
        </QuestionSection>}
      <QuestionSection title={t('tools.tea.howMuch')}>
        <MeasureSlider label={t('tools.tea.water')} measure="volume" value={inputs.waterMl} min={20} max={2000}
          step={{metric: 10, imperial: 1}} onChange={(waterMl) => change({waterMl})} />
      </QuestionSection>
    </ToolFrame>
  );
};
