import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useKeepAwake} from 'expo-keep-awake';
import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Appbar, Button, Divider, Icon, ProgressBar, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {IngredientList} from '../components/IngredientList';
import {PreparationStepText} from '../components/PreparationStepText';
import {SectionTitle} from '../components/SectionTitle';
import {StepTimer} from '../components/StepTimer';
import {ViewPager} from '../components/ViewPager';
import {IngredientUse} from '../dao/RestAPI';
import {runningTimerCount} from '../helper/cookingTimers';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {findIngredientsWithoutStep, matchIngredientsInStep} from '../helper/ingredientMatching';
import {useCheckedIngredients} from '../helper/useCheckedIngredients';
import {findStepDurations} from '../helper/recipeDuration';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'GuidedCookingScreen'>;

/** Cooking happens at arm's length, so the smallest option is already fairly large. */
const TEXT_SIZES = [18, 22, 27];

export const GuidedCookingScreen = (props: Props) => {
  // A timer notification opens the step it was started from, so the screen does not always
  // begin at the beginning.
  const [currentStep, setCurrentStep] = useState<number>(() => Math.max(
      0,
      Math.min(props.route.params.initialStep ?? 0, props.route.params.recipe.preparationSteps.length - 1),
  ));
  const [textSizeIndex, setTextSizeIndex] = useState<number>(0);
  const [showOtherIngredients, setShowOtherIngredients] = useState(false);
  // Ticking off what has gone into the pot is at least as useful here as on the recipe page
  const ingredientChecklist = useCheckedIngredients();

  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const recipe = props.route.params.recipe;
  const steps = recipe.preparationSteps;
  const stepCount = steps.length;
  useKeepAwake();

  // Timers outlive this screen, so leaving is not a warning but a reminder: they are still
  // counting and will still announce themselves.
  const runningTimers = useAppSelector((state) => state.timers.timers);
  useEffect(() => props.navigation.addListener('beforeRemove', () => {
    const stillRunning = runningTimerCount(runningTimers, Date.now());
    if (stillRunning > 0) {
      SnackbarUtil.show({
        message: t('screens.guidedCooking.timersKeepRunning', {count: stillRunning}),
      });
    }
  }), [props.navigation, runningTimers, t]);

  // Never claimed by any step at all: either the matching missed it or the recipe simply
  // never writes it down ("salt to taste"). Both are the kind that gets forgotten, so they
  // are kept out in the open instead of being folded in with the ingredients that merely
  // belong to a different step.
  const orphanIndexes = useMemo(
      () => findIngredientsWithoutStep(steps, recipe.neededIngredients),
      [steps, recipe.neededIngredients],
  );

  useLayoutEffect(() => {
    props.navigation.setOptions({
      // The row of numbered bullets gave every step a fixed width in a row that did not
      // scroll, so a long recipe pushed the later steps off the screen. A count says the
      // same thing in constant space, and also says how much is left.
      title: t('screens.guidedCooking.stepProgress', {current: currentStep + 1, total: stepCount}),
      headerRight: () => (
        <Appbar.Action
          icon="format-size"
          color={theme.colors.onPrimary}
          accessibilityLabel={t('screens.guidedCooking.textSize')}
          onPress={() => setTextSizeIndex((index) => (index + 1) % TEXT_SIZES.length)} />
      ),
    });
  }, [props.navigation, currentStep, stepCount, theme, t]);

  const renderIngredientList = (indexes: number[], greyedOut = false) => (
    <IngredientList
      greyedOutStyle={greyedOut}
      ingredients={indexes.map((index) => recipe.neededIngredients[index])}
      ingredientIndexes={indexes}
      checkedIngredients={ingredientChecklist.checked}
      onIngredientToggle={ingredientChecklist.toggle}
      scaledServings={props.route.params.scaledServings}
      servings={recipe.servings} />
  );

  const renderStepPage = (step: string, stepIndex: number) => {
    // The same pass decides what is highlighted in the text and what is listed underneath,
    // so the two can no longer disagree - they used to be two different fuzzy searches.
    const {usedIngredientIndexes} = matchIngredientsInStep(step, recipe.neededIngredients);
    const otherIndexes = recipe.neededIngredients
        .map((unused: IngredientUse, index: number) => index)
        .filter((index) => !usedIngredientIndexes.includes(index) && !orphanIndexes.includes(index));
    const timers = findStepDurations(step);

    return (
      <ScrollView key={stepIndex} contentContainerStyle={[CentralStyles.contentContainer, styles.content]}>
        <PreparationStepText
          style={{fontSize: TEXT_SIZES[textSizeIndex], lineHeight: TEXT_SIZES[textSizeIndex] * 1.4}}
          value={step}
          ingredients={recipe.neededIngredients} />

        {/* Timers are identified by the recipe they belong to, so an unsaved recipe -
            which cooking mode is never reached from - simply offers none */}
        {recipe.id !== undefined && timers.map((duration) => (
          <StepTimer
            key={`${duration.seconds}-${duration.label}`}
            duration={duration}
            recipeId={recipe.id as number}
            recipeTitle={recipe.title}
            stepIndex={stepIndex} />
        ))}

        <Divider />

        <SectionTitle>{t('screens.guidedCooking.forThisStep')}</SectionTitle>
        {usedIngredientIndexes.length === 0 ?
          <Text style={{color: theme.colors.onSurfaceVariant}}>{t('screens.guidedCooking.noIngredientsForStep')}</Text> :
          renderIngredientList(usedIngredientIndexes)
        }

        {/* Always open: these belong to no step, so nothing else will bring them up */}
        {orphanIndexes.length > 0 &&
          <View style={[styles.orphans, {borderColor: theme.colors.outlineVariant}]}>
            <View style={styles.orphanHeader}>
              <Icon source="alert-circle-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <SectionTitle>{t('screens.guidedCooking.notInAnyStep')}</SectionTitle>
            </View>
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
              {t('screens.guidedCooking.notInAnyStepHint')}
            </Text>
            {renderIngredientList(orphanIndexes)}
          </View>
        }

        {/* These do have a step of their own, so folding them away loses nothing */}
        {otherIndexes.length > 0 &&
          <>
            <Button
              compact
              textColor={theme.colors.primaryText}
              icon={showOtherIngredients ? 'chevron-up' : 'chevron-down'}
              style={styles.disclosure}
              onPress={() => setShowOtherIngredients(!showOtherIngredients)}>
              {t('screens.guidedCooking.usedInOtherSteps', {number: otherIndexes.length})}
            </Button>
            {showOtherIngredients && renderIngredientList(otherIndexes, true)}
          </>
        }

        <View style={styles.keepAwakeNote}>
          <Icon source="lightbulb-on-outline" size={14} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
            {t('screens.guidedCooking.screenStaysOn')}
          </Text>
        </View>
      </ScrollView>
    );
  };

  const isLastStep = currentStep >= stepCount - 1;

  return (
    <Surface style={styles.screen}>
      {/* The app bar above is painted in the primary green, which is also what a Paper
          ProgressBar fills itself with by default, so the two ran together into a single
          green band. It now sits inset on the page rather than flush under the bar, in the
          darker on-surface tone, over a track that shows how much is left. */}
      <View style={styles.progressRow}>
        <ProgressBar
          progress={stepCount > 0 ? (currentStep + 1) / stepCount : 0}
          color={theme.colors.primaryText}
          style={[styles.progress, {backgroundColor: theme.colors.surfaceVariant}]} />
      </View>

      {/* Swiping between steps is how this is used with messy hands, so the steps are pages
          rather than one screen that redraws. Keeping every step mounted also means a timer
          started on one step keeps running while you read ahead. */}
      <ViewPager
        selectedIndex={currentStep}
        onIndexChange={setCurrentStep}>
        {steps.map(renderStepPage)}
      </ViewPager>

      <Divider />
      {/* Android draws edge to edge, so without the inset this sits under the system bar */}
      <View style={[styles.nav, {paddingBottom: insets.bottom + 10}]}>
        <Button
          mode="outlined"
          icon="chevron-left"
          disabled={currentStep === 0}
          onPress={() => setCurrentStep(currentStep - 1)}>
          {t('common.previous')}
        </Button>
        <Button
          mode="contained"
          icon={isLastStep ? 'check' : 'chevron-right'}
          contentStyle={styles.nextContent}
          onPress={() => isLastStep ? props.navigation.goBack() : setCurrentStep(currentStep + 1)}>
          {isLastStep ? t('screens.guidedCooking.finish') : t('common.next')}
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  progressRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  progress: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  disclosure: {
    alignSelf: 'flex-start',
  },
  orphans: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  orphanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keepAwakeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  nextContent: {
    flexDirection: 'row-reverse',
  },
});
