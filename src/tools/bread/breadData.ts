/** Bread flours, salt and the rye sour as recipes give them. Ranges count as their middle, several values as their median. */
import {FRIDGE_C, ROOM_C} from '../dough/stages';
import {Stage, YeastRecipe} from '../fermentation/fermentation';

export type BreadFlour = 'type405' | 'type550' | 'type812' | 'type1050' | 'type1600' | 'wholeWheat' | 'wheatMeal' |
  'manitoba' | 'durum' | 'spelt630' | 'spelt812' | 'spelt1050' | 'speltWholegrain' | 'speltMeal' | 'rye815' |
  'rye997' | 'rye1150' | 'rye1370' | 'rye1740' | 'ryeWholegrain' | 'ryeMeal' | 'einkorn' | 'emmer' | 'barley' |
  'buckwheat' | 'millet' | 'quinoa' | 'amaranth' | 'teff';

export const BREAD_FLOURS: readonly BreadFlour[] = ['type550', 'type405', 'type812', 'type1050', 'type1600',
  'wholeWheat', 'wheatMeal', 'manitoba', 'durum', 'spelt630', 'spelt812', 'spelt1050', 'speltWholegrain', 'speltMeal',
  'rye815', 'rye997', 'rye1150', 'rye1370', 'rye1740', 'ryeWholegrain', 'ryeMeal', 'einkorn', 'emmer', 'barley',
  'buckwheat', 'millet', 'quinoa', 'amaranth', 'teff'];

export const RYE_FLOURS: readonly BreadFlour[] = ['rye815', 'rye997', 'rye1150', 'rye1370', 'rye1740', 'ryeWholegrain',
  'ryeMeal'];

export type Grain = 'wheat' | 'spelt' | 'rye';

/**
 * German flour types: the ash in mg per 100 g of dry matter. Whole grain flour and meal count as the meal's type
 * (Backschrot Type 1700 for wheat, 1800 for rye); whole spelt as wheat's.
 */
export const FLOUR_TYPES: Partial<Record<BreadFlour, {grain: Grain, type: number}>> = {
  type405: {grain: 'wheat', type: 405}, type550: {grain: 'wheat', type: 550}, type812: {grain: 'wheat', type: 812},
  type1050: {grain: 'wheat', type: 1050}, type1600: {grain: 'wheat', type: 1600},
  wholeWheat: {grain: 'wheat', type: 1700}, wheatMeal: {grain: 'wheat', type: 1700},
  spelt630: {grain: 'spelt', type: 630}, spelt812: {grain: 'spelt', type: 812}, spelt1050: {grain: 'spelt', type: 1050},
  speltWholegrain: {grain: 'spelt', type: 1700}, speltMeal: {grain: 'spelt', type: 1700},
  rye815: {grain: 'rye', type: 815}, rye997: {grain: 'rye', type: 997}, rye1150: {grain: 'rye', type: 1150},
  rye1370: {grain: 'rye', type: 1370}, rye1740: {grain: 'rye', type: 1740},
  ryeWholegrain: {grain: 'rye', type: 1800}, ryeMeal: {grain: 'rye', type: 1800},
};

/**
 * Water by flour type, in % of the flour, one list of [type, water] per source (the middle of each range): darker
 * flours take more. Rye 815 and 997 share one range, counted at their middle type, 906.
 */
export const TYPE_WATER: Record<Grain, [number, number][][]> = {
  wheat: [[[405, 55], [550, 55], [1050, 67.5], [1700, 77.5]], [[405, 67.5], [550, 67.5], [812, 72.5], [1050, 76],
    [1700, 82.5]]],
  spelt: [[[630, 57.5], [1050, 67.5], [1700, 77.5]], [[630, 67.5], [1700, 76.5]]],
  rye: [[[906, 70], [1150, 80], [1800, 90]], [[1150, 79], [1800, 87.5]]],
};

/** Water other flours take, in % of the flour: what bread recipes made with them give. */
export const RECIPE_WATER: Partial<Record<BreadFlour, number[]>> = {
  manitoba: [430 / 500 * 100, 380 / 550 * 100, 350 / 550 * 100, 475 / 500 * 100],
  durum: [375 / 500 * 100, 275 / 500 * 100, 400 / 500 * 100],
  einkorn: [62, 325 / 528 * 100],
  emmer: [380 / 500 * 100, 350 / 500 * 100],
};

/**
 * Grains with little or no gluten that replace wheat flour as it is, with a spoonful more liquid in larger shares, so
 * they take the water of wheat 405.
 */
export const LIKE_WHEAT_405: readonly BreadFlour[] = ['barley', 'buckwheat', 'millet', 'quinoa', 'amaranth', 'teff'];

/**
 * The most of a yeast bread's flour these grains make up, in %: at most 50 % ancient grains; at most a quarter barley.
 */
export const MAX_FLOUR_SHARE: Partial<Record<BreadFlour, number[]>> = {
  barley: [25, 50], buckwheat: [50], millet: [50], quinoa: [50], amaranth: [50], teff: [50],
};

/** Salt in % of the flour; the sources give it for bread in general, so every bread type uses it. */
export const BREAD_SALT: number[] = [1.9, 1.75];

/**
 * Rye needs acid: the share of its flour that goes into the sour, in %, from two recipes' grams and a bakery's table
 * (60 % rye 50, 70 % 40, 80 % and 90 % 35). The median is the usual; the lowest and highest are what a sour can be.
 */
export const RYE_ACIDIFIED: number[] = [300 / 900 * 100, 250 / 590 * 100, 50, 40, 35, 35];

