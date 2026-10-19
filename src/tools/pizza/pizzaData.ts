/**
 * Pizza styles and flours as published recipes and guides give them; where they give ranges or differ, a style
 * uses the median of their values.
 */
import {FRIDGE_C, ROOM_C, SchedulePreset} from '../dough/stages';
import {Stage, YeastRecipe} from '../fermentation/fermentation';
import {Range} from '../sources';
import {fahrenheitToCelsius} from '../units';

export type PizzaStyle = 'neapolitan' | 'contemporary' | 'newYork' | 'romanTonda' | 'romanTeglia' | 'detroit' |
  'sicilian' | 'blechpizza' | 'focaccia' | 'pinsa';

export const PIZZA_STYLES: readonly PizzaStyle[] = ['neapolitan', 'contemporary', 'newYork', 'romanTonda', 'pinsa',
  'romanTeglia', 'detroit', 'sicilian', 'blechpizza', 'focaccia'];

export interface StyleData {
  shape: 'round' | 'pan';
  /** Water in % of the flour. */
  hydration: number[];
  /** Salt in % of the flour; Neapolitan salt is set per litre of water instead. */
  salt: number[];
  /** The Neapolitan rules set salt in grams per litre of water. */
  saltPerLitreWater?: number[];
  oil: number[];
  sugar: number[];
  /** Round styles that do not say how thin they are: dough per pizza in grams. */
  ballWeight?: number[];
  /** Round styles: grams of dough per cm² of pizza. */
  thickness?: number[];
  /** Pan styles: grams of dough per cm² of tray. */
  panDensity?: number[];
  /** Pinsa needs a blend: shares of rice and soy flour. */
  blend?: {rice: number[], soy: number[]};
  /** How the sources bake it: the oven they use, °C and minutes. */
  bake: {oven: BakeOven, recipes: BakeRecipe[]};
  /** The flour its recipes use, as the closest one on offer: bread flour is 550, all-purpose 405. */
  flour?: PizzaFlour;
  /** How its recipes schedule the dough, as the closest presets. */
  schedules?: SchedulePreset[];
  /**
   * Its recipes' yeast, dry yeast as three times its weight in fresh, and schedules; a style without falls back
   * to pizza recipes in general.
   */
  yeastRecipes?: YeastRecipe[];
  /** The most fresh yeast its rules allow, in grams per litre of water. */
  maxFreshYeastPerLitreWater?: number;
}

/** Pizza ovens bake far hotter than home ovens. */
export type BakeOven = 'pizzaOven' | 'homeOven';

/** What one recipe says: the oven's temperature, where it gives one, and the minutes. */
export interface BakeRecipe {
  temperatureC?: number;
  minutes: Range;
}

const IN2 = 6.4516;
const OZ = 28.349523125;
/** Instant yeast weighs 7 g per 2 1/4 teaspoons and leavens like three times as much fresh. */
const INSTANT_TSP_AS_FRESH_G = 7 / 2.25 * 3;

// Recipes that say room temperature or fridge without a number.
const room = (hours: number): Stage => ({hours, temperatureC: ROOM_C});
const fridge = (hours: number): Stage => ({hours, temperatureC: FRIDGE_C});

