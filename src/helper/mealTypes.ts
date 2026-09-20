import {TFunction} from 'i18next';
import {MealType} from '../dao/RestAPI';
import {toggledIn} from './choices';

/** The meals the server knows about, in the order of a day. */
export const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT'];

/**
 * @param {MealType} left a meal
 * @param {MealType} right another meal
 * @return {number} negative when the first comes earlier in the day
 */
export const inDayOrder = (left: MealType, right: MealType): number =>
  MEAL_TYPES.indexOf(left) - MEAL_TYPES.indexOf(right);

const MEAL_TYPE_LABEL_KEYS: Record<MealType, string> = {
  BREAKFAST: 'mealTypes.breakfast',
  LUNCH: 'mealTypes.lunch',
  DINNER: 'mealTypes.dinner',
  SNACK: 'mealTypes.snack',
  DESSERT: 'mealTypes.dessert',
};

/**
 * What to call a meal on screen.
 *
 * @param {TFunction} t the translation function of the calling screen
 * @param {MealType} mealType the meal
 * @return {string} the label
 */
export const mealTypeLabel = (t: TFunction, mealType: MealType): string => t(MEAL_TYPE_LABEL_KEYS[mealType]);

/**
 * Turns a meal on or off, keeping the day's order rather than the order they were tapped in.
 *
 * @param {MealType[]} [mealTypes] the meals before the tap
 * @param {MealType} mealType the meal that was tapped
 * @return {MealType[]} the meals after it
 */
export const toggledMealType = (mealTypes: MealType[] | undefined, mealType: MealType): MealType[] =>
  toggledIn(mealTypes, mealType).sort(inDayOrder);

/**
 * @param {number} hour the hour of the day, 0 to 23
 * @return {MealType} the meal someone asking at this hour most likely means
 */
export const mealTypeAt = (hour: number): MealType => {
  if (hour < 11) {
    return 'BREAKFAST';
  }
  return hour < 15 ? 'LUNCH' : 'DINNER';
};
