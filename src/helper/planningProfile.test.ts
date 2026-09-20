import {TFunction} from 'i18next';
import {describe, expect, it} from 'vitest';
import {withToggled} from './choices';
import {PlanningMeal, PlanningProfile} from '../dao/RestAPI';
import {
  canPlan,
  cookedDays,
  effortOf,
  extrasSummary,
  foodSummary,
  householdSummary,
  profileCount,
  newPlanningProfile,
  plannedMeal,
  withCookedPerWeek,
  withMealToggled,
  withPantryAmount,
  withPantryToggled,
  withProfileCount,
  withAutomaticDays,
  withCookedOnToggled,
  hasChosenDays,
  mealsOn,
  meatLimit,
  withMealEffort,
  withKcalPerDay,
  hasMealKcal,
  kcalTargetOf,
  withEvenKcal,
  withMealKcal,
  withMeatLimitStep,
} from './planningProfile';

const days = (profile: PlanningProfile, mealType: PlanningMeal['mealType']) => cookedDays(plannedMeal(profile, mealType)!);
const meal = (profile: PlanningProfile, mealType: PlanningMeal['mealType']) => plannedMeal(profile, mealType)!;

describe('newPlanningProfile', () => {
  it('starts from what most cooks would answer', () => {
    const profile = newPlanningProfile('Normale Woche');

    expect(profile.householdSize).toBe(2);
    expect(days(profile, 'DINNER')).toHaveLength(5);
    expect(days(profile, 'LUNCH')).toEqual(['SATURDAY', 'SUNDAY']);
    expect(effortOf(meal(profile, 'DINNER'), ['MONDAY', 'FRIDAY'])).toBe('SIMPLE');
    expect(effortOf(meal(profile, 'DINNER'), ['SATURDAY', 'SUNDAY'])).toBe('ANY');
    expect(plannedMeal(profile, 'BREAKFAST')).toBeUndefined();
    expect(canPlan(profile)).toBe(true);
  });
});

describe('planning a meal', () => {
  it('adds a meal in the order of a day, and removes it again', () => {
    const withBreakfast = withMealToggled(newPlanningProfile('x'), 'BREAKFAST');
    expect(withBreakfast.meals.map((meal) => meal.mealType)).toEqual(['BREAKFAST', 'LUNCH', 'DINNER']);

    expect(plannedMeal(withMealToggled(withBreakfast, 'BREAKFAST'), 'BREAKFAST')).toBeUndefined();
  });

  it('cannot plan a week without any meal', () => {
    const none = withMealToggled(withMealToggled(newPlanningProfile('x'), 'LUNCH'), 'DINNER');
    expect(canPlan(none)).toBe(false);
  });

  it('keeps how often a meal is cooked within a week', () => {
    const profile = newPlanningProfile('x');
    expect(days(withCookedPerWeek(profile, 'DINNER', 9), 'DINNER')).toHaveLength(7);
    expect(days(withCookedPerWeek(profile, 'DINNER', -1), 'DINNER')).toEqual([]);
  });
});

describe('choosing the days', () => {
  it('cooks a meal on a day, or stops cooking it there', () => {
    const mondayLunch = withCookedOnToggled(newPlanningProfile('x'), 'MONDAY', 'LUNCH');

    const mealTypesOn = (profile: PlanningProfile) => mealsOn(profile, 'MONDAY').map((cooked) => cooked.mealType);

    expect(mealTypesOn(mondayLunch)).toEqual(['LUNCH', 'DINNER']);
    expect(days(mondayLunch, 'LUNCH')).toEqual(['MONDAY', 'SATURDAY', 'SUNDAY']);
    expect(mealTypesOn(withCookedOnToggled(mondayLunch, 'MONDAY', 'LUNCH'))).toEqual(['DINNER']);
  });

  // Chosen days are what shows the day by day view without asking again
  it('notices days that the count alone would not give, and puts them back', () => {
    const chosen = withCookedOnToggled(newPlanningProfile('x'), 'MONDAY', 'LUNCH');

    expect(hasChosenDays(newPlanningProfile('x'))).toBe(false);
    expect(hasChosenDays(chosen)).toBe(true);
    expect(days(withAutomaticDays(chosen), 'LUNCH')).toEqual(['WEDNESDAY', 'SATURDAY', 'SUNDAY']);
  });
});

describe('effort by meal and day', () => {
  // Lunch quick and dinner a proper dish, on the same day
  it('sets a meal\'s effort without touching the other meals', () => {
    const elaborateDinners = withMealEffort(newPlanningProfile('x'), 'DINNER', ['MONDAY'], 'ELABORATE');

    expect(effortOf(meal(elaborateDinners, 'DINNER'), ['MONDAY'])).toBe('ELABORATE');
    expect(effortOf(meal(elaborateDinners, 'DINNER'), ['MONDAY', 'WEDNESDAY'])).toBeUndefined();
    expect(effortOf(meal(elaborateDinners, 'LUNCH'), ['SATURDAY'])).toBe('ANY');
  });

  it('only sets it on days the meal is cooked', () => {
    const lunch = meal(withMealEffort(newPlanningProfile('x'), 'LUNCH', ['MONDAY', 'SUNDAY'], 'SIMPLE'), 'LUNCH');

    expect(lunch.days).toEqual({SATURDAY: 'ANY', SUNDAY: 'SIMPLE'});
  });

  // A quick weekday dinner stays quick when it is cooked on one more weekday
  it('gives a new day the effort of a day like it', () => {
    const quick = withMealEffort(newPlanningProfile('x'), 'DINNER', ['MONDAY', 'WEDNESDAY', 'FRIDAY'], 'ELABORATE');

    expect(meal(withCookedOnToggled(quick, 'TUESDAY', 'DINNER'), 'DINNER').days.TUESDAY).toBe('ELABORATE');
    expect(meal(withCookedOnToggled(newPlanningProfile('x'), 'MONDAY', 'LUNCH'), 'LUNCH').days.MONDAY).toBe('SIMPLE');
  });
});

