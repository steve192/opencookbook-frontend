/** Pizza styles and flours; a style takes the median of each list, a range counting as its middle. */
import {FRIDGE_C, ROOM_C, SchedulePreset} from '../dough/stages';
import {Stage, YeastSchedule} from '../fermentation/fermentation';
import {Range} from '../numbers';
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
  /** Salt in grams per litre of water, as Neapolitan dough is salted. */
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
  /** How it is baked: the oven, °C and minutes. */
  bake: {oven: BakeOven, settings: BakeSetting[]};
  /** Its flour, as the closest one on offer: bread flour is 550, all-purpose 405. */
  flour?: PizzaFlour;
  /** How its dough is scheduled, as the closest presets. */
  schedules?: SchedulePreset[];
  /** Its yeast and schedules, dry yeast as three times its weight in fresh; a style without takes pizza in general. */
  yeastSchedules?: YeastSchedule[];
  /** The most fresh yeast the style allows, in grams per litre of water. */
  maxFreshYeastPerLitreWater?: number;
}

/** Pizza ovens bake far hotter than home ovens. */
export type BakeOven = 'pizzaOven' | 'homeOven';

/** One bake: the oven's temperature, where known, and the minutes. */
export interface BakeSetting {
  temperatureC?: number;
  minutes: Range;
}

const IN2 = 6.4516;
const OZ = 28.349523125;
/** Instant yeast weighs 7 g per 2 1/4 teaspoons and leavens like three times as much fresh. */
const INSTANT_TSP_AS_FRESH_G = 7 / 2.25 * 3;

// Stages at the usual room or fridge temperature.
const room = (hours: number): Stage => ({hours, temperatureC: ROOM_C});
const fridge = (hours: number): Stage => ({hours, temperatureC: FRIDGE_C});

