import {TFunction} from 'i18next';
import {
  MealType,
  RecipeSuggestionRequest,
  SuggestionMatchMode,
  SuggestionPoolStats,
} from '../dao/RestAPI';
import {toggledIn, typedNumber} from './choices';
import {macroStyleLabel} from './macroStyles';
import {mealTypeAt, mealTypeLabel, toggledMealType} from './mealTypes';
import {dietLabel} from './recipeDiet';

/** The suggestion wizard's answers as a value; every change returns a new request, like {@link ./recipeEdits}. */

/**
 * @return {RecipeSuggestionRequest} answers to nothing, which is a valid "surprise me"
 */
export const emptySuggestionRequest = (): RecipeSuggestionRequest => ({
  mode: 'ANY_RANKED',
  ingredientIds: [],
  mealTypes: [],
});

/**
 * @param {RecipeSuggestionRequest} request the answers so far
 * @return {boolean} whether anything has been narrowed at all
 */
export const hasAnswers = (request: RecipeSuggestionRequest): boolean =>
  (request.ingredientIds?.length ?? 0) > 0 ||
  (request.mealTypes?.length ?? 0) > 0 ||
  request.diet != null ||
  request.maxTotalTimeMinutes != null ||
  request.targetKcalPerServing != null ||
  (request.macroStyle != null && request.macroStyle !== 'BALANCED');

/**
 * @param {RecipeSuggestionRequest} request the answers so far
 * @param {SuggestionMatchMode} mode how the named ingredients are meant
 * @return {RecipeSuggestionRequest} the answers with that mode
 */
export const withMode = (request: RecipeSuggestionRequest, mode: SuggestionMatchMode): RecipeSuggestionRequest =>
  ({...request, mode});

/**
 * @param {RecipeSuggestionRequest} request the answers so far
 * @param {number} ingredientId the ingredient that was tapped
 * @return {RecipeSuggestionRequest} the answers with it added, or removed
 */
export const withIngredientToggled = (
    request: RecipeSuggestionRequest,
    ingredientId: number,
): RecipeSuggestionRequest => ({...request, ingredientIds: toggledIn(request.ingredientIds, ingredientId)});

/**
 * @param {RecipeSuggestionRequest} request the answers so far
 * @param {MealType} mealType the meal that was tapped
 * @return {RecipeSuggestionRequest} the answers with it added, or removed
 */
export const withMealTypeWanted = (
    request: RecipeSuggestionRequest,
    mealType: MealType,
): RecipeSuggestionRequest => ({...request, mealTypes: toggledMealType(request.mealTypes, mealType)});

/** The time limits offered as one tap each; a cook rarely means 37 minutes. */
export const TIME_LIMITS = [20, 30, 45, 60];

/**
 * @param {RecipeSuggestionRequest} request the answers so far
 * @param {string} text the calories the user typed
 * @return {RecipeSuggestionRequest} the answers with that target set, or cleared
 */
export const withTargetKcal = (request: RecipeSuggestionRequest, text: string): RecipeSuggestionRequest =>
  ({...request, targetKcalPerServing: typedNumber(text)});

/**
 * @param {number} hour the current hour
 * @return {RecipeSuggestionRequest} a request for the meal that hour most likely means
 */
export const initialSuggestionRequest = (hour: number): RecipeSuggestionRequest =>
  withMealTypeWanted(emptySuggestionRequest(), mealTypeAt(hour));

/**
 * @param {RecipeSuggestionRequest} request the answers so far
 * @return {number} how many of the filters kept out of sight are set
 */
export const moreFilterCount = (request: RecipeSuggestionRequest): number => [
  request.diet != null,
  request.targetKcalPerServing != null,
  request.macroStyle != null && request.macroStyle !== 'BALANCED',
].filter(Boolean).length;

/**
 * @param {RecipeSuggestionRequest} request the answers so far
 * @return {boolean} whether "must contain all" means anything: with one ingredient both modes agree
 */
export const offersMode = (request: RecipeSuggestionRequest): boolean => (request.ingredientIds?.length ?? 0) > 1;

/**
 * Asking again is a deliberate new draw, so the seed that ordered the last set is dropped
 * rather than reused.
 *
 * @param {RecipeSuggestionRequest} request the answers so far
 * @return {RecipeSuggestionRequest} the same answers, to be ordered afresh
 */
export const forNewDraw = (request: RecipeSuggestionRequest): RecipeSuggestionRequest =>
  ({...request, seed: null});

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {SuggestionMatchMode} [mode] how the named ingredients are meant
 * @return {string} the sentence explaining what that mode will do
 */
export const modeHint = (t: TFunction, mode?: SuggestionMatchMode): string =>
  t(mode === 'MUST_CONTAIN' ? 'screens.suggestion.modeMustContainHint' : 'screens.suggestion.modeAnyRankedHint');

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {SuggestionPoolStats} poolStats how far the cookbook was narrowed
 * @return {string} how much of the cookbook matched
 */
export const poolSummary = (t: TFunction, poolStats: SuggestionPoolStats): string =>
  t('screens.suggestion.poolSummary', {...poolStats});

/**
 * Which answer emptied the list - the only thing that makes an empty result actionable.
 *
 * @param {TFunction} t the translation function of the calling screen
 * @param {SuggestionPoolStats} poolStats how far the cookbook was narrowed
 * @return {string} what to tell the cook
 */
export const emptyMessage = (t: TFunction, poolStats: SuggestionPoolStats): string => {
  if (poolStats.owned === 0) {
    return t('screens.suggestion.emptyNoRecipes');
  }
  const key = poolStats.afterFilters === 0 ?
    'screens.suggestion.emptyFiltered' :
    'screens.suggestion.emptyIngredients';
  return t(key, {...poolStats});
};

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {RecipeSuggestionRequest} request what was asked
 * @param {string[]} ingredientNames the names of the wanted ingredients
 * @return {string} the answers in one line, to show above the results
 */
export const answersSummary = (t: TFunction, request: RecipeSuggestionRequest, ingredientNames: string[]): string => {
  const parts = [
    ...(request.mealTypes ?? []).map((mealType) => mealTypeLabel(t, mealType)),
    ...ingredientNames,
    request.maxTotalTimeMinutes != null ? t('screens.suggestion.summaryTime', {minutes: request.maxTotalTimeMinutes}) : undefined,
    dietLabel(t, request.diet),
    request.targetKcalPerServing != null ? t('screens.suggestion.summaryKcal', {kcal: request.targetKcalPerServing}) : undefined,
    request.macroStyle && request.macroStyle !== 'BALANCED' ? macroStyleLabel(t, request.macroStyle) : undefined,
  ].filter((part): part is string => !!part);
  return parts.length > 0 ? parts.join(' · ') : t('screens.suggestion.summaryAnything');
};
