import React from 'react';
import {useTranslation} from 'react-i18next';
import {Notice} from '../../../components/Notice';
import {OptionList} from '../../../components/OptionList';
import {SwitchRow} from '../../../components/SwitchRow';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {SliderField} from '../../../components/tools/SliderField';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {convertOven, HEAT_MODES, HeatMode, OFFSETS, parseOvenInputs} from '../../../tools/oven/oven';
import {formatTemperature} from '../../../tools/units';
import {useToolInputs} from '../useToolInputs';

const ICONS: Record<HeatMode, string> = {topBottom: 'stove', fan: 'fan', airFryer: 'toaster-oven'};

export const OvenTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('ovenConverter', parseOvenInputs);
  const result = convertOven(inputs);
  const modeLabel = (mode: HeatMode) => t(`tools.ovenConverter.modes.${mode}`);
  const options = HEAT_MODES.map((mode) => ({value: mode, title: modeLabel(mode), icon: ICONS[mode],
    description: t(`tools.ovenConverter.modeDescriptions.${mode}`,
        {offset: formatTemperature(OFFSETS[mode], 'metric', i18n.language)})}));

  return (
    <ToolFrame result={<>
      {result.warnings.map((warning) => (
        <Notice key={warning} icon="alert-outline" tone="warning">{t(`tools.ovenConverter.warnings.${warning}`)}</Notice>
      ))}
      <ToolResult
        title={t('tools.ovenConverter.resultTitle', {mode: modeLabel(inputs.to)})}
        sections={[{title: t('tools.ovenConverter.yourSetting'), icon: ICONS[inputs.to], lines: [
          {label: t('tools.ovenConverter.temperature'),
            value: formatTemperature(result.temperatureC, system, i18n.language)},
          ...(result.minutes != null ? [{label: t('tools.ovenConverter.time'),
            value: t('tools.ovenConverter.minutes', {count: result.minutes})}] : []),
          {label: t('tools.ovenConverter.checkEarly'),
            value: t('tools.ovenConverter.minutesEarly', {count: result.checkEarlyMinutes})},
        ]}]} />
    </>}>
      <UnitSwitch />
      <OptionList title={t('tools.ovenConverter.recipeSays')} chosen={inputs.from} onChoose={(from) => change({from})}
        options={options}>
        <MeasureSlider label={t('tools.ovenConverter.temperature')} measure="temperature" value={inputs.temperatureC}
          min={50} max={300} step={{metric: 5, imperial: 10}} onChange={(temperatureC) => change({temperatureC})} />
        <SliderField label={t('tools.ovenConverter.time')} info={t('tools.ovenConverter.timeHint')}
          value={inputs.minutes} min={0} max={240} step={1}
          format={(minutes) => minutes === 0 ? t('tools.ovenConverter.noTime') :
            t('tools.ovenConverter.minutes', {count: minutes})}
          onChange={(minutes) => change({minutes})} />
      </OptionList>
      <OptionList title={t('tools.ovenConverter.iUse')} chosen={inputs.to} onChoose={(to) => change({to})}
        options={options}>
        {inputs.to === 'airFryer' && inputs.from !== 'airFryer' &&
          <SwitchRow label={t('tools.ovenConverter.frozen')} explanation={t('tools.ovenConverter.frozenHint')}
            value={inputs.frozen} onChange={(frozen) => change({frozen})} />}
      </OptionList>
    </ToolFrame>
  );
};
