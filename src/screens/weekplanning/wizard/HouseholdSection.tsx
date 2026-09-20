import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Surface, Text} from 'react-native-paper';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {CountStepper} from '../../../components/CountStepper';
import {HintText} from '../../../components/QuestionSection';
import {PlanningMeal} from '../../../dao/RestAPI';
import {WEEKEND, WORKDAYS} from '../../../helper/daysOfWeek';
import {MEAL_TYPES, mealTypeLabel} from '../../../helper/mealTypes';
import {
  canPlan,
  cookedDays,
  effortOf,
  gapsPerWeek,
  hasChosenDays,
  plannedMeal,
  withAutomaticDays,
  withCookedPerWeek,
  withMealEffort,
  withMealToggled,
} from '../../../helper/planningProfile';
import {DayScheduleEditor} from './DayScheduleEditor';
import {EffortChoice} from './EffortChoice';
import {ProfileCountStepper} from './ProfileCountStepper';
import {ProfileSectionProps} from './ProfileSectionProps';

const DAY_GROUPS = [
  {days: WORKDAYS, label: 'screens.planning.workdays'},
  {days: WEEKEND, label: 'screens.planning.weekend'},
] as const;

// Who eats and which meals are cooked how often, with how much effort. How often a week and one
// effort for workdays and one for the weekend suit most cooks; each day is set only when asked for.
export const HouseholdSection = ({profile, onChange}: ProfileSectionProps) => {
  const {t} = useTranslation('translation');
  const [choosingDays, setChoosingDays] = useState(false);
  const showsDays = choosingDays || hasChosenDays(profile);

  const toggleDayChoice = () => {
    if (showsDays) {
      onChange(withAutomaticDays(profile));
    }
    setChoosingDays(!showsDays);
  };

  const renderMeal = (meal: PlanningMeal) => {
    const cookedPerWeek = cookedDays(meal).length;
    return (
      <Surface key={meal.mealType} style={styles.meal} elevation={1}>
        <CountStepper
          label={mealTypeLabel(t, meal.mealType)}
          value={`${cookedPerWeek}×`}
          decreaseLabel={t('screens.planning.fewer')}
          increaseLabel={t('screens.planning.more')}
          canDecrease={cookedPerWeek > 0}
          canIncrease={gapsPerWeek(meal) > 0}
          onDecrease={() => onChange(withCookedPerWeek(profile, meal.mealType, cookedPerWeek - 1))}
          onIncrease={() => onChange(withCookedPerWeek(profile, meal.mealType, cookedPerWeek + 1))} />
        {gapsPerWeek(meal) > 0 && <HintText>{t('screens.planning.gapsHint', {count: gapsPerWeek(meal)})}</HintText>}
        {DAY_GROUPS
            .filter((group) => cookedDays(meal).some((day) => group.days.includes(day)))
            .map((group) => (
              <View key={group.label} style={styles.effort}>
                <Text variant="labelMedium">{t(group.label)}</Text>
                <EffortChoice value={effortOf(meal, group.days)}
                  onChange={(effort) => onChange(withMealEffort(profile, meal.mealType, group.days, effort))} />
              </View>
            ))}
      </Surface>
    );
  };

  return (
    <>
      <ProfileCountStepper profile={profile} onChange={onChange} field="householdSize"
        label={t('screens.planning.householdSize')} />
      <ChoiceChips
        title={t('screens.planning.meals')}
        values={MEAL_TYPES}
        isChosen={(meal) => plannedMeal(profile, meal) !== undefined}
        label={(meal) => mealTypeLabel(t, meal)}
        onToggle={(meal) => onChange(withMealToggled(profile, meal))} />
      {canPlan(profile) ?
        <>
          {showsDays ? <DayScheduleEditor profile={profile} onChange={onChange} /> : profile.meals.map(renderMeal)}
          <Button mode="text" icon={showsDays ? 'auto-fix' : 'calendar-edit'} style={styles.inlineButton}
            onPress={toggleDayChoice}>
            {t(showsDays ? 'screens.planning.automaticDays' : 'screens.planning.chooseDays')}
          </Button>
        </> :
        <HintText>{t('screens.planning.noMeals')}</HintText>
      }
    </>
  );
};

const styles = StyleSheet.create({
  meal: {padding: 12, borderRadius: 12, gap: 8},
  effort: {gap: 4},
  inlineButton: {alignSelf: 'flex-start'},
});
