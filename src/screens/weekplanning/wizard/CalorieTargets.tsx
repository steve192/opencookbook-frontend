import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import {NumberInput} from '../../../components/NumberInput';
import {HintText, QuestionSection} from '../../../components/QuestionSection';
import {mealTypeLabel} from '../../../helper/mealTypes';
import {hasMealKcal, kcalTargetOf, withEvenKcal, withKcalPerDay, withMealKcal} from '../../../helper/planningProfile';
import {ProfileSectionProps} from './ProfileSectionProps';

// Calories for the day, and how they fall on its meals. An even split is what most cooks want, so
// the fields per meal only appear when asked for; the split line shows the result either way.
export const CalorieTargets = ({profile, onChange}: ProfileSectionProps) => {
  const {t} = useTranslation('translation');
  const [settingPerMeal, setSettingPerMeal] = useState(false);
  const showsPerMeal = settingPerMeal || hasMealKcal(profile);

  const split = profile.meals
      .map((meal) => ({meal, kcal: kcalTargetOf(profile, meal)}))
      .filter(({kcal}) => kcal !== null)
      .map(({meal, kcal}) => `${mealTypeLabel(t, meal.mealType)} ${Math.round(kcal!)}`)
      .join(' · ');

  const togglePerMeal = () => {
    if (showsPerMeal) {
      onChange(withEvenKcal(profile));
    }
    setSettingPerMeal(!showsPerMeal);
  };

  return (
    <QuestionSection title={t('screens.planning.calories')}>
      <NumberInput label={t('screens.planning.kcalPerDay')} value={profile.kcalPerDay}
        onChangeText={(text) => onChange(withKcalPerDay(profile, text))} />
      {showsPerMeal &&
        <>
          <View style={styles.perMeal}>
            {profile.meals.map((meal) => (
              <View key={meal.mealType} style={styles.mealField}>
                <NumberInput label={mealTypeLabel(t, meal.mealType)} value={meal.targetKcal}
                  onChangeText={(text) => onChange(withMealKcal(profile, meal.mealType, text))} />
              </View>
            ))}
          </View>
          <HintText>{t('screens.planning.kcalPerMealHint')}</HintText>
        </>
      }
      {split !== '' && <HintText>{t('screens.planning.kcalSplit', {split})}</HintText>}
      {profile.meals.length > 1 &&
        <Button mode="text" compact icon={showsPerMeal ? 'scale-balance' : 'tune-variant'} style={styles.toggle}
          onPress={togglePerMeal}>
          {t(showsPerMeal ? 'screens.planning.kcalEven' : 'screens.planning.kcalPerMeal')}
        </Button>
      }
    </QuestionSection>
  );
};

const styles = StyleSheet.create({
  perMeal: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  mealField: {flexBasis: '45%', flexGrow: 1},
  toggle: {alignSelf: 'flex-start'},
});
