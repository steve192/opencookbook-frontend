import {TFunction} from 'i18next';
import {DayOfWeek, Effort, MealType, PlanningMeal, PlanningProfile} from '../dao/RestAPI';
import {toggledIn, typedNumber} from './choices';
import {WEEKEND, WORKDAYS, automaticDays, inWeekOrder} from './daysOfWeek';
import {macroStyleLabel} from './macroStyles';
import {inDayOrder, mealTypeLabel} from './mealTypes';
import {dietLabel} from './recipeDiet';

/**
 * The weekplan wizard's answers, as a value. Every change is a pure function returning a new
 * profile, the same split {@link ./recipeEdits} uses for the recipe editor.
 */

const DAYS_PER_WEEK = 7;
const DEFAULT_HOUSEHOLD_SIZE = 2;
const DEFAULT_COOLDOWN_WEEKS = 2;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

// Grams: the only unit the wizard asks in, and one the server always resolves
const PANTRY_UNIT = 'g';

/**
 * How often a meal is cooked when it is first added. Dinner is the meal most cooks cook; for
 * any other, twice a week lands on the weekend, which is where the time for it usually is.
 */
const COOKED_PER_WEEK_WHEN_ADDED: Record<MealType, number> = {
  BREAKFAST: 2,
  LUNCH: 2,
  DINNER: 5,
  SNACK: 2,
  DESSERT: 2,
};

// Quick on workdays, whatever there is time for at the weekend
const defaultEffort = (day: DayOfWeek): Effort => WORKDAYS.includes(day) ? 'SIMPLE' : 'ANY';

const daysLike = (day: DayOfWeek): DayOfWeek[] => WORKDAYS.includes(day) ? WORKDAYS : WEEKEND;

/**
 * @param {PlanningMeal} meal how a meal is planned
 * @return {DayOfWeek[]} the days it is cooked, Monday first
 */
export const cookedDays = (meal: PlanningMeal): DayOfWeek[] => inWeekOrder(Object.keys(meal.days) as DayOfWeek[]);

/**
 * @param {PlanningMeal} meal how a meal is planned
 * @param {DayOfWeek[]} days the days asked about
 * @return {Effort | undefined} the effort the meal has on all of those it is cooked on, or undefined where
 *   they differ or it is cooked on none of them
 */
export const effortOf = (meal: PlanningMeal, days: DayOfWeek[]): Effort | undefined => {
  const efforts = new Set(days.map((day) => meal.days[day]).filter((effort) => effort !== undefined));
  return efforts.size === 1 ? [...efforts][0] : undefined;
};

/**
 * A day the meal already had keeps its effort; a new one takes the effort of a day like it, so a
 * quick weekday lunch stays quick when it is cooked once more.
 *
 * @param {PlanningMeal} meal how the meal is planned
 * @param {DayOfWeek[]} days the days it is to be cooked
 * @return {PlanningMeal} the meal cooked on those days
 */
const onDays = (meal: PlanningMeal, days: DayOfWeek[]): PlanningMeal => ({
  ...meal,
  days: Object.fromEntries(days.map((day) =>
    [day, meal.days[day] ?? effortOf(meal, daysLike(day)) ?? defaultEffort(day)])),
});

const newMeal = (mealType: MealType): PlanningMeal =>
  onDays({mealType, days: {}}, automaticDays(COOKED_PER_WEEK_WHEN_ADDED[mealType]));

/**
 * @param {string} name what the profile is called
 * @return {PlanningProfile} the answers most cooks would give: two people, dinner on most days, lunch
 *   at the weekend, quick on workdays, and nothing repeated within two weeks
 */
export const newPlanningProfile = (name: string): PlanningProfile => ({
  name,
  householdSize: DEFAULT_HOUSEHOLD_SIZE,
  cooldownWeeks: DEFAULT_COOLDOWN_WEEKS,
  leftoversAllowed: true,
  spreadVariety: true,
  meals: [newMeal('LUNCH'), newMeal('DINNER')],
  pantry: [],
  avoidedIngredientIds: [],
});

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {MealType} mealType the meal
 * @return {PlanningMeal | undefined} how it is planned, or undefined when it is not planned at all
 */
