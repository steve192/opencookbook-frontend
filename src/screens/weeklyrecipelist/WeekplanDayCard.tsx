import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Icon, Surface, Text, TouchableRipple} from 'react-native-paper';
import XDate from 'xdate';
import {WeekplanDayRecipeInfo} from '../../dao/RestAPI';
import {formatMonth} from '../../helper/weekplan';
import {useAppTheme} from '../../styles/CentralStyles';
import {WeekplanMealRow} from './WeekplanMealRow';

interface Props {
  date: XDate;
  weekdayName: string;
  isToday: boolean;
  isPast: boolean;
  meals: WeekplanDayRecipeInfo[];
  onAddPress: () => void;
  onMealPress: (meal: WeekplanDayRecipeInfo) => void;
  onMealRemovePress: (index: number) => void;
  onMealMove: (fromIndex: number, toIndex: number) => void;
}

// A single day of the week, as one card: the date, everything planned for it and
// one obvious way to add more.
export const WeekplanDayCard = (props: Props) => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');

  const monthLabel = formatMonth(props.date);
  const summary = props.meals.length > 0 ?
    t('screens.weekplan.mealsPlanned', {count: props.meals.length}) :
    t('screens.weekplan.noMealsPlanned');

  return (
    <Surface
      elevation={1}
      style={[
        styles.card,
        {borderColor: props.isToday ? theme.colors.primary : theme.colors.outlineVariant},
        props.isToday && styles.todayCard,
        // Days that are over stay reachable but step back visually
        props.isPast && styles.pastCard,
      ]}>
      <View style={styles.header}>
        <View
          style={[
            styles.dateBubble,
            {backgroundColor: props.isToday ? theme.colors.primary : theme.colors.surfaceVariant},
          ]}>
          <Text
            style={[
              styles.dateBubbleText,
              {color: props.isToday ? theme.colors.onPrimary : theme.colors.onSurfaceVariant},
            ]}>
            {props.date.getDate()}
          </Text>
        </View>
        <View style={styles.headerTexts}>
          <Text variant="titleSmall" style={styles.weekdayName}>{props.weekdayName}</Text>
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
            {monthLabel} · {summary}
          </Text>
        </View>
        {props.isToday &&
          <View style={[styles.todayPill, {backgroundColor: theme.colors.primary}]}>
            <Text style={[styles.todayPillText, {color: theme.colors.onPrimary}]}>
              {t('screens.weekplan.today')}
            </Text>
          </View>
        }
      </View>

      {props.meals.map((meal, index) => (
        <WeekplanMealRow
          key={`${meal.type}-${meal.id}-${index}`}
          title={meal.title}
          imageUuid={meal.titleImageUuid}
          reorderable={props.meals.length > 1}
          onPress={meal.type === 'NORMAL_RECIPE' ? () => props.onMealPress(meal) : undefined}
          onMoveUpPress={index > 0 ? () => props.onMealMove(index, index - 1) : undefined}
          onMoveDownPress={index < props.meals.length - 1 ? () => props.onMealMove(index, index + 1) : undefined}
          onRemovePress={() => props.onMealRemovePress(index)} />
      ))}

      <TouchableRipple style={styles.addRow} onPress={props.onAddPress}>
        <View style={styles.addRowContent}>
          <Icon source="plus" size={18} color={theme.colors.primaryText} />
          <Text style={{color: theme.colors.primaryText, fontWeight: '600'}}>
            {t('screens.weekplan.addMeal')}
          </Text>
        </View>
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 12,
  },
  todayCard: {
    borderWidth: 2,
  },
  pastCard: {
    opacity: 0.65,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  dateBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBubbleText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerTexts: {
    flex: 1,
  },
  weekdayName: {
    fontWeight: 'bold',
  },
  todayPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  addRow: {
    borderRadius: 10,
    marginTop: 4,
  },
  addRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
});
