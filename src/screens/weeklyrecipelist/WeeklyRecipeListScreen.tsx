import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {Appbar, Button, IconButton, Surface, Text} from 'react-native-paper';
import XDate from 'xdate';
import {useSetWeekplanDayMutation} from '../../api/endpoints/weekplan';
import {Recipe} from '../../api/types/recipes';
import {WeekplanDay, WeekplanDayRecipeInfo} from '../../api/types/weekplan';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {printHtmlDocument} from '../../helper/printHtmlDocument';
import {
  formatDayAndMonth,
  formatWeekdayAndDate,
  formatWeekRange,
  isSameDay,
  plannableDays,
  weekOffsetLabel,
  toDayKey,
} from '../../helper/weekplan';
import {DAYS_OF_WEEK, dayOfWeekLabel} from '../../helper/daysOfWeek';
import {
  countMeals,
  isPlanOf,
  LeftoverSource,
  leftoverSources,
  withLeftoverOf,
  withLeftoversAdded,
  withMealMoved,
  withMealRemoved,
  withRecipeAdded,
  withSimpleMealAdded,
} from '../../helper/weekplanDay';
import {buildWeekplanPrintHtml} from '../../helper/weekplanPrint';
import {useWeekplanWeek} from '../../helper/useWeekplanWeek';
import {usePlanTarget} from '../../components/PlanTargetDialog';
import {useHouseholds} from '../households/useHouseholds';
import {useShoppingImport} from '../../helper/shopping/useShoppingImport';
import {setAppbarOptions} from '../../navigation/appbarOptions';
import {MainNavigationProps, OverviewNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import {useAppTheme} from '../../styles/CentralStyles';
import {RecipeSelectionPopup} from './RecipeSelectionPopup';
import {WeekplanDayCard} from './WeekplanDayCard';


type Props =
    CompositeScreenProps<
        BottomTabScreenProps<OverviewNavigationProps, 'WeeklyScreen'>,
        NativeStackScreenProps<MainNavigationProps, 'OverviewScreen'>
    >;

/**
 * Every meal of a day, across the plans it may be spread over.
 *
 * @param {WeekplanDay[]} dayPlans the plans that day appears on
 * @return {string[]} the meals, in the order they are planned
 */
const mealTitles = (dayPlans: WeekplanDay[]): string[] =>
  dayPlans.flatMap((plan) => plan.recipes.map((meal) => meal.title));

export const WeeklyRecipeListScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const online = useIsOnline();
  const [setWeekplanDay] = useSetWeekplanDayMutation();

  // Which week is on screen, relative to the week containing today. Negative
  // values are weeks in the past, which the plan simply could not reach before.
  const [weekOffset, setWeekOffset] = useState(0);

  const [recipeSelectionVisible, setRecipeSelectionVisible] = useState(false);
  const [selectedWeekplanDay, setSelectedWeekplanDay] = useState<WeekplanDay>();
  const {households} = useHouseholds();
  const planTarget = usePlanTarget(households);
  const shoppingImport = useShoppingImport();

  const {today, weekStart, days, plans, loadedDays, loading, reload} = useWeekplanWeek(weekOffset);
  const weekStartKey = toDayKey(weekStart);
  // Only what is still ahead can be planned; a week that is over gets no plan action at all
  const todayKey = toDayKey(today);
  const plannable = useMemo(() => plannableDays(weekStart, today), [weekStartKey, todayKey]);

  // One row per day, so nothing downstream has to keep two arrays in step
  const week = useMemo(
      () => days.map((date, index) => ({
        date: date,
        dayPlans: plans[index],
        weekdayName: dayOfWeekLabel(t, DAYS_OF_WEEK[index]),
      })),
      [days, plans, t],
  );

  const leftoverSourcesOf = (plan: WeekplanDay) => leftoverSources(loadedDays, plan);

  const weekTitle = useCallback(() => weekOffsetLabel(t, weekOffset, weekStart), [weekOffset, weekStartKey, t]);

  const printWeek = useCallback(() => {
    const html = buildWeekplanPrintHtml({
      title: weekTitle(),
      subtitle: formatWeekRange(weekStart),
      emptyLabel: t('screens.weekplan.noMealsPlanned'),
      days: week.map(({date, dayPlans, weekdayName}) => ({
        weekday: weekdayName,
        date: formatDayAndMonth(date),
        meals: mealTitles(dayPlans),
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
      setAppbarOptions(props.navigation.getParent(), {
        title: t('screens.weekplan.screenTitle'),
        // The recipe list leaves a back action here while it shows a group
        leading: undefined,
        actions: (
          <>
            {plannable.length > 0 && <Appbar.Action
              icon="creation"
              color={theme.colors.onPrimary}
              disabled={!online}
              accessibilityLabel={t('screens.planning.planWeek')}
              onPress={() => planWeek()} />}
            <Appbar.Action
              icon="cart-plus"
              color={theme.colors.onPrimary}
              disabled={!online}
              accessibilityLabel={t('screens.shopping.import.addWeek')}
              onPress={() => shopWeek()} />
            <Appbar.Action
              icon="printer-outline"
              color={theme.colors.onPrimary}
              accessibilityLabel={t('screens.weekplan.print')}
              onPress={printWeek} />
          </>
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
  }, [props.navigation, t, theme, reload, printWeek, plannable, weekOffset, households, shoppingImport.provider, online]);

  // Every change goes through the same path: build the new day, then persist it.
  const persist = (day: WeekplanDay) => setWeekplanDay(day).unwrap()
      .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));

  const openRecipeSelection = (day: WeekplanDay) => {
    setSelectedWeekplanDay(day);
    setRecipeSelectionVisible(true);
  };

  // One plan at a time: its servings and its list differ from another plan's.
  const shopWeek = () => planTarget.choose(t('screens.shopping.import.whichPlan'), (householdId) =>
    shoppingImport.start({kind: 'week', from: toDayKey(days[0]), to: toDayKey(days.at(-1)!), householdId}));

  const planWeek = () => planTarget.choose(t('screens.weekplan.whichPlanToGenerate'), (householdId) =>
    props.navigation.navigate('WeekplanWizardScreen', {weekOffset, householdId}));

  /**
   * Writing goes to one plan, so adding a meal asks which when there is a choice.
   *
   * @param {WeekplanDay[]} dayPlans every plan that day already has
   */
  const chooseTargetPlan = (dayPlans: WeekplanDay[]) => {
    planTarget.choose(t('screens.weekplan.whichPlanToAddTo'), (householdId) => openPlanOf(dayPlans, householdId));
  };

  const openPlanOf = (dayPlans: WeekplanDay[], householdId: string | undefined) => {
    const dayKey = dayPlans[0]?.day;
    if (!dayKey) {
      return;
    }
    const existing = dayPlans.find((plan) => isPlanOf(plan, householdId));
    openRecipeSelection(existing ?? {
      day: dayKey,
      recipes: [],
      householdId: householdId,
      householdName: households.find((household) => household.id === householdId)?.name,
    });
  };

  const addPickedRecipe = (recipe: Pick<Recipe, 'id' | 'title'>) => {
    if (selectedWeekplanDay) {
      void persist(withRecipeAdded(selectedWeekplanDay, recipe));
    }
    setRecipeSelectionVisible(false);
  };

  const addLeftovers = (source: LeftoverSource) => {
    if (selectedWeekplanDay) {
      void persist(withLeftoversAdded(selectedWeekplanDay, source));
    }
    setRecipeSelectionVisible(false);
  };

  const changeLeftover = (day: WeekplanDay, index: number, cookedOn: string | null) => {
    void persist(withLeftoverOf(day, index, cookedOn));
  };

  const addSpontaneousMeal = (title: string) => {
    if (selectedWeekplanDay) {
      void persist(withSimpleMealAdded(selectedWeekplanDay, title));
    }
    setRecipeSelectionVisible(false);
  };

  const removeMeal = (day: WeekplanDay, index: number) => {
    void persist(withMealRemoved(day, index));

    // Removing is a single tap now, so it has to be undoable
    SnackbarUtil.show({
      message: t('screens.weekplan.mealRemoved'),
      action: t('common.undo'),
      onAction: () => persist(day),
    });
  };

  const moveMeal = (day: WeekplanDay, fromIndex: number, toIndex: number) => {
    void persist(withMealMoved(day, fromIndex, toIndex));
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
            {formatWeekRange(weekStart)} · {t('screens.weekplan.mealsPlanned', {count: countMeals(plans.flat())})}
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
        {week.map(({date, dayPlans, weekdayName}) => (
          <WeekplanDayCard
            key={dayPlans[0].day}
            date={date}
            weekdayName={weekdayName}
            isToday={isSameDay(date, today)}
            isPast={date.diffDays(today) > 0}
            plans={dayPlans}
            editable={online}
            onAddPress={() => chooseTargetPlan(dayPlans)}
            onMealPress={openRecipe}
            onMealMove={moveMeal}
            onMealRemovePress={removeMeal}
            leftoverSourcesOf={leftoverSourcesOf}
            onLeftoverChange={changeLeftover} />
        ))}
      </ScrollView>

      {planTarget.dialog}
      {shoppingImport.dialog}

      <RecipeSelectionPopup
        visible={recipeSelectionVisible}
        dayLabel={selectedWeekplanDay ? formatWeekdayAndDate(new XDate(selectedWeekplanDay.day)) : ''}
        householdId={selectedWeekplanDay?.householdId}
        onClose={() => setRecipeSelectionVisible(false)}
        onRecipeSelected={addPickedRecipe}
        onSimpleRecipeSelected={addSpontaneousMeal}
        leftoverSources={selectedWeekplanDay ? leftoverSourcesOf(selectedWeekplanDay) : []}
        onLeftoversSelected={addLeftovers}
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
