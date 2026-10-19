import React from 'react';
import {useTranslation} from 'react-i18next';
import {OptionList} from '../../../components/OptionList';
import {QuestionSection} from '../../../components/QuestionSection';
import {SwitchRow} from '../../../components/SwitchRow';
import {TimerControl} from '../../../components/TimerControl';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {toolTimerKey} from '../../../helper/cookingTimers';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {toolDefinition} from '../../../tools/registry';
import {medianRange, midpoint, Range} from '../../../tools/sources';
import {calculateTea, ICED_TEA_TYPES, parseTeaInputs, TEA_TYPES, TeaType, TEAS} from '../../../tools/tea/tea';
import {formatTemperature, formatWeight} from '../../../tools/units';
import {TEA_TYPE_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';

const SLUG = toolDefinition('tea').slug;

export const TeaTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('tea', parseTeaInputs);
  const result = calculateTea(inputs);
  const locale = i18n.language;
  // The timer runs to the middle of the range the sources give.
  const steepSeconds = result.minutes && Math.round(midpoint(result.minutes) * 60);
  const temperatures = (range: Range) => range.low === range.high ? formatTemperature(range.low, system, locale) :
    t('tools.range', {low: formatTemperature(range.low, system, locale), high: formatTemperature(range.high, system,
        locale)});
  const steeping = (minutes?: Range) => minutes ? t('tools.tea.minutes', {low: minutes.low, high: minutes.high}) :
    t('tools.tea.whisk');
  // What the sources give for a tea, so it can be compared before it is chosen.
  const facts = (type: TeaType) => {
    const data = TEAS[type];
    return [temperatures(medianRange(data.temperatureC)), steeping(data.minutes && medianRange(data.minutes))]
        .join(' · ');
  };

  return (
    <ToolFrame result={
      <ToolResult title={t('tools.tea.resultTitle', {type: t(`tools.tea.types.${inputs.type}`)})} sections={[
        {title: t('tools.tea.toWeigh'), icon: 'scale-balance', lines: [
          {label: t('tools.tea.tea'), value: formatWeight(result.teaG, system, locale)},
          ...(result.iceG != null ? [{label: t('tools.tea.ice'), value: formatWeight(result.iceG, system, locale)}] : []),
        ]},
        {title: t('tools.tea.brewing'), icon: 'kettle-outline', lines: [
          {label: t('tools.tea.waterTemperature'), value: temperatures(result.temperatureC)},
          {label: t('tools.tea.steep'), value: steeping(result.minutes)},
        ]},
      ]}>
        {steepSeconds != null &&
          <TimerControl timerKey={toolTimerKey(SLUG, steepSeconds)} title={t('tools.tea.name')}
            target={{toolSlug: SLUG}}
            duration={{seconds: steepSeconds, label: t('tools.tea.timerLabel', {minutes: steepSeconds / 60})}} />}
      </ToolResult>}>
      <UnitSwitch />
      <OptionList title={t('tools.tea.type')} chosen={inputs.type}
        onChoose={(type) => change({type, iced: ICED_TEA_TYPES.includes(type) && inputs.iced})}
        options={TEA_TYPES.map((type) => ({value: type, title: t(`tools.tea.types.${type}`),
          description: `${t(`tools.tea.typeDescriptions.${type}`)} ${facts(type)}`, image: TEA_TYPE_PHOTOS[type]}))} />
      <QuestionSection title={t('tools.tea.howMuch')}>
        <MeasureSlider label={t('tools.tea.water')} measure="volume" value={inputs.waterMl} min={20} max={2000}
          step={{metric: 10, imperial: 1}} onChange={(waterMl) => change({waterMl})} />
        {ICED_TEA_TYPES.includes(inputs.type) &&
          <SwitchRow label={t('tools.tea.iced')} explanation={t('tools.tea.icedHint')} value={inputs.iced}
            onChange={(iced) => change({iced})} />}
      </QuestionSection>
    </ToolFrame>
  );
};