export const plannedMeal = (profile: PlanningProfile, mealType: MealType): PlanningMeal | undefined =>
  profile.meals.find((meal) => meal.mealType === mealType);

/**
 * Plans a meal, or stops planning it. Meals stay in the order of a day.
 *
 * @param {PlanningProfile} profile the answers so far
 * @param {MealType} mealType the meal that was tapped
 * @return {PlanningProfile} the answers with it planned, or not
 */
export const withMealToggled = (profile: PlanningProfile, mealType: MealType): PlanningProfile => {
  const meals = plannedMeal(profile, mealType) ?
    profile.meals.filter((meal) => meal.mealType !== mealType) :
    [...profile.meals, newMeal(mealType)];
  meals.sort((left, right) => inDayOrder(left.mealType, right.mealType));
  return {...profile, meals};
};

const withMeal = (profile: PlanningProfile, mealType: MealType, change: (meal: PlanningMeal) => PlanningMeal):
    PlanningProfile => ({
  ...profile,
  meals: profile.meals.map((meal) => meal.mealType === mealType ? change(meal) : meal),
});

/**
 * Sets how often a meal is cooked, on the days {@link automaticDays} picks for that count.
 *
 * @param {PlanningProfile} profile the answers so far
 * @param {MealType} mealType the meal
 * @param {number} cookedPerWeek how often it is cooked; kept within 0 and 7
 * @return {PlanningProfile} the answers with that count
 */
export const withCookedPerWeek = (profile: PlanningProfile, mealType: MealType, cookedPerWeek: number): PlanningProfile =>
  withMeal(profile, mealType, (meal) => onDays(meal, automaticDays(clamp(cookedPerWeek, 0, DAYS_PER_WEEK))));

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {DayOfWeek} day the day
 * @param {MealType} mealType the meal that was tapped on it
 * @return {PlanningProfile} the answers with the meal cooked on that day, or no longer
 */
export const withCookedOnToggled = (profile: PlanningProfile, day: DayOfWeek, mealType: MealType): PlanningProfile =>
  withMeal(profile, mealType, (meal) => onDays(meal, inWeekOrder(toggledIn(cookedDays(meal), day))));

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {MealType} mealType the meal
 * @param {DayOfWeek[]} days the days to set it on; days it is not cooked stay as they are
 * @param {Effort} effort how much work it may be on them
 * @return {PlanningProfile} the answers with that effort
 */
export const withMealEffort = (profile: PlanningProfile, mealType: MealType, days: DayOfWeek[], effort: Effort):
    PlanningProfile => withMeal(profile, mealType, (meal) => ({
  ...meal,
  days: Object.fromEntries(cookedDays(meal).map((day) => [day, days.includes(day) ? effort : meal.days[day]])),
}));

/**
 * @param {PlanningProfile} profile the answers so far
 * @return {boolean} whether any meal is cooked on other days than its count alone would give
 */
export const hasChosenDays = (profile: PlanningProfile): boolean => profile.meals.some((meal) =>
  automaticDays(cookedDays(meal).length).join() !== cookedDays(meal).join());

/**
 * @param {PlanningProfile} profile the answers so far
 * @return {PlanningProfile} the answers with every meal back on the days its count gives
 */
export const withAutomaticDays = (profile: PlanningProfile): PlanningProfile => ({
  ...profile,
  meals: profile.meals.map((meal) => onDays(meal, automaticDays(cookedDays(meal).length))),
});

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {DayOfWeek} day the day
 * @return {PlanningMeal[]} the meals cooked on it, in the order of a day
 */
export const mealsOn = (profile: PlanningProfile, day: DayOfWeek): PlanningMeal[] =>
  profile.meals.filter((meal) => meal.days[day] !== undefined);

/**
 * @param {PlanningProfile} profile the answers so far
 * @return {number} how many meals a week are cooked, the most a meat limit can mean
 */
export const cookedMealsPerWeek = (profile: PlanningProfile): number =>
  profile.meals.reduce((sum, meal) => sum + cookedDays(meal).length, 0);