// Spoon measures are weighed with the catalogue's spoon volumes and densities.
export const STYLES: Record<PizzaStyle, StyleData> = {
  neapolitan: {
    shape: 'round',
    hydration: [1000 / 1700 * 100, 61],
    salt: [],
    saltPerLitreWater: [50, 52.5, 50, 25 / 700 * 1000, 13 / 250 * 1000, 28 / 650 * 1000, 25 / 650 * 1000,
      13 / 310 * 1000],
    oil: [0, 0],
    sugar: [0, 0],
    thickness: [200 / (Math.PI * 11.5 ** 2), 280 / (Math.PI * 15.75 ** 2), 225 / (Math.PI * 15 ** 2),
      240 / (Math.PI * 13 ** 2), 1680 / 7 / (Math.PI * 16 ** 2)],
    bake: {oven: 'pizzaOven', settings: [
      {temperatureC: 405, minutes: {low: 1, high: 1.5}},
      {temperatureC: 425, minutes: {low: 1, high: 1.5}},
    ]},
    // The whole day comes first, as the default: for a dinner bake, 16 hours overnight would start at 3 at night.
    flour: 'tipo00',
    schedules: ['daylong', 'overnight'],
    maxFreshYeastPerLitreWater: 3,
    yeastSchedules: [
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
    hydration: [71.5, 72.5, 75, 630 / 1000 * 100, 675 / 1000 * 100],
    salt: [2, 2.75, 26 / 1000 * 100, 26.5 / 1000 * 100],
    oil: [0, 0, 0, 0],
    sugar: [0, 0, 0, 0],
    thickness: [265 / (Math.PI * 15.5 ** 2), 260 / (Math.PI * 15.5 ** 2)],
    bake: {oven: 'pizzaOven', settings: [
      {temperatureC: 290, minutes: {low: 7, high: 8}},
      {temperatureC: 360, minutes: {low: 2, high: 2}},
      {temperatureC: 440, minutes: {low: 100 / 60, high: 100 / 60}},
      {temperatureC: 450, minutes: {low: 1, high: 1.5}},
      {temperatureC: 380, minutes: {low: 2, high: 2}},
    ]},
    flour: 'tipo00',
    schedules: ['fridge24'],
    yeastSchedules: [
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
    thickness: [0.085 * OZ / IN2, 326 / (Math.PI * (7 * 2.54) ** 2), 350 / (Math.PI * (7 * 2.54) ** 2),
      (360 + 206 + 3 * 12) / 2 / (Math.PI * (6.5 * 2.54) ** 2)],
    bake: {oven: 'homeOven', settings: [
      {temperatureC: 260, minutes: {low: 7, high: 10}},
      {temperatureC: 274, minutes: {low: 6, high: 8}},
      {temperatureC: 288, minutes: {low: 5, high: 7}},
    ]},
    flour: 'type550',
    schedules: ['sameDay'],
    yeastSchedules: [
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
    ballWeight: [720 / 4, 180],
    bake: {oven: 'pizzaOven', settings: [
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
    ballWeight: [1248 / 4, 1148 / 4],
    blend: {rice: [30 / 580 * 100, 40 / 655 * 100, 150 / 1000 * 100],
      soy: [30 / 580 * 100, 15 / 655 * 100, 50 / 1000 * 100]},
    bake: {oven: 'homeOven', settings: [
      {temperatureC: 200, minutes: {low: 20, high: 20}},
      {temperatureC: 220, minutes: {low: 14, high: 15}},
      {minutes: {low: 9, high: 11}},
    ]},
    flour: 'tipo00Strong',
    schedules: ['fridge24'],
    yeastSchedules: [
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
    panDensity: [900 / 900, (1000 + 750 + 20 + 7.5) / (3 * 30 * 40), (350 + 290 + 7 + 7 + 2) / (30 * 40), 0.5],
    bake: {oven: 'homeOven', settings: [
      {temperatureC: 240, minutes: {low: 10, high: 12}},
      {temperatureC: 180, minutes: {low: 10, high: 12}},
      {temperatureC: 250, minutes: {low: 20, high: 20}},
      {temperatureC: 200, minutes: {low: 20, high: 20}},
    ]},
    flour: 'tipo00Strong',
    schedules: ['fridge24'],
    yeastSchedules: [
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
    bake: {oven: 'homeOven', settings: [
      {temperatureC: 246, minutes: {low: 16, high: 23}},
      {temperatureC: 232, minutes: {low: 18, high: 20}},
      {temperatureC: 260, minutes: {low: 18, high: 20}},
      {temperatureC: 232, minutes: {low: 12, high: 15}},
      {temperatureC: 260, minutes: {low: 10, high: 12}},
    ]},
    flour: 'type550',
    schedules: ['sameDay'],
    yeastSchedules: [
      {freshPercent: 0.6 / 0.4, stages: [room(4.5)]},
      {freshPercent: 9 / 350 * 100, stages: [room(4)]},
    ],
  },
  sicilian: {
    shape: 'pan',
    hydration: [378 / 659 * 100, 58, 72],
    salt: [2.5, 3, 11.25 * 1.2 / 659 * 100],
    oil: [5, 6, 45 * 0.9 / 659 * 100],
    sugar: [0, 0, 5 * 0.792 / 659 * 100],
    panDensity: [0.13 * OZ / IN2, 910 / (12 * 18 * IN2)],
    bake: {oven: 'homeOven', settings: [
      {temperatureC: 232, minutes: {low: 20, high: 25}},
      {temperatureC: 232, minutes: {low: 15, high: 20}},
    ]},
    flour: 'type405',
    schedules: ['fridge24', 'fridge48'],
    yeastSchedules: [
      {freshPercent: INSTANT_TSP_AS_FRESH_G / 659 * 100, stages: [room(10 / 60), fridge(36), room(1)]},
      {freshPercent: INSTANT_TSP_AS_FRESH_G / 616 * 100, stages: [room(3)]},
    ],
  },
  blechpizza: {
    shape: 'pan',
    hydration: [300 / 600 * 100, 200 / 400 * 100, 250 / 500 * 100, 300 / 500 * 100, 250 / 300 * 100],
    salt: [2.5 * 1.2 / 600 * 100, 5 * 1.2 / 500 * 100, 2.5 * 1.2 / 300 * 100],
    oil: [90 * 0.9 / 600 * 100, 30 * 0.9 / 500 * 100, 5 * 0.9 / 300 * 100],
    sugar: [15 * 0.792 / 600 * 100, 5 * 0.792 / 500 * 100],
    panDensity: [900 / (32 * 39)],
    bake: {oven: 'homeOven', settings: [
      {temperatureC: 200, minutes: {low: 30, high: 30}},
      {temperatureC: 200, minutes: {low: 20, high: 25}},
      {temperatureC: 220, minutes: {low: 15, high: 20}},
    ]},
    flour: 'type405',
    schedules: ['quick'],
    yeastSchedules: [
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
    panDensity: [900 / 900, 1655 / (3 * 30 * 40), 871 / (30 * 40), 840 / (40 * 35), 819 / (24 * 32)],
    bake: {oven: 'homeOven', settings: [
      {temperatureC: 250, minutes: {low: 22, high: 22}},
      {temperatureC: 240, minutes: {low: 14, high: 15}},
      {temperatureC: 200, minutes: {low: 20, high: 20}},
      {temperatureC: 230, minutes: {low: 15, high: 20}},
    ]},
    flour: 'tipo00Strong',
    schedules: ['sameDay', 'fridge24'],
    yeastSchedules: [
      {freshPercent: 1.5, stages: [room(1), {hours: 24, temperatureC: 6}, room(3)]},
      {freshPercent: 15 / 500 * 100, stages: [room(2.5)]},
      {freshPercent: 20 / 450 * 100, stages: [room(2 + 0.875)]},
      {freshPercent: 6 / 610 * 100, stages: [room(2.5 + 1.75)]},
    ],
  },
};

/** Pizza in general, for a style without its own yeast and schedules. */
export const PIZZA_YEAST_SCHEDULES: readonly YeastSchedule[] = [
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
  /** The wettest dough it makes, % of the flour. */
  maxHydration: number[];
  /** The longest it ferments, in hours. */
  maxHours?: number[];
}

export const FLOURS: Record<PizzaFlour, FlourData> = {
  // Pizza 00 of medium strength, W 260 to 280.
  tipo00: {
    maxHydration: [70, 65],
    maxHours: [24, 24],
  },
  // Strong 00, W 300 to 320.
  tipo00Strong: {
    maxHydration: [75, 80, 70],
    maxHours: [72, 48, 48],
  },
  // 13 to 15 % protein, W 350 to 450.
  manitoba: {
    maxHydration: [78],
    maxHours: [96],
  },
  type405: {maxHydration: [60, 70]},
  type550: {maxHydration: [60, 70]},
  // As Tipo 1 flours, of the same ash.
  type812: {maxHydration: [73, 73.5]},
  type1050: {maxHydration: [70, 77]},
  wholeWheat: {maxHydration: [80, 85]},
  spelt630: {maxHydration: [60, 68]},
  speltWholegrain: {maxHydration: [80, 78]},
  durum: {maxHydration: [400 / 500 * 100, 400 / 500 * 100, 375 / 500 * 100]},
};

/** W value bands and the longest they ferment, in hours. */
export const W_BANDS: readonly {upTo: number, maxHours: number[]}[] = [
  {upTo: 280, maxHours: [24, 24]},
  {upTo: 320, maxHours: [48, 72]},
  {upTo: Infinity, maxHours: [96]},
];

/** What the pizza bakes on: a home oven's tray, stone or steel, or a pizza oven. */
export type PizzaOven = 'tray' | 'stone' | 'steel' | 'pizzaOven';

export const PIZZA_OVENS: readonly PizzaOven[] = ['tray', 'stone', 'steel', 'pizzaOven'];

/** A pizza oven's thin pizza in a home oven, by what it bakes on: minutes at a temperature. */
export const HOME_OVEN_SETTINGS: Record<Exclude<PizzaOven, 'pizzaOven'>, BakeSetting[]> = {
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

/** The usual small, medium and large pizza in cm. */
export const PIZZA_DIAMETERS: readonly number[] = [26, 30, 36];
