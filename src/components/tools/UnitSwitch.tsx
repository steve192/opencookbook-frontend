import React from 'react';
import {useTranslation} from 'react-i18next';
import {SegmentedButtons} from 'react-native-paper';
import {useUnitSystem} from '../../helper/useUnitSystem';
import {UnitSystem} from '../../tools/units';

// Metric or imperial, one choice for every tool.
export const UnitSwitch = () => {
  const {t} = useTranslation('translation');
  const [system, choose] = useUnitSystem();
  return (
    <SegmentedButtons
      density="small"
      value={system}
      onValueChange={(value) => choose(value as UnitSystem)}
      buttons={[
        {value: 'metric', label: t('tools.units.metric')},
        {value: 'imperial', label: t('tools.units.imperial')},
      ]} />
  );
};
