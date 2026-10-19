/** Amounts per adult guest for one meal, and drinks per hour, as published planning guides give them. */
import {Range} from '../sources';

export type PartyEvent = 'buffet' | 'platedDinner' | 'fingerFood' | 'bbq' | 'raclette' | 'cheeseFondue';

export const PARTY_EVENTS: readonly PartyEvent[] = ['buffet', 'platedDinner', 'fingerFood', 'bbq', 'raclette',
  'cheeseFondue'];

export type Course = 'starter' | 'main' | 'sides' | 'salad' | 'bread' | 'dessert';

export const COURSES: readonly Course[] = ['starter', 'main', 'sides', 'salad', 'bread', 'dessert'];

export type PartyItem = 'coldStarters' | 'meat' | 'vegetarianMain' | 'grillMeat' | 'warmSides' | 'salad' | 'vegetables' |
  'bread' | 'dessert' | 'racletteCheese' | 'racletteMeat' | 'potatoes' | 'racletteBread' | 'fondueCheese' |
  'fondueBread';

/** What a raclette is eaten with, picked by the host instead of a course. */
export type Accompaniment = 'potatoes' | 'bread' | 'vegetables' | 'meat' | 'pickles';

export const ACCOMPANIMENTS: readonly Accompaniment[] = ['potatoes', 'bread', 'vegetables', 'meat', 'pickles'];

export interface ItemData {
  item: PartyItem;
  course: Course;
  /** Grams per adult for one meal, for an evening and for lunch. */
  evening: Range[];
  lunch?: Range[];
  /** Replaced by the vegetarian main for guests who eat no meat. */
  meat?: boolean;
  /** Served only when the host picks it. */
  accompaniment?: Accompaniment;
  /** One of raclette's two bases; served together, they share like dishes of a course. */
  base?: boolean;
}

/** Bread to dip in cheese, from three cheese fondue guides. */
const CHEESE_BREAD: Range[] = [{low: 150, high: 200}, {low: 200, high: 200}, {low: 250, high: 250}];

const VEGETARIAN_MAIN: ItemData = {item: 'vegetarianMain', course: 'main', evening: [{low: 150, high: 200}],
  lunch: [{low: 150, high: 180}]};

export const MENUS: Record<PartyEvent, ItemData[]> = {
  buffet: [
    {item: 'coldStarters', course: 'starter', evening: [{low: 80, high: 120}], lunch: [{low: 60, high: 100}]},
    {item: 'meat', course: 'main', meat: true, evening: [{low: 200, high: 250}], lunch: [{low: 180, high: 220}]},
    VEGETARIAN_MAIN,
    {item: 'warmSides', course: 'sides', evening: [{low: 150, high: 200}], lunch: [{low: 130, high: 180}]},
    {item: 'salad', course: 'salad', evening: [{low: 150, high: 200}], lunch: [{low: 150, high: 200}]},
    {item: 'bread', course: 'bread', evening: [{low: 80, high: 100}], lunch: [{low: 80, high: 120}]},
    {item: 'dessert', course: 'dessert', evening: [{low: 80, high: 120}], lunch: [{low: 60, high: 100}]},
  ],
  // The calculator's seated evening menu; lunch is 0.9 of it.
  platedDinner: [
    {item: 'coldStarters', course: 'starter', evening: [{low: 150, high: 150}], lunch: [{low: 135, high: 135}]},
    {item: 'meat', course: 'main', meat: true, evening: [{low: 250, high: 250}], lunch: [{low: 225, high: 225}]},
    VEGETARIAN_MAIN,
    {item: 'warmSides', course: 'sides', evening: [{low: 200, high: 200}], lunch: [{low: 180, high: 180}]},
    {item: 'salad', course: 'salad', evening: [{low: 120, high: 120}], lunch: [{low: 108, high: 108}]},
    {item: 'dessert', course: 'dessert', evening: [{low: 120, high: 120}], lunch: [{low: 108, high: 108}]},
  ],
  fingerFood: [
    {item: 'coldStarters', course: 'starter', evening: [{low: 100, high: 150}]},
    {item: 'meat', course: 'main', meat: true, evening: [{low: 120, high: 150}]},
    {item: 'vegetarianMain', course: 'main', evening: [{low: 100, high: 120}]},
    {item: 'warmSides', course: 'sides', evening: [{low: 80, high: 100}]},
    {item: 'salad', course: 'salad', evening: [{low: 80, high: 100}]},
    {item: 'bread', course: 'bread', evening: [{low: 60, high: 80}]},
    {item: 'dessert', course: 'dessert', evening: [{low: 60, high: 80}]},
  ],
  bbq: [
    {item: 'grillMeat', course: 'main', meat: true, evening: [{low: 250, high: 450}, {low: 300, high: 300},
      {low: 300, high: 350}, {low: 250, high: 300}, {low: 300, high: 350}, {low: 300, high: 300}]},
    VEGETARIAN_MAIN,
    // All salads together; the grill calculator gives 150 g salad and 200 g potato or pasta salad.
    {item: 'salad', course: 'salad', evening: [{low: 250, high: 250}, {low: 250, high: 250}, {low: 350, high: 350}]},
    {item: 'vegetables', course: 'sides', evening: [{low: 100, high: 100}]},
    {item: 'bread', course: 'bread', evening: [{low: 80, high: 100}]},
    {item: 'dessert', course: 'dessert', evening: [{low: 80, high: 120}]},
  ],
  // Cheese 200 to 250 g in most guides, 250 g at Raclette Suisse. Potatoes: 150 to 200 g, 175 to 250 g, 150 g,
  // 200 to 300 g, 250 g. Meat or fish: 120 to 200 g, 100 to 150 g, 120 to 150 g (three more guides). Vegetables
  // such as mushrooms, onions or peppers: 150 to 200 g in two guides. Raclette Suisse names bread as the
  // alternative to potatoes without an amount, so bread is the cheese fondue's, which carries the cheese the same way.
  raclette: [
    {item: 'racletteCheese', course: 'main', evening: [{low: 150, high: 250}, {low: 200, high: 250},
      {low: 200, high: 250}, {low: 150, high: 250}, {low: 200, high: 250}, {low: 250, high: 250},
      {low: 200, high: 250}, {low: 200, high: 250}]},
    {item: 'racletteMeat', course: 'main', meat: true, accompaniment: 'meat',
      evening: [{low: 120, high: 200}, {low: 100, high: 150}, {low: 120, high: 150}, {low: 120, high: 150},
        {low: 120, high: 150}]},
    {item: 'potatoes', course: 'sides', accompaniment: 'potatoes', base: true,
      evening: [{low: 150, high: 200}, {low: 175, high: 250}, {low: 150, high: 150}, {low: 200, high: 300},
        {low: 250, high: 250}]},
    {item: 'racletteBread', course: 'sides', accompaniment: 'bread', base: true, evening: CHEESE_BREAD},
    {item: 'vegetables', course: 'sides', accompaniment: 'vegetables',
      evening: [{low: 150, high: 200}, {low: 150, high: 200}]},
    {item: 'dessert', course: 'dessert', evening: [{low: 80, high: 120}]},
  ],
  cheeseFondue: [
    {item: 'fondueCheese', course: 'main', evening: [{low: 200, high: 250}, {low: 200, high: 200}]},
    {item: 'fondueBread', course: 'bread', evening: CHEESE_BREAD},
    {item: 'salad', course: 'salad', evening: [{low: 150, high: 200}]},
    {item: 'dessert', course: 'dessert', evening: [{low: 80, high: 120}]},
  ],
};