export const STYLES: Record<PizzaStyle, StyleData> = {
  neapolitan: {
    shape: 'round',
    // The Neapolitan rules: 1 l water per 1.6 to 1.8 kg flour.
    hydration: [1000 / 1700 * 100, 61],
    salt: [],
    // The Neapolitan rules: 40 to 60 g; the EU specification: 50 to 55 g. Recipes: 50 g per litre, 25 g per 700 g,
    // 13 g per 250 g, 28 g per 650 g, 25 g per 650 g, 13 g per 310 g of water.
    saltPerLitreWater: [50, 52.5, 50, 25 / 700 * 1000, 13 / 250 * 1000, 28 / 650 * 1000, 25 / 650 * 1000,
      13 / 310 * 1000],
    oil: [0, 0],
    sugar: [0, 0],
    // The Neapolitan rules: 200 g for 22 to 24 cm and 280 g for 28 to 35 cm. Recipes: 225 g for 30 cm, 230 to
    // 250 g for 26 cm, seven pizzas of 32 cm from 1680 g.
    thickness: [200 / (Math.PI * 11.5 ** 2), 280 / (Math.PI * 15.75 ** 2), 225 / (Math.PI * 15 ** 2),
      240 / (Math.PI * 13 ** 2), 1680 / 7 / (Math.PI * 16 ** 2)],
    // Floor 380 to 430 °C and 400 to 450 °C, both 60 to 90 s.
    bake: {oven: 'pizzaOven', recipes: [
      {temperatureC: 405, minutes: {low: 1, high: 1.5}},
      {temperatureC: 425, minutes: {low: 1, high: 1.5}},
    ]},
    // 00 or 0, W 250 to 320; 12 to 24 hours at 18 to 20 °C.
    flour: 'tipo00',
    schedules: ['overnight'],
    // The Neapolitan rules: 0.1 to 3 g fresh yeast per litre of water; the EU specification: 3 g.
    maxFreshYeastPerLitreWater: 3,
    // 0.1 g dry yeast per 500 g, 16 h, 4 to 10 h in the fridge, 3 to 5 h; 1 g fresh per 550 g, 18 to 48 h in the
    // fridge, 4 h; 2 g fresh per kg, 4 h at 20 to 24 °C, 24 h at 4 to 6 °C, 6 to 8 h at 20 to 22 °C; 1 g fresh per kg,
    // 20 to 60 min and three folds 20 min apart, 2 to 3 h, 12 h in the fridge, the rest of 24 to 30 h in all at room
    // temperature; 3 g fresh per litre of water (1650 g flour), 3 h and 5 h; 1 to 3 g per litre, 20 h in the fridge,
    // 5 h; 2 g fresh per kg, 4 h, 24 h at 4 to 6 °C, 4 to 6 h; 1/3 g fresh for 570 g, about 20 h.
    yeastRecipes: [
      {freshPercent: 0.1 * 3 / 500 * 100, stages: [room(16), fridge(7), room(4)]},
      {freshPercent: 1 / 550 * 100, stages: [fridge(33), room(4)]},
      {freshPercent: 0.2, stages: [{hours: 4, temperatureC: 22}, {hours: 24, temperatureC: 5},
        {hours: 7, temperatureC: 21}]},
      {freshPercent: 0.1, stages: [room(40 / 60 + 1 + 2.5), fridge(12), room(27 - 40 / 60 - 1 - 2.5 - 12)]},
      {freshPercent: 3 / 1650 * 100, stages: [room(8)]},
      {freshPercent: 2 / 1650 * 100, stages: [fridge(20), room(5)]},
      {freshPercent: 0.2, stages: [room(4), {hours: 24, temperatureC: 5}, room(5)]},
      {freshPercent: 1 / 3 / 570 * 100, stages: [room(20)]},
    ],
  },
  contemporary: {
    shape: 'round',
    // A formula guide gives 70 to 80 % water and 2.5 to 3 % salt; recipes 630 g and 650 to 700 g water, 26 g and
    // 25 to 28 g salt per kg flour.
    hydration: [71.5, 72.5, 75, 630 / 1000 * 100, 675 / 1000 * 100],
    salt: [2, 2.75, 26 / 1000 * 100, 26.5 / 1000 * 100],
    oil: [0, 0, 0, 0],
    sugar: [0, 0, 0, 0],
    // At most 31 cm from 260 to 270 g; championship rules: 30 to 32 cm from 250 to 270 g.
    thickness: [265 / (Math.PI * 15.5 ** 2), 260 / (Math.PI * 15.5 ** 2)],
    // Electric ovens: 280 to 300 °C for 7 to 8 min, 360 °C for about 2 min, 440 °C for about 100 s; 450 °C for 60
    // to 90 s; 380 °C for about 2 min.
    bake: {oven: 'pizzaOven', recipes: [
      {temperatureC: 290, minutes: {low: 7, high: 8}},
      {temperatureC: 360, minutes: {low: 2, high: 2}},
      {temperatureC: 440, minutes: {low: 100 / 60, high: 100 / 60}},
      {temperatureC: 450, minutes: {low: 1, high: 1.5}},
      {temperatureC: 380, minutes: {low: 2, high: 2}},
    ]},
    // 00 or 0, W 220 to 260; 24 hours in the fridge.
    flour: 'tipo00',
    schedules: ['fridge24'],
    // 5 g fresh per kg; 50 min, 24 h at 4 to 6 °C, 4 to 6 h. 1 g fresh per kg; 2 h, 24 to 48 h at 2 to 4 °C, 5 h.
    yeastRecipes: [
      {freshPercent: 0.5, stages: [room(50 / 60), {hours: 24, temperatureC: 5}, room(5)]},
      {freshPercent: 0.1, stages: [room(2), {hours: 36, temperatureC: 3}, room(5)]},
    ],
  },
  newYork: {
    shape: 'round',
    hydration: [62, 63, 64, 62, 206 / 360 * 100],
    salt: [1.75, 1.75, 2, 2.25, 12 / 360 * 100],
    oil: [2, 1, 2.5, 2, 12 / 360 * 100],
    sugar: [2, 0, 1, 12 / 360 * 100],
    // Thickness factor 0.085 oz per square inch; 326 g and 350 g for 14 inches; two 13 inch pizzas from 360 g
    // flour, 206 g water and 12 g each of salt, oil and sugar.
    thickness: [0.085 * OZ / IN2, 326 / (Math.PI * (7 * 2.54) ** 2), 350 / (Math.PI * (7 * 2.54) ** 2),
      (360 + 206 + 3 * 12) / 2 / (Math.PI * (6.5 * 2.54) ** 2)],
    // On a stone or steel at 500 to 550 °F; one bakes 5 to 7 min and grills 2 to 3 min.
    bake: {oven: 'homeOven', recipes: [
      {temperatureC: 260, minutes: {low: 7, high: 10}},
      {temperatureC: 274, minutes: {low: 6, high: 8}},
      {temperatureC: 288, minutes: {low: 5, high: 7}},
    ]},
    // Bread flour; 1 hour, then 8 to 10 hours as balls at room temperature.
    flour: 'type550',
    schedules: ['sameDay'],
    // A quarter teaspoon of instant yeast for 360 g; 1 h, then 8 to 10 h. 0.4 % instant; up to 72 h in the fridge,
    // 1 h.
    yeastRecipes: [
      {freshPercent: INSTANT_TSP_AS_FRESH_G / 4 / 360 * 100, stages: [room(10)]},
      {freshPercent: 0.4 * 3, stages: [fridge(72), room(1)]},
    ],
  },
  romanTonda: {
    shape: 'round',
    hydration: [55, 254 / 452 * 100, 56.5],
    salt: [9 / 452 * 100, 2.5],
    oil: [5 / 452 * 100, 2],
    sugar: [0, 0],
    // Four balls from 720 g; 180 g for 30 cm.
    ballWeight: [720 / 4, 180],
    // 300 °C for 3 min; under 2 min below Neapolitan heat.
    bake: {oven: 'pizzaOven', recipes: [
      {temperatureC: 300, minutes: {low: 3, high: 3}},
      {minutes: {low: 2, high: 2}},
    ]},
  },
  pinsa: {
    shape: 'round',
    hydration: [500 / 720 * 100, 440 / 600 * 100, 380 / 480 * 100,
      77.5, 77.5],
    salt: [15 / 720 * 100, 11 / 480 * 100, 1.75],
    oil: [10 / 720 * 100, 12 / 480 * 100, 1.25],
    sugar: [0, 0],
    // Four from 1248 g, four from 1148 g.
    ballWeight: [1248 / 4, 1148 / 4],
    // Rice and soy flour: 30 g each of 580 g, 40 g and 15 g of 655 g, 150 g and 50 g of 1 kg.
    blend: {rice: [30 / 580 * 100, 40 / 655 * 100, 150 / 1000 * 100],
      soy: [30 / 580 * 100, 15 / 655 * 100, 50 / 1000 * 100]},
    // On the tray: 200 °C for 20 min, 220 °C for 8 plus 6 to 7 min, the hottest setting for 7 to 8 plus 2 to 3 min.
    bake: {oven: 'homeOven', recipes: [
      {temperatureC: 200, minutes: {low: 20, high: 20}},
      {temperatureC: 220, minutes: {low: 14, high: 15}},
      {minutes: {low: 9, high: 11}},
    ]},
    // Strong flour, W 300 or more; 24 hours in the fridge, then 3 to 4 hours.
    flour: 'tipo00Strong',
    schedules: ['fridge24'],
    // 2 g dry yeast for 500 g; 1 h, 24 h in the fridge, 3 to 4 h. 3 g dry for 655 g; 48 to 120 h in the fridge, 2 to
    // 4 h. Half a 7 g sachet for 1 kg; 30 to 48 h in the fridge, 45 to 60 min, 2 to 3 h.
    yeastRecipes: [
      {freshPercent: 2 * 3 / 500 * 100, stages: [room(1.25), fridge(24), room(3.5)]},
      {freshPercent: 3 * 3 / 655 * 100, stages: [fridge(84), room(3)]},
      {freshPercent: 3.5 * 3 / 1000 * 100, stages: [fridge(39), room(0.875 + 2.5)]},
    ],
  },
  romanTeglia: {
    shape: 'pan',
    hydration: [80, 82.5, 80, 75],
    salt: [1.5, 2.75, 2],
    oil: [3, 1.5],
    sugar: [0],
    // 900 g on 900 cm²; three 30 x 40 cm trays from 1 kg flour, 750 g water, 20 g salt and 7.5 g yeast; 656 g on
    // 30 x 40 cm; half a gram per cm².
    panDensity: [900 / 900, (1000 + 750 + 20 + 7.5) / (3 * 30 * 40), (350 + 290 + 7 + 7 + 2) / (30 * 40), 0.5],
    bake: {oven: 'homeOven', recipes: [
      {temperatureC: 240, minutes: {low: 10, high: 12}},
      {temperatureC: 180, minutes: {low: 10, high: 12}},
      {temperatureC: 250, minutes: {low: 20, high: 20}},
      {temperatureC: 200, minutes: {low: 20, high: 20}},
    ]},
    // W 300 to 340; 24 hours in the fridge.
    flour: 'tipo00Strong',
    schedules: ['fridge24'],
    // 5 g fresh per kg in summer, 10 g in winter; 2 to 3 h, 24 h at 4 to 6 °C, 4 to 6 h. 2 g fresh for 350 g; 1 to
    // 1.5 h, 44 h at 4 °C, 3 to 4 h.
    yeastRecipes: [
      {freshPercent: 0.75, stages: [room(2.5), {hours: 24, temperatureC: 5}, room(5)]},
      {freshPercent: 2 / 350 * 100, stages: [room(1.25), {hours: 44, temperatureC: 4}, room(3.5)]},
    ],
  },
  detroit: {
    shape: 'pan',
    hydration: [58, 67, 75, 260 / 350 * 100],
    salt: [2, 250 / 9000 * 100, 2.2, 10 / 350 * 100],
    oil: [0, 200 / 9000 * 100, 0, 20 / 350 * 100],
    sugar: [0, 1, 0],
    panDensity: [510 / (10 * 14 * IN2), 2.95 * 1.1 / IN2],
    // One par-bakes 6 to 8 min at 260 °C, then 10 to 15 min at 246 °C.
    bake: {oven: 'homeOven', recipes: [
      {temperatureC: 246, minutes: {low: 16, high: 23}},
      {temperatureC: 232, minutes: {low: 18, high: 20}},
      {temperatureC: 260, minutes: {low: 18, high: 20}},
      {temperatureC: 232, minutes: {low: 12, high: 15}},
      {temperatureC: 260, minutes: {low: 10, high: 12}},
    ]},
    // Bread flour; 4 to 5 hours at room temperature, the last in the pan.
    flour: 'type550',
    schedules: ['sameDay'],
    // 0.6 % active dry yeast; 1 h, 1 h, 2 to 3 h in the pan. 9 g fresh for 350 g; 3 to 4 h, 30 min in the pan.
    yeastRecipes: [
      {freshPercent: 0.6 / 0.4, stages: [room(4.5)]},
      {freshPercent: 9 / 350 * 100, stages: [room(4)]},
    ],
  },
  sicilian: {
    shape: 'pan',
    hydration: [378 / 659 * 100, 58, 72],
    // 2 1/4 teaspoons of salt, 3 tablespoons of oil and 1 teaspoon of sugar for 659 g, weighed with the
    // catalogue's spoon volumes and densities.
    salt: [2.5, 3, 11.25 * 1.2 / 659 * 100],
    oil: [5, 6, 45 * 0.9 / 659 * 100],
    sugar: [0, 0, 5 * 0.792 / 659 * 100],
    panDensity: [0.13 * OZ / IN2, 910 / (12 * 18 * IN2)],
    bake: {oven: 'homeOven', recipes: [
      {temperatureC: 232, minutes: {low: 20, high: 25}},
      {temperatureC: 232, minutes: {low: 15, high: 20}},
    ]},
    // All-purpose flour with semolina; 24 to 48 hours in the fridge.
    flour: 'type405',
    schedules: ['fridge24', 'fridge48'],
    // A teaspoon of instant yeast for 659 g; 10 min, 24 to 48 h in the fridge, 1 h. A teaspoon for 616 g; 1 to 2 h,
    // 1 to 2 h in the pan.
    yeastRecipes: [
      {freshPercent: INSTANT_TSP_AS_FRESH_G / 659 * 100, stages: [room(10 / 60), fridge(36), room(1)]},
      {freshPercent: INSTANT_TSP_AS_FRESH_G / 616 * 100, stages: [room(3)]},
    ],
  },
  blechpizza: {
    shape: 'pan',
    hydration: [300 / 600 * 100, 200 / 400 * 100, 250 / 500 * 100, 300 / 500 * 100, 250 / 300 * 100],
    // Half a teaspoon of salt, six tablespoons of oil, one of sugar for 600 g flour; a teaspoon of salt, two
    // tablespoons of oil, one teaspoon of sugar for 500 g; half a teaspoon of salt, a teaspoon of oil for 300 g;
    // weighed with the catalogue's spoon volumes and densities.
    salt: [2.5 * 1.2 / 600 * 100, 5 * 1.2 / 500 * 100, 2.5 * 1.2 / 300 * 100],
    oil: [90 * 0.9 / 600 * 100, 30 * 0.9 / 500 * 100, 5 * 0.9 / 300 * 100],
    sugar: [15 * 0.792 / 600 * 100, 5 * 0.792 / 500 * 100],
    // 600 g flour and 300 ml water on a 32 x 39 cm tray.
    panDensity: [900 / (32 * 39)],
    bake: {oven: 'homeOven', recipes: [
      {temperatureC: 200, minutes: {low: 30, high: 30}},
      {temperatureC: 200, minutes: {low: 20, high: 25}},
      {temperatureC: 220, minutes: {low: 15, high: 20}},
    ]},
    // Wheat 405; 30 to 60 minutes somewhere warm.
    flour: 'type405',
    schedules: ['quick'],
    // A sachet of 7 g dry yeast for 500 g, 1 h; a cube of 42 g fresh for 600 g, 30 min; half a cube for 300 g,
    // 45 min.
    yeastRecipes: [
      {freshPercent: 7 * 3 / 500 * 100, stages: [room(1)]},
      {freshPercent: 42 / 600 * 100, stages: [room(0.5)]},
      {freshPercent: 21 / 300 * 100, stages: [room(0.75)]},
    ],
  },
  focaccia: {
    shape: 'pan',
    hydration: [60, 300 / 500 * 100, 55],
    salt: [2, 2, 2.5],
    oil: [6, 6, 7],
    sugar: [0],
    // 900 g on 900 cm²; three 30 x 40 cm trays from 1655 g; 871 g on 30 x 40 cm; 840 g on 40 x 35 cm; 819 g on
    // 24 x 32 cm.
    panDensity: [900 / 900, 1655 / (3 * 30 * 40), 871 / (30 * 40), 840 / (40 * 35), 819 / (24 * 32)],
    bake: {oven: 'homeOven', recipes: [
      {temperatureC: 250, minutes: {low: 22, high: 22}},
      {temperatureC: 240, minutes: {low: 14, high: 15}},
      {temperatureC: 200, minutes: {low: 20, high: 20}},
      {temperatureC: 230, minutes: {low: 15, high: 20}},
    ]},
    // Strong 00, W 300, or Manitoba with 0; about 7 hours the same day, or 24 hours in the fridge.
    flour: 'tipo00Strong',
    schedules: ['sameDay', 'fridge24'],
    // 15 g fresh per kg; 1 h, 24 h at 6 °C, 3 h in the pan. Same day, somewhere warm: 15 g fresh for 500 g, 2.5 h;
    // 20 g for 450 g, 2 h and 45 to 60 min; 6 g for 610 g, 2.5 h and 1.5 to 2 h.
    yeastRecipes: [
      {freshPercent: 1.5, stages: [room(1), {hours: 24, temperatureC: 6}, room(3)]},
      {freshPercent: 15 / 500 * 100, stages: [room(2.5)]},
      {freshPercent: 20 / 450 * 100, stages: [room(2 + 0.875)]},
      {freshPercent: 6 / 610 * 100, stages: [room(2.5 + 1.75)]},
    ],
  },
};

