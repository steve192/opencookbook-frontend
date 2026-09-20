import React from 'react';
import {useTranslation} from 'react-i18next';
import {SegmentedButtons} from 'react-native-paper';
import {Effort} from '../../../dao/RestAPI';
import {EFFORTS, effortLabel} from '../../../helper/efforts';

interface Props {
  /** Undefined shows no choice, where the days it stands for differ. */
  value: Effort | undefined;
  onChange: (effort: Effort) => void;
}

// How much work a meal may be.
export const EffortChoice = (props: Props) => {
  const {t} = useTranslation('translation');
  return (
    <SegmentedButtons
      density="small"
      value={props.value ?? ''}
      onValueChange={(value) => props.onChange(value as Effort)}
      buttons={EFFORTS.map((effort) => ({value: effort, label: effortLabel(t, effort)}))} />
  );
};
