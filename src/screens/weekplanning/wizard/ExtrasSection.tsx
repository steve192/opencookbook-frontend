import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Switch, Text} from 'react-native-paper';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {HintText} from '../../../components/QuestionSection';
import {withToggled} from '../../../helper/choices';
import {MACRO_STYLES, macroStyleLabel} from '../../../helper/macroStyles';
import {CalorieTargets} from './CalorieTargets';
import {ProfileCountStepper} from './ProfileCountStepper';
import {ProfileSectionProps} from './ProfileSectionProps';

// The optional preferences; the defaults suit most weeks.
export const ExtrasSection = ({profile, onChange}: ProfileSectionProps) => {
  const {t} = useTranslation('translation');

  // Both default to on, as the server does
  const renderSwitch = (label: string, hint: string, field: 'leftoversAllowed' | 'spreadVariety') => (
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <Text variant="bodyLarge">{label}</Text>
        <HintText>{hint}</HintText>
      </View>
      <Switch value={profile[field] ?? true} onValueChange={(value) => onChange({...profile, [field]: value})} />
    </View>
  );

  return (
    <>
      {renderSwitch(t('screens.planning.leftovers'), t('screens.planning.leftoversHint'), 'leftoversAllowed')}
      {renderSwitch(t('screens.planning.spreadVariety'), t('screens.planning.spreadVarietyHint'), 'spreadVariety')}
      <ProfileCountStepper profile={profile} onChange={onChange} field="cooldownWeeks"
        label={t('screens.planning.cooldownWeeks')} />
      <ChoiceChips
        title={t('screens.planning.macroStyle')}
        values={MACRO_STYLES}
        isChosen={(style) => profile.macroStyle === style}
        label={(style) => macroStyleLabel(t, style)}
        onToggle={(style) => onChange(withToggled(profile, 'macroStyle', style))} />
      <CalorieTargets profile={profile} onChange={onChange} />
    </>
  );
};

const styles = StyleSheet.create({
  switchRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  switchText: {flex: 1},
});