/**
 * Pizza recipes in general, for a style without its own: 0.1 % instant yeast, 5.5 h; 0.8 g instant per kg,
 * 12 h, at least 6 h in the fridge; 0.056 % instant, 12 h at 70 °F; 0.17 % fresh, 9 to 10 h at 20 °C.
 */
export const PIZZA_YEAST_RECIPES: readonly YeastRecipe[] = [
  {freshPercent: 0.1 * 3, stages: [room(5.5)]},
  {freshPercent: 0.08 * 3, stages: [room(12), fridge(6)]},
  {freshPercent: 0.056 * 3, stages: [{hours: 12, temperatureC: fahrenheitToCelsius(70)}]},
  {freshPercent: 0.17, stages: [{hours: 9.5, temperatureC: 20}]},
];

export type PizzaFlour = 'tipo00' | 'tipo00Strong' | 'manitoba' | 'type405' | 'type550' | 'type812' | 'type1050' |
  'wholeWheat' | 'durum' | 'spelt630' | 'speltWholegrain';

export const PIZZA_FLOURS: readonly PizzaFlour[] = ['tipo00', 'tipo00Strong', 'manitoba', 'type550', 'type405',
  'type812', 'type1050', 'wholeWheat', 'durum', 'spelt630', 'speltWholegrain'];