/**
 * A one-stage sour, from the recipes' grams and times: as much water as flour, overnight. It ripens where the dough
 * goes, and its starter follows its hours as a dough's does; the recipes' 50 g starter on 300 g and on 250 g rye
 * check that (§15.17).
 */
export const SOUR = {
  hydration: [100, 100],
  hours: [14, 11],
};

/**
 * A soaker: seeds and grains with cool water for 3 to 20 h, overnight but at least 8 h, or 12 to 24 h; at most 45 to
 * 50 % of the dough.
 */
export const SOAKER = {
  hours: [11.5, 8, 18],
  maxShareOfFlour: [47.5],
};

/** The most fruit or vegetables the sample recipes use: 500 g puréed pumpkin on 500 g flour, in % of the flour. */
export const MAX_FRUIT_VEG_SHARE = 100;

/**
 * Baking a loaf with top and bottom heat, from bakers' guides, an oven maker's table and recipes: the oven to start
 * with; the lower one it drops to, and after how many minutes; and when it is done, at its core.
 */
export const BAKING = {
  startC: [225, 215, 230, 250, 220, 218, 232],
  lowerC: [195, 185, 180, 200, 180],
  lowerAfterMin: [12.5, 12.5, 10, 20, 10],
  coreC: [97, 98, 96, 96, 97, (207.5 - 32) / 1.8, 96.1],
};

/**
 * Minutes a loaf bakes, against its dough in g, from the same guides and recipes. Across them the time grows with
 * the square root of the weight.
 */
export const BAKE_MINUTES: [number, number][] = [[500, 37.5], [875, 47.5], [750, 42.5], [1500, 57.5], [1010, 47.5],
  [1240, 55], [591, 27.5], [900, 50], [1000, 32.5]];

/** Hours the shaped loaf proofs before it is baked, at room temperature, from the recipes. */
export const PROOF_HOURS: number[] = [1.5, 0.75, 1, 2.25, 0.5, 1 / 3];

/** Sets of stretch and folds in a wheat sourdough's bulk, 30 min apart. */
export const FOLD_SETS: number[] = [4, 4, 3, 3, 5.5];

/** Above this share of rye a bread is a rye bread (Leitsätze für Brot und Kleingebäck), and rye needs a sour. */
export const RYE_BREAD_SHARE = 50;

/** How a fruit or vegetable goes into the dough: raw, grated or in pieces, or cooked, in pieces or puréed. */
export type AdditionPreparation = 'raw' | 'cooked';

export const ADDITION_PREPARATIONS: readonly AdditionPreparation[] = ['raw', 'cooked'];

/**
 * The water a fruit's or vegetable's solids keep from the dough, in g per g: what each recipe leaves out of its
 * water, against the water its flour takes. Raw tissue keeps its cells' water: 80 g grated pumpkin on 430 g flour,
 * 150 g carrot on 500 g, 250 g beetroot on 600 g, 100 g carrot on 500 g whole spelt. Cooked tissue keeps less, and
 * cooked starch binds much: 500 g, 350 g, 300 g and 200 g puréed pumpkin; 400 g pressed potatoes on 500 g flour,
 * and two bakers' rules for mashed potato (no change to the water; 0.5 % more water per 1 % potato).
 */
export const SOLIDS_KEEP = {
  raw: [6.97, 7.92, 7.24, 6.42],
  cookedSolids: [3.5, 1.12, 0.96, 0.13],
  cookedStarch: [4.21, 4.44, 2.71],
};

/**
 * Yeast breads the model is calibrated on: overnight, 0.08 % instant yeast, 12 to 14 h bulk and the proof at
 * about 20 °C; same day, 0.4 % instant, 5 h bulk and the proof at about 23 °C; no-knead, 1 g instant yeast for
 * 430 g, about 18 h at about 21 °C, 15 min and 2 h; quick, half a 42 g cube for 500 g, 1 h and 30 to 35 min
 * somewhere warm.
 */
export const YEAST_BREADS: readonly YeastRecipe[] = [
  {freshPercent: 0.08 * 3, stages: [{hours: 14.25, temperatureC: 20}]},
  {freshPercent: 0.4 * 3, stages: [{hours: 6.25, temperatureC: 23}]},
  {freshPercent: 1 * 3 / 430 * 100, stages: [{hours: 18 + 0.25 + 2, temperatureC: ROOM_C}]},
  {freshPercent: 21 / 500 * 100, stages: [{hours: 1 + 32.5 / 60, temperatureC: ROOM_C}]},
];

/** A published sourdough bread: its ripe starter (100 % hydration) in % of all the flour, and its schedule. */
export interface SourdoughBread {
  starterPercent: number;
  stages: Stage[];
}

/**
 * The sourdough breads a starter's strength is calibrated on: 18.7 % ripe starter, 4 h 20 min bulk at 23.5 °C,
 * 16 h in the fridge at 3 °C; 454 g starter with 685 g flour, 20 min, 1 h, 1 h, 20 min and 2 to 2.5 h; 100 g
 * starter with 500 g flour, 1 h, 2 h of folds, 2 to 3 h, 15 min and 10 to 12 h in the fridge.
 */
export const SOURDOUGH_BREADS: readonly SourdoughBread[] = [
  {starterPercent: 18.7, stages: [{hours: 4.33, temperatureC: 23.5}, {hours: 16, temperatureC: 3}]},
  {starterPercent: 454 / (685 + 454 / 2) * 100, stages: [{hours: 1 / 3 + 1 + 1 + 1 / 3 + 2.25, temperatureC: ROOM_C}]},
  {starterPercent: 100 / (500 + 100 / 2) * 100,
    stages: [{hours: 1 + 2 + 2.5 + 0.25, temperatureC: ROOM_C}, {hours: 11, temperatureC: FRIDGE_C}]},
];