/**
 * @param {PlanningProfile} profile the answers so far
 * @return {number | null} the meat meals allowed a week, or null where the limit allows every meal
 */
export const meatLimit = (profile: PlanningProfile): number | null =>
  profile.meatMealsPerWeek != null && profile.meatMealsPerWeek < cookedMealsPerWeek(profile) ?
    profile.meatMealsPerWeek : null;

/**
 * One step on the meat stepper. Above one meal short of every meal the limit means nothing, so
 * that end of the scale is "no limit".
 *
 * @param {PlanningProfile} profile the answers so far
 * @param {number} step -1 for fewer meat meals, +1 for more
 * @return {PlanningProfile} the answers with the limit moved
 */
export const withMeatLimitStep = (profile: PlanningProfile, step: number): PlanningProfile => {
  const noLimit = cookedMealsPerWeek(profile);
  const next = clamp((meatLimit(profile) ?? noLimit) + step, 0, noLimit);
  return {...profile, meatMealsPerWeek: next >= noLimit ? null : next};
};

/**
 * An emptied field means no target.
 *
 * @param {PlanningProfile} profile the answers so far
 * @param {string} text the calories a day the cook typed
 * @return {PlanningProfile} the answers with that target set, or cleared
 */
export const withKcalPerDay = (profile: PlanningProfile, text: string): PlanningProfile =>
  ({...profile, kcalPerDay: typedNumber(text)});

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {MealType} mealType the meal
 * @param {string} text its calories per serving as typed; empty lets it share what the day leaves
 * @return {PlanningProfile} the answers with that target set, or cleared
 */
export const withMealKcal = (profile: PlanningProfile, mealType: MealType, text: string): PlanningProfile =>
  withMeal(profile, mealType, (meal) => ({...meal, targetKcal: typedNumber(text)}));

/**
 * @param {PlanningProfile} profile the answers so far
 * @return {PlanningProfile} the answers with every meal sharing the day evenly again
 */
export const withEvenKcal = (profile: PlanningProfile): PlanningProfile =>
  ({...profile, meals: profile.meals.map((meal) => ({...meal, targetKcal: null}))});

/**
 * @param {PlanningProfile} profile the answers so far
 * @return {boolean} whether any meal has a calorie target of its own
 */
export const hasMealKcal = (profile: PlanningProfile): boolean => profile.meals.some((meal) => meal.targetKcal != null);

/**
 * The same rule the server plans by: a meal's own target, or an even share of what the day leaves
 * after the meals that have one.
 *
 * @param {PlanningProfile} profile the answers so far
 * @param {PlanningMeal} meal one of its meals
 * @return {number | null} the calories per serving it is planned for, or null where nothing says
 */
export const kcalTargetOf = (profile: PlanningProfile, meal: PlanningMeal): number | null => {
  if (meal.targetKcal != null) {
    return meal.targetKcal;
  }
  const withoutOwn = profile.meals.filter((planned) => planned.targetKcal == null).length;
  if (profile.kcalPerDay == null || withoutOwn === 0) {
    return null;
  }
  const owned = profile.meals.reduce((sum, planned) => sum + (planned.targetKcal ?? 0), 0);
  return Math.max(0, profile.kcalPerDay - owned) / withoutOwn;
};

export type ProfileCount = 'householdSize' | 'cooldownWeeks';

/** The server's defaults and bounds for the counts set with a stepper. */
export const PROFILE_COUNTS: Record<ProfileCount, {fallback: number, min: number, max: number}> = {
  householdSize: {fallback: DEFAULT_HOUSEHOLD_SIZE, min: 1, max: 20},
  cooldownWeeks: {fallback: DEFAULT_COOLDOWN_WEEKS, min: 0, max: 12},
};

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {ProfileCount} field which count
 * @return {number} the count, or the server's default when none was given
 */
export const profileCount = (profile: PlanningProfile, field: ProfileCount): number =>
  profile[field] ?? PROFILE_COUNTS[field].fallback;

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {ProfileCount} field which count
 * @param {number} value the new count; kept within the server's bounds
 * @return {PlanningProfile} the answers with that count
 */
