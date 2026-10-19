import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {OptionList} from '../../../components/OptionList';
import {QuestionSection} from '../../../components/QuestionSection';
import {PresetTiles} from '../../../components/tools/PresetTiles';
import {SliderField} from '../../../components/tools/SliderField';
import {StageEditor} from '../../../components/tools/StageEditor';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {BakeTime, clockHours, clockTime, FRIDGE_MAX_C, presetStages, SCHEDULE_CHOICES, ScheduleChoice,
  SchedulePreset} from '../../../tools/dough/stages';
import {Stage} from '../../../tools/fermentation/fermentation';
import {stageText} from './doughResult';

interface Props extends BakeTime {
  preset: ScheduleChoice;
  /** The stages of the chosen schedule. */
  stages: Stage[];
  /** The presets recipes for this dough follow, marked as such. */
  recommended?: {presets: SchedulePreset[], label: string};
  roomC: number;
  /** Off where the schedule follows from something else, such as a rye sour. */
  showStages?: boolean;
  onChange: (changes: Partial<BakeTime & {preset: ScheduleChoice, stages: Stage[]}>) => void;
}

const DAYS: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];

const ICONS: Record<ScheduleChoice, string> = {
  quick: 'clock-fast',
  sameDay: 'white-balance-sunny',
  overnight: 'weather-night',
  fridge24: 'fridge-outline',
  fridge48: 'fridge-outline',
  fridge72: 'fridge-outline',
  custom: 'tune-variant',
};

// How long the dough rises and where, and when it is baked.
export const DoughSchedule = (props: Props) => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const format = {t, system, locale: i18n.language};
  const describe = (stages: Stage[]) => stages.map((stage) => stageText(format, stage)).join(', ');
  const clockDate = (hours: number) => {
    const date = new Date();
    date.setHours(0, Math.round(hours * 60), 0, 0);
    return date;
  };
  const day = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  };
  return (
    <>
      {props.showStages !== false &&
        <OptionList title={t('tools.dough.schedule')} info={t('tools.dough.scheduleInfo', {max: FRIDGE_MAX_C})}
          chosen={props.preset}
          onChoose={(preset) => props.onChange(preset === 'custom' ? {preset, stages: props.stages} : {preset})}
          options={SCHEDULE_CHOICES.map((choice) => ({value: choice, title: t(`tools.dough.presets.${choice}`),
            icon: ICONS[choice], description: choice !== 'custom' ? describe(presetStages(choice, props.roomC)) :
              props.preset === 'custom' ? describe(props.stages) : t('tools.dough.customSchedule'),
            badge: choice !== 'custom' && props.recommended?.presets.includes(choice) ? props.recommended.label :
              undefined}))}>
          {props.preset === 'custom' && <StageEditor stages={props.stages} onChange={(stages) => props.onChange({stages})} />}
        </OptionList>}
      <QuestionSection title={t('tools.dough.bakeWhen')}>
        <PresetTiles value={props.bakeDayOffset} onChoose={(bakeDayOffset) => props.onChange({bakeDayOffset})}
          presets={DAYS.map((offset) => ({value: offset, label: t(`tools.dough.days.${offset}`),
            caption: day(offset).toLocaleDateString(i18n.language, {day: 'numeric', month: 'short'}),
            picture: <Text variant="headlineSmall">
              {day(offset).toLocaleDateString(i18n.language, {weekday: 'short'})}
            </Text>}))} />
        <SliderField label={t('tools.dough.bakeTime')} value={clockHours(props.bakeTime)} min={0} max={23.75}
          step={0.25} format={(hours) => clockDate(hours).toLocaleTimeString(i18n.language, {hour: '2-digit',
            minute: '2-digit'})} onChange={(hours) => props.onChange({bakeTime: clockTime(hours)})} />
      </QuestionSection>
    </>
  );
};
