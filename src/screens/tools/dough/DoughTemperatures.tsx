import React from 'react';
import {useTranslation} from 'react-i18next';
import {SegmentedButtons} from 'react-native-paper';
import {QuestionSection} from '../../../components/QuestionSection';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {Kneading, KNEADINGS} from '../../../tools/dough/dough';

interface Props {
  roomC: number;
  kneading: Kneading;
  onChange: (changes: Partial<{roomC: number, kneading: Kneading}>) => void;
}

const DEGREE = {metric: 1, imperial: 1};

const KNEADING_ICONS: Record<Kneading, string> = {hand: 'hand-back-right-outline', machine: 'blender'};

// What the water temperature is worked out from: the room and the kneading.
export const DoughTemperatures = (props: Props) => {
  const {t} = useTranslation('translation');
  return (
    <QuestionSection title={t('tools.dough.temperatures')} hint={t('tools.dough.temperaturesHint')}
      info={t('tools.dough.temperaturesInfo')}>
      <MeasureSlider label={t('tools.dough.room')} info={t('tools.dough.roomInfo')} measure="temperature"
        value={props.roomC} min={10} max={35} step={DEGREE} onChange={(roomC) => props.onChange({roomC})} />
      <SegmentedButtons value={props.kneading}
        onValueChange={(kneading) => props.onChange({kneading: kneading as Kneading})}
        buttons={KNEADINGS.map((kneading) => ({value: kneading, label: t(`tools.dough.kneading.${kneading}`),
          icon: KNEADING_ICONS[kneading]}))} />
    </QuestionSection>
  );
};