export const withProfileCount = (profile: PlanningProfile, field: ProfileCount, value: number): PlanningProfile =>
  ({...profile, [field]: clamp(value, PROFILE_COUNTS[field].min, PROFILE_COUNTS[field].max)});

export const withAvoidedToggled = (profile: PlanningProfile, ingredientId: number): PlanningProfile =>
  ({...profile, avoidedIngredientIds: toggledIn(profile.avoidedIngredientIds, ingredientId)});

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {number} ingredientId the ingredient that was tapped
 * @return {PlanningProfile} the answers with it in the pantry, or taken out
 */
export const withPantryToggled = (profile: PlanningProfile, ingredientId: number): PlanningProfile => {
  const pantry = profile.pantry ?? [];
  return {
    ...profile,
    pantry: pantry.some((item) => item.ingredientId === ingredientId) ?
      pantry.filter((item) => item.ingredientId !== ingredientId) :
      [...pantry, {ingredientId, amount: null, unit: PANTRY_UNIT}],
  };
};

/**
 * @param {PlanningProfile} profile the answers so far
 * @param {number} ingredientId the pantry item
 * @param {string} text the grams the cook typed; empty makes the item worth one recipe
 * @return {PlanningProfile} the answers with that amount
 */
export const withPantryAmount = (profile: PlanningProfile, ingredientId: number, text: string): PlanningProfile => ({
  ...profile,
  pantry: (profile.pantry ?? []).map((item) => item.ingredientId === ingredientId ?
    {...item, amount: typedNumber(text), unit: PANTRY_UNIT} :
    item),
});

/**
 * @param {PlanningMeal} meal how a meal is planned
 * @return {number} the days a week it is left to the cook
 */
export const gapsPerWeek = (meal: PlanningMeal): number => DAYS_PER_WEEK - cookedDays(meal).length;

/**
 * @param {PlanningProfile} profile the answers so far
 * @return {boolean} whether a week can be planned from them: at least one meal has to be
 */
export const canPlan = (profile: PlanningProfile): boolean => profile.meals.length > 0;

const joined = (parts: (string | undefined | false)[]): string =>
  parts.filter((part): part is string => !!part).join(' · ');

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {PlanningProfile} profile the answers
 * @return {string} who eats and which meals are cooked how often
 */
export const householdSummary = (t: TFunction, profile: PlanningProfile): string => joined([
  t('screens.planning.summaryPeople', {count: profileCount(profile, 'householdSize')}),
  ...profile.meals.map((meal) => t('screens.planning.summaryMeal', {
    meal: mealTypeLabel(t, meal.mealType),
    count: cookedDays(meal).length,
  })),
]);

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {PlanningProfile} profile the answers
 * @return {string} what may and may not be planned
 */
export const foodSummary = (t: TFunction, profile: PlanningProfile): string => {
  const avoided = profile.avoidedIngredientIds?.length ?? 0;
  return joined([
    dietLabel(t, profile.diet),
    meatLimit(profile) != null && t('screens.planning.summaryMeat', {count: meatLimit(profile)}),
    avoided > 0 && t('screens.planning.summaryAvoided', {count: avoided}),
  ]) || t('screens.planning.summaryNoRestrictions');
};

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {PlanningProfile} profile the answers
 * @return {string} the optional preferences in force
 */
export const extrasSummary = (t: TFunction, profile: PlanningProfile): string => {
  const cooldown = profileCount(profile, 'cooldownWeeks');
  return joined([
    profile.kcalPerDay != null && t('screens.planning.summaryKcal', {kcal: profile.kcalPerDay}),
    profile.kcalPerDay == null && hasMealKcal(profile) && t('screens.planning.summaryKcalPerMeal'),
    profile.macroStyle && profile.macroStyle !== 'BALANCED' && macroStyleLabel(t, profile.macroStyle),
    cooldown > 0 && t('screens.planning.summaryCooldown', {count: cooldown}),
    (profile.leftoversAllowed ?? true) && t('screens.planning.summaryLeftovers'),
    (profile.spreadVariety ?? true) && t('screens.planning.summaryVariety'),
    profile.includeHouseholdRecipes && t('screens.planning.summaryWithHouseholds'),
  ]);
};
