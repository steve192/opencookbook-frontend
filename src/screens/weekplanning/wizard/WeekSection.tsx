import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import XDate from 'xdate';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {IngredientChips} from '../../../components/IngredientChips';
import {NumberInput} from '../../../components/NumberInput';
import {QuestionSection} from '../../../components/QuestionSection';
import {OwnIngredient} from '../../../helper/ownIngredients';
import {withPantryAmount, withPantryToggled} from '../../../helper/planningProfile';
import {PlanPeriod} from '../../../helper/usePlanPeriod';
import {formatShortWeekday, formatWeekRange, toDayKey, weekOffsetLabel} from '../../../helper/weekplan';
import {ProfileSectionProps} from './ProfileSectionProps';

interface Props extends ProfileSectionProps {
  period: PlanPeriod;
  ingredients: OwnIngredient[];
}

// What is particular to the week being planned: which week, the days away, and what to use up.
export const WeekSection = ({profile, onChange, period, ingredients}: Props) => {
  const {t} = useTranslation('translation');
  const pantry = profile.pantry ?? [];
  return (
    <>
      <ChoiceChips
        title={t('screens.planning.whichWeek')}
        hint={formatWeekRange(period.weekStart)}
        values={period.weekOffsets}
        isChosen={(offset) => offset === period.weekOffset}
        label={(offset) => weekOffsetLabel(t, offset, period.weekStartOf(offset))}
        onToggle={period.chooseWeek} />
      <ChoiceChips
        title={t('screens.planning.awayDays')}
        values={period.days.map(toDayKey)}
        isChosen={(day) => period.awayDays.includes(day)}
        label={(day) => formatShortWeekday(new XDate(day))}
        onToggle={period.toggleAwayDay} />
      <QuestionSection title={t('screens.planning.pantry')} hint={t('screens.planning.pantryHint')}>
        <IngredientChips
          ingredients={ingredients}
          chosenIds={pantry.map((item) => item.ingredientId)}
          addLabel={t('screens.planning.addIngredient')}
          onToggle={(id) => onChange(withPantryToggled(profile, id))} />
        {pantry.map((item) => (
          <View key={item.ingredientId} style={styles.pantryRow}>
            <Text style={styles.pantryName} numberOfLines={1}>
              {ingredients.find((ingredient) => ingredient.id === item.ingredientId)?.name}
            </Text>
            <NumberInput label={t('screens.planning.pantryGrams')} value={item.amount}
              onChangeText={(text) => onChange(withPantryAmount(profile, item.ingredientId, text))} />
          </View>
        ))}
      </QuestionSection>
    </>
  );
};

const styles = StyleSheet.create({
  pantryRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  pantryName: {flex: 1},
});