export interface FlourData {
  /** The wettest dough recipes make with it, % of the flour. */
  maxHydration: number[];
  /** The longest fermentation recipes give it, in hours. */
  maxHours?: number[];
}

export const FLOURS: Record<PizzaFlour, FlourData> = {
  // Pizza 00 of medium strength, W 260 to 280: up to 70 % water, 8 to 24 h; the open flour database's 00 flours of
  // W 250 to 290 take up to 65 % (median).
  tipo00: {
    maxHydration: [70, 65],
    maxHours: [24, 24],
  },
  // Strong 00, W 300 to 320.
  tipo00Strong: {
    maxHydration: [75, 80, 70],
    maxHours: [72, 48, 48],
  },
  // 13 to 15 % protein, W 350 to 450; the open flour database's Manitoba flours take up to 78 % (median of 19).
  manitoba: {
    maxHydration: [78],
    maxHours: [96],
  },
  type405: {maxHydration: [60, 70]},
  type550: {maxHydration: [60, 70]},
  // The open flour database's Tipo 1 flours, of the same ash, take up to 73.5 % (median of 8).
  type812: {maxHydration: [73, 73.5]},
  type1050: {maxHydration: [70, 77]},
  wholeWheat: {maxHydration: [80, 85]},
  spelt630: {maxHydration: [60, 68]},
  speltWholegrain: {maxHydration: [80, 78]},
  // The wettest durum semolina pizza and bread recipes: 400 g, 400 g and 375 g water on 500 g.
  durum: {maxHydration: [400 / 500 * 100, 400 / 500 * 100, 375 / 500 * 100]},
};

