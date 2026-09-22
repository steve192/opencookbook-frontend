import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, List, Surface, Switch, Text} from 'react-native-paper';
import XDate from 'xdate';
import {ChoiceChips} from '../../components/ChoiceChips';
import {IngredientChips} from '../../components/IngredientChips';
import {MealTypeCoverageWarning} from '../../components/MealTypeCoverageWarning';
import {NumberInput} from '../../components/NumberInput';
import {HintText, QuestionSection} from '../../components/QuestionSection';
import {ScreenFooter} from '../../components/ScreenFooter';
import {SectionTitle} from '../../components/SectionTitle';
import RestAPI, {Recipe, RecipeSuggestions, SuggestedRecipe} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {withToggled} from '../../helper/choices';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {MACRO_STYLES, macroStyleLabel} from '../../helper/macroStyles';
import {MEAL_TYPES, mealTypeLabel} from '../../helper/mealTypes';
import {RECIPE_DIETS, dietLabel} from '../../helper/recipeDiet';
import {
  TIME_LIMITS,
  answersSummary,
  emptyMessage,
  forNewDraw,
  hasAnswers,
  initialSuggestionRequest,
  modeHint,
  moreFilterCount,
  offersMode,
  poolSummary,
  withIngredientToggled,
  withMealTypeWanted,
  withMode,
  usesHouseholdRecipes,
  withHouseholdRecipes,
  withTargetKcal,
} from '../../helper/recipeSuggestion';
import {useOwnIngredients} from '../../helper/useOwnIngredients';
import {useHouseholds} from '../households/useHouseholds';
import {toDayKey} from '../../helper/weekplan';
import {emptyWeekplanDay, withRecipeAdded} from '../../helper/weekplanDay';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {updateSingleWeekplanDay} from '../../redux/features/weeklyRecipesSlice';
import {useAppDispatch} from '../../redux/hooks';
import CentralStyles from '../../styles/CentralStyles';
import {SuggestionResultCard} from './SuggestionResultCard';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeSuggestionScreen'>;

