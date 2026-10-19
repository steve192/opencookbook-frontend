/** How warm a dough is mixed and how much it needs to rise, both from published recipes. */
import {SOURDOUGH_BREADS, YEAST_BREADS} from '../bread/breadData';
import {Calibration, gasNeeded, scheduleActivity, Stage, YeastRecipe} from '../fermentation/fermentation';
import {median} from '../sources';
import {fahrenheitToCelsius} from '../units';
import {FRIDGE_MAX_C} from './stages';

export type DoughStyle = 'pizza' | 'bread';

/** Pizza dough going into the fridge: 70 to 75 °F after kneading. */
const PIZZA_FRIDGE_DOUGH_C = fahrenheitToCelsius(72.5);

/** Pizza dough rising at room temperature: 75 to 80 °F and 75 to 78 °F. */
const PIZZA_ROOM_DOUGH_C = fahrenheitToCelsius(median([77.5, 76.5])!);

/** Wheat bread doughs, with yeast or sourdough: 75 to 78 °F. */
const BREAD_DOUGH_C = fahrenheitToCelsius(76.5);

/**
 * The dough temperature recipes aim for after kneading; pizza dough that goes into the fridge is kneaded cooler.
 *
 * @param {DoughStyle} style pizza or bread
 * @param {Stage[]} stages the schedule
 * @return {number} °C
 */
export const recommendedDoughC = (style: DoughStyle, stages: Stage[]): number => {
  if (style === 'bread') {
    return BREAD_DOUGH_C;
  }
  return stages.some((stage) => stage.temperatureC <= FRIDGE_MAX_C) ? PIZZA_FRIDGE_DOUGH_C : PIZZA_ROOM_DOUGH_C;
};

const BREAD_GAS = gasNeeded(YEAST_BREADS, () => BREAD_DOUGH_C);

/** The fresh yeast % that 1 % ripe starter stands for: the median of what each published sourdough bread needs. */
const STARTER_YEAST = median(SOURDOUGH_BREADS.map((bread) =>
  BREAD_GAS / (bread.starterPercent * scheduleActivity('sourdough', bread.stages, BREAD_DOUGH_C))))!;

export const BREAD_CALIBRATION: Calibration = {gas: BREAD_GAS, starterYeast: STARTER_YEAST};

/**
 * What a pizza style needs, from its published recipes; a starter is as strong as in bread.
 *
 * @param {YeastRecipe[]} recipes the style's recipes
 * @return {Calibration} its calibration
 */
export const pizzaCalibration = (recipes: readonly YeastRecipe[]): Calibration => ({
  gas: gasNeeded(recipes, (stages) => recommendedDoughC('pizza', stages)),
  starterYeast: STARTER_YEAST,
});
