import React from 'react';
import {useTranslation} from 'react-i18next';
import {CountStepper} from '../../../components/CountStepper';
import {PROFILE_COUNTS, ProfileCount, profileCount, withProfileCount} from '../../../helper/planningProfile';
import {ProfileSectionProps} from './ProfileSectionProps';

interface Props extends ProfileSectionProps {
  field: ProfileCount;
  label: string;
}

// A count of the profile, within the server's bounds.
export const ProfileCountStepper = ({profile, onChange, field, label}: Props) => {
  const {t} = useTranslation('translation');
  const value = profileCount(profile, field);
  return (
    <CountStepper
      label={label}
      value={String(value)}
      decreaseLabel={t('screens.planning.fewer')}
      increaseLabel={t('screens.planning.more')}
      canDecrease={value > PROFILE_COUNTS[field].min}
      canIncrease={value < PROFILE_COUNTS[field].max}
      onDecrease={() => onChange(withProfileCount(profile, field, value - 1))}
      onIncrease={() => onChange(withProfileCount(profile, field, value + 1))} />
  );
};