// Asks a few questions, then shows the answers in one line above the results; changing them goes back to the questions.
export const RecipeSuggestionScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const ingredients = useOwnIngredients();
  const {households} = useHouseholds();

  const [request, setRequest] = useState(() => initialSuggestionRequest(new XDate().getHours()));
  const [suggestions, setSuggestions] = useState<RecipeSuggestions>();
  const [asking, setAsking] = useState(true);
  const [searching, setSearching] = useState(false);
  const [addedRecipeIds, setAddedRecipeIds] = useState(new Set<number>());
  const scrollRef = useRef<ScrollView>(null);

  const search = async () => {
    const asked = forNewDraw(request);
    setRequest(asked);
    setSearching(true);
    try {
      setSuggestions(await RestAPI.suggestRecipes(asked));
      setAsking(false);
      scrollRef.current?.scrollTo({y: 0, animated: false});
    } catch (e) {
      SnackbarUtil.show({message: t(errorMessageKey(e, 'screens.suggestion.failed'))});
    } finally {
      setSearching(false);
    }
  };

  const addToToday = async (recipe: Recipe) => {
    const today = new XDate();
    const [planned] = await RestAPI.getWeekplanDays(today, today);
    await dispatch(updateSingleWeekplanDay(withRecipeAdded(planned ?? emptyWeekplanDay(toDayKey(today)), recipe)));
    setAddedRecipeIds((added) => new Set(added).add(recipe.id!));
  };

  const chosenIngredientNames = () => ingredients
      .filter((ingredient) => request.ingredientIds?.includes(ingredient.id))
      .map((ingredient) => ingredient.name);

  const renderQuestions = () => (
    <>
      <MealTypeCoverageWarning />
      <ChoiceChips
        title={t('screens.suggestion.meal')}
        values={MEAL_TYPES}
        isChosen={(meal) => request.mealTypes?.includes(meal) ?? false}
        label={(meal) => mealTypeLabel(t, meal)}
        onToggle={(meal) => setRequest(withMealTypeWanted(request, meal))} />
      <QuestionSection title={t('screens.suggestion.cookWith')} hint={t('screens.suggestion.cookWithHint')}>
        <IngredientChips
          ingredients={ingredients}
          chosenIds={request.ingredientIds ?? []}
          addLabel={t('screens.suggestion.addIngredient')}
          onToggle={(id) => setRequest(withIngredientToggled(request, id))} />
        {offersMode(request) &&
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text variant="bodyLarge">{t('screens.suggestion.modeMustContain')}</Text>
              <HintText>{modeHint(t, request.mode)}</HintText>
            </View>
            <Switch
              value={request.mode === 'MUST_CONTAIN'}
              onValueChange={(mustContain) => setRequest(withMode(request, mustContain ? 'MUST_CONTAIN' : 'ANY_RANKED'))} />
          </View>
        }
      </QuestionSection>
      <ChoiceChips
        title={t('screens.suggestion.time')}
        values={TIME_LIMITS}
        isChosen={(minutes) => request.maxTotalTimeMinutes === minutes}
        label={(minutes) => t('screens.suggestion.minutes', {minutes})}
        onToggle={(minutes) => setRequest(withToggled(request, 'maxTotalTimeMinutes', minutes))} />
      {households.length > 0 &&
        <QuestionSection title={t('screens.suggestion.cookbooks')}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text variant="bodyLarge">{t('screens.suggestion.includeHouseholds')}</Text>
              <HintText>
                {t('screens.suggestion.includeHouseholdsHint',
                    {names: households.map((household) => household.name).join(', ')})}
              </HintText>
            </View>
            <Switch
              value={usesHouseholdRecipes(request)}
              onValueChange={(include) => setRequest(withHouseholdRecipes(request, include))} />
          </View>
        </QuestionSection>
      }
      {renderMoreFilters()}
    </>
  );

  const renderMoreFilters = () => {
    const count = moreFilterCount(request);
    return (
      <List.Accordion
        title={count > 0 ? t('screens.suggestion.moreFiltersActive', {count}) : t('screens.suggestion.moreFilters')}
        left={(listProps) => <List.Icon {...listProps} icon="tune-variant" />}
        style={styles.accordion}>
        <View style={styles.accordionContent}>
          <ChoiceChips
            title={t('screens.suggestion.diet')}
            values={RECIPE_DIETS}
            isChosen={(diet) => request.diet === diet}
            label={(diet) => dietLabel(t, diet) ?? diet}
            onToggle={(diet) => setRequest(withToggled(request, 'diet', diet))} />
          <ChoiceChips
            title={t('screens.suggestion.macroStyle')}
            values={MACRO_STYLES}
            isChosen={(style) => request.macroStyle === style}
            label={(style) => macroStyleLabel(t, style)}
            onToggle={(style) => setRequest(withToggled(request, 'macroStyle', style))} />
          <NumberInput
            label={t('screens.suggestion.targetKcal')}
            value={request.targetKcalPerServing}
            onChangeText={(text) => setRequest(withTargetKcal(request, text))} />
        </View>
      </List.Accordion>
    );
  };

  const renderResults = (found: RecipeSuggestions) => (
    <>
      <Surface style={styles.summary} elevation={1}>
        <Text variant="bodyMedium" style={styles.summaryText}>{answersSummary(t, request, chosenIngredientNames())}</Text>
        <Button compact icon="pencil-outline" onPress={() => setAsking(true)}>{t('screens.suggestion.change')}</Button>
      </Surface>
      {found.results.length === 0 && found.nearMisses.length === 0 ?
        <QuestionSection title={t('screens.suggestion.emptyTitle')}>
          <Text variant="bodyMedium">{emptyMessage(t, found.poolStats)}</Text>
          <Button mode="outlined" style={styles.inlineButton} onPress={() => setAsking(true)}>
            {t('screens.suggestion.changeAnswers')}
          </Button>
        </QuestionSection> :
        <>
          <HintText>{poolSummary(t, found.poolStats)}</HintText>
          {found.results.map(renderCard)}
          {found.nearMisses.length > 0 &&
            <>
              {/* Kept apart so "must contain all" still means what it said */}
              <SectionTitle>{t('screens.suggestion.nearMissesTitle')}</SectionTitle>
              {found.nearMisses.map(renderCard)}
            </>
          }
        </>
      }
    </>
  );

  const renderCard = (suggestion: SuggestedRecipe) => {
    const recipeId = suggestion.recipe.id!;
    return (
      <SuggestionResultCard
        key={recipeId}
        suggestion={suggestion}
        added={addedRecipeIds.has(recipeId)}
        onOpen={() => props.navigation.navigate('RecipeScreen', {recipeId})}
        onAddToToday={() => addToToday(suggestion.recipe)} />
    );
  };

  const showingResults = !asking && suggestions !== undefined;
  const unaskedLabel = hasAnswers(request) ? 'screens.suggestion.search' : 'screens.suggestion.surpriseMe';
  const searchLabel = showingResults ? 'screens.suggestion.searchAgain' : unaskedLabel;

  return (
    <Surface style={styles.screen}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <View style={[CentralStyles.contentContainer, styles.content]}>
          {searching && <ActivityIndicator accessibilityLabel={t('screens.suggestion.searching')} />}
          {showingResults ? renderResults(suggestions) : renderQuestions()}
        </View>
      </ScrollView>
      <ScreenFooter>
        <Button mode="contained" icon={showingResults ? 'dice-multiple-outline' : 'chef-hat'} onPress={search}
          disabled={searching}>
          {t(searchLabel)}
        </Button>
      </ScreenFooter>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  scrollContent: {paddingBottom: 16},
  content: {gap: 20, paddingTop: 16},
  switchRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  switchText: {flex: 1},
  accordion: {paddingHorizontal: 0},
  accordionContent: {gap: 20, paddingBottom: 8},
  summary: {flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 8},
  summaryText: {flex: 1},
  inlineButton: {alignSelf: 'flex-start'},
});