/** Planned on top, for seconds and leftovers. */
export const RESERVE: Range = {low: 0.10, high: 0.15};

/** A dish of several in a course gets 1.5 times its even share; the course total stays the same. */
export const SHARE_PER_DISH: number = 1.5;

/** The extra courses: a meal without one of them gets bigger fillers. */
export const EXTRA_COURSES: readonly Course[] = ['starter', 'dessert'];

/** The courses that fill the plate beside the main; one left out passes its amount to the others. */
export const FILLER_COURSES: readonly Course[] = ['sides', 'salad', 'bread'];

export type Filler = 'starch' | 'vegetables';

export const FILLERS: Partial<Record<PartyItem, Filler>> = {
  warmSides: 'starch', potatoes: 'starch', bread: 'starch', racletteBread: 'starch', fondueBread: 'starch',
  salad: 'vegetables', vegetables: 'vegetables',
};

/**
 * How much bigger fillers get without a starter or dessert: the Verbraucherzentrale's portion planner per adult,
 * two courses against three. Potatoes 200 against 150 g, pasta 150 against 120 g, rice 50 against 40 g; cooked
 * vegetables 200 against 150 g, raw 100 against 100 g, leaf salad 50 against 30 g. Bread counts as a starch, as the
 * planner calls it a filling side. Without both, a one-course menu, the fillers stay as with one.
 */
export const WITHOUT_EXTRA_COURSE: Record<Filler, number[]> = {
  starch: [200 / 150, 150 / 120, 50 / 40],
  vegetables: [200 / 150, 100 / 100, 50 / 30],
};

/** Jars of gherkins and of silver onions per guest at a raclette: a jar of each for four. */
export const PICKLE_JARS_PER_GUEST: number[] = [1 / 4];

export type Drinking = 'little' | 'normal' | 'aLot';

export const DRINKINGS: readonly Drinking[] = ['little', 'normal', 'aLot'];

export const DRINKS = {
  /** Litres per guest and hour that are not water; drinkers drink their alcohol out of it. */
  softDrinksPerHour: [0.4, 0.5],
  /** Litres of water per guest on top. */
  water: [0.5, 0.5],
  /**
   * What one drinker drinks, as litres of beer: the first hour, then each further hour; the drinks calculator gives
   * 0.3 every hour. Wine drinkers drink the same alcohol as wine.
   */
  beerFirstHour: [0.5, 0.3],
  beerPerHour: [0.3, 0.3],
  /** Against normal drinkers: three drinks calculators' light and heavy drinkers. */
  drinking: {little: [0.7, 0.75, 1 / 1.5], normal: [1], aLot: [1.4, 1.5, 2 / 1.5]} as Record<Drinking, number[]>,
  /** Litres of beer with the alcohol of a litre of wine: a standard glass is 0.25 l beer (10 g) or 0.1 l wine (9 g). */
  beerPerWine: [(0.25 / 10) / (0.1 / 9)],
};

export type GuestGroup = 'men' | 'women' | 'teens' | 'children';

export const GUEST_GROUPS: readonly GuestGroup[] = ['men', 'women', 'teens', 'children'];

/** Energy reference values at PAL 1.6 in kcal per day, for the age bands each group spans. */
export const ENERGY: Record<GuestGroup, number[]> = {
  men: [2800, 2700, 2500],
  women: [2200, 2100, 2000],
  // 13 to under 19: boys and girls.
  teens: [2600, 3000, 2200, 2300],
  // 4 to under 13: boys and girls.
  children: [1600, 1900, 2200, 1500, 1800, 2000],
};
