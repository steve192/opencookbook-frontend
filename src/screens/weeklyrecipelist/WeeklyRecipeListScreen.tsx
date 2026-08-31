import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {Appbar, Button, IconButton, Surface, Text} from 'react-native-paper';
import XDate from 'xdate';
import {Recipe, WeekplanDay, WeekplanDayRecipeInfo} from '../../dao/RestAPI';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {printHtmlDocument} from '../../helper/printHtmlDocument';
import {useOnlineGuard} from '../../helper/useOnlineGuard';
import {
  formatDayAndMonth,
  formatWeekdayAndDate,
  formatWeekRange,
  isSameDay,
  isoWeekNumber,
  toDayKey,
} from '../../helper/weekplan';
import {
  countMeals,
  withMealMoved,
  withMealRemoved,
  withRecipeAdded,
  withSimpleMealAdded,
} from '../../helper/weekplanDay';
import {buildWeekplanPrintHtml} from '../../helper/weekplanPrint';
import {useWeekplanWeek} from '../../helper/useWeekplanWeek';
import {MainNavigationProps, OverviewNavigationProps} from '../../navigation/NavigationRoutes';
import {updateSingleWeekplanDay} from '../../redux/features/weeklyRecipesSlice';
import {useAppDispatch} from '../../redux/hooks';
import {useAppTheme} from '../../styles/CentralStyles';
import {RecipeSelectionPopup} from './RecipeSelectionPopup';
import {WeekplanDayCard} from './WeekplanDayCard';


type Props =
    CompositeScreenProps<
        BottomTabScreenProps<OverviewNavigationProps, 'WeeklyScreen'>,
        NativeStackScreenProps<MainNavigationProps, 'OverviewScreen'>
    >;

const WEEKDAY_KEYS = [
  'weekdays.monday',
  'weekdays.tuesday',
  'weekdays.wednesday',
  'weekdays.thursday',
  'weekdays.friday',
  'weekdays.saturday',
  'weekdays.sunday',
] as const;

