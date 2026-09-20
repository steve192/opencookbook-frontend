import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons, Surface, Switch, Text} from 'react-native-paper';
import {HintText} from '../../../components/QuestionSection';
import {DayOfWeek} from '../../../dao/RestAPI';
import {DAYS_OF_WEEK, dayOfWeekLabel, shortDayOfWeekLabel} from '../../../helper/daysOfWeek';
import {mealTypeLabel} from '../../../helper/mealTypes';
import {mealsOn, withCookedOnToggled, withMealEffort} from '../../../helper/planningProfile';
import {EffortChoice} from './EffortChoice';
import {ProfileSectionProps} from './ProfileSectionProps';

// The week one day at a time: which meals are cooked on it and how much work each may be. One day
// on screen keeps each day's meals together instead of seven stacked cards.
export const DayScheduleEditor = ({profile, onChange}: ProfileSectionProps) => {
  const {t} = useTranslation('translation');
  const [day, setDay] = useState<DayOfWeek>('MONDAY');
  const cookedThatDay = mealsOn(profile, day).length > 0;

  return (
    <>
      <HintText>{t('screens.planning.daysHint')}</HintText>
      <SegmentedButtons
        density="small"
        value={day}
        onValueChange={(value) => setDay(value as DayOfWeek)}
        buttons={DAYS_OF_WEEK.map((weekday) => ({value: weekday, label: shortDayOfWeekLabel(weekday)}))} />
      <Surface style={styles.day} elevation={1}>
        <Text variant="titleMedium">{dayOfWeekLabel(t, day)}</Text>
        {profile.meals.map((meal) => {
          const effort = meal.days[day];
          return (
            <View key={meal.mealType} style={styles.meal}>
              <View style={styles.mealRow}>
                <Text variant="bodyLarge" style={styles.mealName}>{mealTypeLabel(t, meal.mealType)}</Text>
                <Switch value={effort !== undefined}
                  onValueChange={() => onChange(withCookedOnToggled(profile, day, meal.mealType))} />
              </View>
              {effort &&
                <EffortChoice value={effort}
                  onChange={(chosen) => onChange(withMealEffort(profile, meal.mealType, [day], chosen))} />
              }
            </View>
          );
        })}
        {!cookedThatDay && <HintText>{t('screens.planning.nothingCookedOnDay')}</HintText>}
      </Surface>
    </>
  );
};

const styles = StyleSheet.create({
  day: {padding: 16, borderRadius: 16, gap: 12},
  meal: {gap: 6},
  mealRow: {flexDirection: 'row', alignItems: 'center'},
  mealName: {flex: 1},
});