/** W value bands and the longest fermentation recipes give them. */
export const W_BANDS: readonly {upTo: number, maxHours: number[]}[] = [
  {upTo: 280, maxHours: [24, 24]},
  {upTo: 320, maxHours: [48, 72]},
  {upTo: Infinity, maxHours: [96]},
];

/** What the pizza bakes on: a home oven's tray, stone or steel, or a pizza oven. */
export type PizzaOven = 'tray' | 'stone' | 'steel' | 'pizzaOven';

export const PIZZA_OVENS: readonly PizzaOven[] = ['tray', 'stone', 'steel', 'pizzaOven'];

/** A pizza oven's thin pizza in a home oven, by what it bakes on: what recipes give, at their temperature. */
export const HOME_OVEN_RECIPES: Record<Exclude<PizzaOven, 'pizzaOven'>, BakeRecipe[]> = {
  // On a preheated tray.
  tray: [
    {temperatureC: 220, minutes: {low: 8, high: 12}},
    {temperatureC: 250, minutes: {low: 10, high: 10}},
  ],
  stone: [
    {temperatureC: 250, minutes: {low: 5, high: 10}},
    {minutes: {low: 8, high: 12}},
    {temperatureC: 260, minutes: {low: 5, high: 7}},
  ],
  // A table of bake time by temperature from 350 to 550 °F, and two single recipes.
  steel: [
    {temperatureC: fahrenheitToCelsius(350), minutes: {low: 12, high: 15}},
    {temperatureC: fahrenheitToCelsius(400), minutes: {low: 10, high: 12}},
    {temperatureC: fahrenheitToCelsius(450), minutes: {low: 6, high: 8}},
    {temperatureC: fahrenheitToCelsius(500), minutes: {low: 5, high: 7}},
    {temperatureC: fahrenheitToCelsius(550), minutes: {low: 4, high: 5}},
    {temperatureC: 250, minutes: {low: 3, high: 4}},
    {minutes: {low: 4, high: 6}},
  ],
};

/** The usual small, medium and large pizza in cm: the medians of what pizzerias offer, to whole cm. */
export const PIZZA_DIAMETERS: readonly number[] = [26, 30, 36];