export const WeeklyRecipeListScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const requireOnline = useOnlineGuard();

  // Which week is on screen, relative to the week containing today. Negative
  // values are weeks in the past, which the plan simply could not reach before.
  const [weekOffset, setWeekOffset] = useState(0);

  const [recipeSelectionVisible, setRecipeSelectionVisible] = useState(false);
  const [selectedWeekplanDay, setSelectedWeekplanDay] = useState<WeekplanDay>();

  const {today, weekStart, days, plans, loading, reload} = useWeekplanWeek(weekOffset);
  const weekStartKey = toDayKey(weekStart);

  // One row per day, so nothing downstream has to keep two arrays in step
  const week = useMemo(
      () => days.map((date, index) => ({
        date: date,
        plan: plans[index],
        weekdayName: t(WEEKDAY_KEYS[index]),
      })),
      [days, plans, t],
  );

  const weekTitle = useCallback(() => {
    if (weekOffset === 0) return t('screens.weekplan.thisWeek');
    if (weekOffset === 1) return t('screens.weekplan.nextWeek');
    if (weekOffset === -1) return t('screens.weekplan.lastWeek');
    return t('screens.weekplan.weekNumber', {number: isoWeekNumber(weekStart)});
  }, [weekOffset, weekStartKey, t]);

  const printWeek = useCallback(() => {
    const html = buildWeekplanPrintHtml({
      title: weekTitle(),
      subtitle: formatWeekRange(weekStart),
      emptyLabel: t('screens.weekplan.noMealsPlanned'),
      days: week.map(({date, plan, weekdayName}) => ({
        weekday: weekdayName,
        date: formatDayAndMonth(date),
        meals: plan.recipes.map((meal) => meal.title),
      })),
    });

    printHtmlDocument(html).catch((error: Error) => {
      // Dismissing the system print dialog rejects as well, and that is not a
      // failure worth interrupting the user for.
      if (/cancel/i.test(error.message)) {
        return;
      }
      SnackbarUtil.show({message: t('screens.weekplan.printFailed')});
    });
  }, [week, weekStartKey, weekTitle, t]);

  useEffect(() => {
    const applyHeaderOptions = () => {
      // Only the focused tab may touch the header it shares with the others
      if (!props.navigation.isFocused()) {
        return;
      }
      props.navigation.getParent()?.setOptions({
        title: t('screens.weekplan.screenTitle'),
        // The recipe list leaves a back action here while it shows a group
        headerLeft: undefined,
        headerRight: () => (
          <Appbar.Action
            icon="printer-outline"
            color={theme.colors.onPrimary}
            accessibilityLabel={t('screens.weekplan.print')}
            onPress={printWeek} />
        ),
      });
    };

    applyHeaderOptions();
    return props.navigation.addListener('focus', () => {
      applyHeaderOptions();
      // The plan can change elsewhere (another device, another session), and the
      // old screen only ever loaded once on mount.
      reload();
    });
  }, [props.navigation, t, theme, reload, printWeek]);

  // Every change goes through the same path: build the new day, then persist it.
  const persist = (day: WeekplanDay) => dispatch(updateSingleWeekplanDay(day));

  const openRecipeSelection = (day: WeekplanDay) => {
    if (!requireOnline()) {
      return;
    }
    setSelectedWeekplanDay(day);
    setRecipeSelectionVisible(true);
  };

  const addPickedRecipe = (recipe: Recipe) => {
    selectedWeekplanDay && persist(withRecipeAdded(selectedWeekplanDay, recipe));
    setRecipeSelectionVisible(false);
  };

  const addSpontaneousMeal = (title: string) => {
    selectedWeekplanDay && persist(withSimpleMealAdded(selectedWeekplanDay, title));
    setRecipeSelectionVisible(false);
  };

  const removeMeal = (day: WeekplanDay, index: number) => {
    if (!requireOnline()) {
      return;
    }
    persist(withMealRemoved(day, index));

    // Removing is a single tap now, so it has to be undoable
    SnackbarUtil.show({
      message: t('screens.weekplan.mealRemoved'),
      button1: t('common.undo'),
      button1Callback: () => persist(day),
    });
  };

  const moveMeal = (day: WeekplanDay, fromIndex: number, toIndex: number) => {
    if (!requireOnline()) {
      return;
    }
    persist(withMealMoved(day, fromIndex, toIndex));
  };

  const openRecipe = (meal: WeekplanDayRecipeInfo) => {
    typeof meal.id === 'number' && props.navigation.navigate('RecipeScreen', {recipeId: meal.id});
  };

  return (
    <Surface style={styles.screen}>
      {/* One week at a time with arrows in both directions, instead of the four
          hardcoded weeks from the current one that could only look forwards. */}
      <Surface elevation={2} style={styles.weekBar}>
        <IconButton
          icon="chevron-left"
          accessibilityLabel={t('screens.weekplan.previousWeek')}
          onPress={() => setWeekOffset(weekOffset - 1)} />
        <View style={styles.weekLabel}>
          <Text variant="titleMedium" style={styles.weekTitle}>{weekTitle()}</Text>
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
            {formatWeekRange(weekStart)} · {t('screens.weekplan.mealsPlanned', {count: countMeals(plans)})}
          </Text>
        </View>
        <IconButton
          icon="chevron-right"
          accessibilityLabel={t('screens.weekplan.nextWeek')}
          onPress={() => setWeekOffset(weekOffset + 1)} />
      </Surface>

      {weekOffset !== 0 &&
        <Button
          icon="calendar-today"
          compact
          textColor={theme.colors.primaryText}
          style={styles.backToTodayButton}
          onPress={() => setWeekOffset(0)}>
          {t('screens.weekplan.backToThisWeek')}
        </Button>
      }

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
        {week.map(({date, plan, weekdayName}) => (
          <WeekplanDayCard
            key={plan.day}
            date={date}
            weekdayName={weekdayName}
            isToday={isSameDay(date, today)}
            isPast={date.diffDays(today) > 0}
            meals={plan.recipes}
            onAddPress={() => openRecipeSelection(plan)}
            onMealPress={openRecipe}
            onMealMove={(from, to) => moveMeal(plan, from, to)}
            onMealRemovePress={(mealIndex) => removeMeal(plan, mealIndex)} />
        ))}
      </ScrollView>

      <RecipeSelectionPopup
        visible={recipeSelectionVisible}
        dayLabel={selectedWeekplanDay ? formatWeekdayAndDate(new XDate(selectedWeekplanDay.day)) : ''}
        onClose={() => setRecipeSelectionVisible(false)}
        onRecipeSelected={addPickedRecipe}
        onSimpleRecipeSelected={addSpontaneousMeal}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  weekBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  weekLabel: {
    flex: 1,
    alignItems: 'center',
  },
  weekTitle: {
    fontWeight: 'bold',
  },
  backToTodayButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  list: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 12,
    paddingBottom: 24,
  },
});