describe('the meat limit', () => {
  // Lunch twice and dinner five times: a limit of seven or more allows every meal
  it('counts down from no limit and back up to it', () => {
    const profile = newPlanningProfile('x');
    const six = withMeatLimitStep(profile, -1);

    expect(meatLimit(profile)).toBeNull();
    expect(meatLimit(six)).toBe(6);
    expect(meatLimit(withMeatLimitStep(six, 1))).toBeNull();
    expect(meatLimit(withMeatLimitStep({...profile, meatMealsPerWeek: 0}, -1))).toBe(0);
  });

  it('treats a limit no smaller than the meals cooked as no limit', () => {
    expect(meatLimit({...newPlanningProfile('x'), meatMealsPerWeek: 9})).toBeNull();
  });
});

describe('answering for the week', () => {
  it('clears the diet when the chosen one is tapped again', () => {
    const vegetarian = withToggled(newPlanningProfile('x'), 'diet', 'VEGETARIAN');
    expect(vegetarian.diet).toBe('VEGETARIAN');
    expect(withToggled(vegetarian, 'diet', 'VEGETARIAN').diet).toBeNull();
  });

  it('clears the calorie target when the field is emptied', () => {
    expect(withKcalPerDay(newPlanningProfile('x'), '').kcalPerDay).toBeNull();
  });
});

describe('the pantry', () => {
  it('adds an item worth one recipe, and weighs it once an amount is typed', () => {
    const added = withPantryToggled(newPlanningProfile('x'), 7);
    expect(added.pantry).toEqual([{ingredientId: 7, amount: null, unit: 'g'}]);

    expect(withPantryAmount(added, 7, '500').pantry).toEqual([{ingredientId: 7, amount: 500, unit: 'g'}]);
    expect(withPantryToggled(added, 7).pantry).toEqual([]);
  });
});

describe('counts set with a stepper', () => {
  it('stays within the server\'s bounds', () => {
    const profile = newPlanningProfile('x');

    expect(withProfileCount(profile, 'householdSize', 0).householdSize).toBe(1);
    expect(withProfileCount(profile, 'cooldownWeeks', 13).cooldownWeeks).toBe(12);
  });

  it('falls back to the server\'s default when none was given', () => {
    expect(profileCount({name: 'x', meals: []}, 'householdSize')).toBe(2);
  });
});

describe('section summaries', () => {
  const t = ((key: string, options?: Record<string, unknown>) =>
    options ? `${key}:${Object.values(options).join()}` : key) as unknown as TFunction;

  it('names who eats and how often each meal is cooked', () => {
    expect(householdSummary(t, newPlanningProfile('x'))).toBe(
        'screens.planning.summaryPeople:2 · screens.planning.summaryMeal:mealTypes.lunch,2 · ' +
        'screens.planning.summaryMeal:mealTypes.dinner,5');
  });

  it('says when nothing is ruled out', () => {
    expect(foodSummary(t, newPlanningProfile('x'))).toBe('screens.planning.summaryNoRestrictions');
    expect(foodSummary(t, withToggled(newPlanningProfile('x'), 'diet', 'VEGAN'))).toBe('screens.editRecipe.dietVegan');
  });

  it('lists the preferences in force', () => {
    expect(extrasSummary(t, {...newPlanningProfile('x'), leftoversAllowed: false})).toBe(
        'screens.planning.summaryCooldown:2 · screens.planning.summaryVariety');
  });
});

describe('calories per meal', () => {
  // Lunch twice and dinner five times, 1800 kcal a day
  const daily = withKcalPerDay(newPlanningProfile('x'), '1800');

  it('shares the day evenly while no meal has a target of its own', () => {
    expect(kcalTargetOf(daily, meal(daily, 'LUNCH'))).toBe(900);
  });

  // A light lunch leaves more for dinner, not less for every meal
  it('gives what a meal\'s own target leaves to the others', () => {
    const lightLunch = withMealKcal(daily, 'LUNCH', '500');

    expect(kcalTargetOf(lightLunch, meal(lightLunch, 'LUNCH'))).toBe(500);
    expect(kcalTargetOf(lightLunch, meal(lightLunch, 'DINNER'))).toBe(1300);
    expect(hasMealKcal(lightLunch)).toBe(true);
  });

  it('shares evenly again', () => {
    const even = withEvenKcal(withMealKcal(daily, 'LUNCH', '500'));

    expect(hasMealKcal(even)).toBe(false);
    expect(kcalTargetOf(even, meal(even, 'DINNER'))).toBe(900);
  });

  it('has no target for a meal without one when there is no daily total', () => {
    expect(kcalTargetOf(newPlanningProfile('x'), meal(newPlanningProfile('x'), 'DINNER'))).toBeNull();
  });
});
