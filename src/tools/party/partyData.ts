/** Amounts per adult guest for one meal, and drinks per hour, as published planning guides give them. */
import {Range} from '../sources';

export type PartyEvent = 'buffet' | 'platedDinner' | 'fingerFood' | 'bbq' | 'raclette' | 'cheeseFondue';

export const PARTY_EVENTS: readonly PartyEvent[] = ['buffet', 'platedDinner', 'fingerFood', 'bbq', 'raclette',
  'cheeseFondue'];

export type Course = 'starter' | 'main' | 'sides' | 'salad' | 'bread' | 'dessert';

export const COURSES: readonly Course[] = ['starter', 'main', 'sides', 'salad', 'bread', 'dessert'];

/** What the warm sides are, picked by the host; potatoes are the course's measure. */
export type Starch = 'potatoes' | 'pasta' | 'rice';

export const STARCHES: readonly Starch[] = ['potatoes', 'pasta', 'rice'];

/** What the vegetables are, picked by the host; vegetables to cook are the course's measure. */
export type Vegetable = 'vegetablesToCook' | 'rawVegetables' | 'leafSalad';

export const VEGETABLES: readonly Vegetable[] = ['vegetablesToCook', 'rawVegetables', 'leafSalad'];

/**
 * Items of a menu. `warmSides` and `salad` are courses, served as the starches and vegetables the host picks; every
 * other item is bought as it is.
 */
export type PartyItem = 'coldStarters' | 'meat' | 'vegetarianMain' | 'grillMeat' | 'warmSides' | 'salad' | 'bbqSalads' |
  'vegetables' | 'bread' | 'dessert' | 'racletteCheese' | 'racletteMeat' | 'racletteBread' | 'fondueCheese' |
  'fondueBread' | Starch | Vegetable;

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

const exactly = (value: number): Range => ({low: value, high: value});

/** Bread to dip in cheese, from three cheese fondue guides. */
const CHEESE_BREAD: Range[] = [{low: 150, high: 200}, {low: 200, high: 200}, {low: 250, high: 250}];

const VEGETARIAN_MAIN: ItemData = {item: 'vegetarianMain', course: 'main', evening: [{low: 150, high: 200}],
  lunch: [{low: 150, high: 180}]};

/** A potato side, raw, from six portion guides (§15.17); also a plated dinner's. */
const POTATO_SIDE: Range[] = [{low: 175, high: 200}, {low: 200, high: 250}, exactly(200), exactly(200),
  {low: 150, high: 200}, {low: 140, high: 200}];

/** A side of vegetables to cook, raw and cleaned, from five portion guides. */
const VEGETABLE_SIDE: Range[] = [{low: 200, high: 250}, exactly(200), exactly(200), {low: 150, high: 200},
  {low: 150, high: 200}];

/** Desserts: two party calculators and three portion guides. */
const DESSERT: Range[] = [{low: 80, high: 120}, exactly(120), {low: 100, high: 150}, {low: 100, high: 150},
  exactly(100)];

/**
 * A seated lunch is 0.9 of the evening, as in the party calculator.
 *
 * @param {Range[]} ranges the evening's amounts
 * @return {Range[]} lunch's
 */
const atLunch = (ranges: Range[]): Range[] => ranges.map((range) => ({low: range.low * 0.9, high: range.high * 0.9}));

const PLATED = {
  starter: [exactly(150), exactly(150)],
  meat: [exactly(250), exactly(100), {low: 125, high: 200}, {low: 150, high: 200}, {low: 150, high: 200},
    {low: 150, high: 200}],
  // The calculator's 200 g and the Verbraucherzentrale's 150 g for three courses, beside the portion guides.
  sides: [exactly(200), exactly(150), ...POTATO_SIDE.slice(0, 2), ...POTATO_SIDE.slice(4)],
  vegetables: [exactly(120), exactly(150), ...VEGETABLE_SIDE.slice(0, 2), ...VEGETABLE_SIDE.slice(3)],
  dessert: [exactly(120), exactly(100), {low: 100, high: 150}, {low: 100, high: 150}],
};

export const MENUS: Record<PartyEvent, ItemData[]> = {
  // Three party calculators and buffet guides, with the portion guides' sides (§15.17); lunch only from the first.
  buffet: [
    {item: 'coldStarters', course: 'starter', evening: [{low: 80, high: 120}, exactly(150)],
      lunch: [{low: 60, high: 100}]},
    {item: 'meat', course: 'main', meat: true, evening: [{low: 200, high: 250}, exactly(250), {low: 175, high: 250},
      {low: 250, high: 300}], lunch: [{low: 180, high: 220}]},
    VEGETARIAN_MAIN,
    {item: 'warmSides', course: 'sides', evening: [{low: 150, high: 200}, exactly(200), {low: 200, high: 250},
      ...POTATO_SIDE], lunch: [{low: 130, high: 180}]},
    {item: 'salad', course: 'salad', evening: [{low: 150, high: 200}, exactly(120), {low: 100, high: 150},
      ...VEGETABLE_SIDE], lunch: [{low: 150, high: 200}]},
    {item: 'bread', course: 'bread', evening: [{low: 80, high: 100}, {low: 50, high: 80}, {low: 50, high: 100}],
      lunch: [{low: 80, high: 120}]},
    {item: 'dessert', course: 'dessert', evening: DESSERT, lunch: [{low: 60, high: 100}]},
  ],
  // A seated menu: the party calculator's, the Verbraucherzentrale's three courses and the portion guides.
  platedDinner: [
    {item: 'coldStarters', course: 'starter', evening: PLATED.starter, lunch: atLunch(PLATED.starter)},
    {item: 'meat', course: 'main', meat: true, evening: PLATED.meat, lunch: atLunch(PLATED.meat)},
    VEGETARIAN_MAIN,
    {item: 'warmSides', course: 'sides', evening: PLATED.sides, lunch: atLunch(PLATED.sides)},
    {item: 'salad', course: 'salad', evening: PLATED.vegetables, lunch: atLunch(PLATED.vegetables)},
    {item: 'dessert', course: 'dessert', evening: PLATED.dessert, lunch: atLunch(PLATED.dessert)},
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
    {item: 'bbqSalads', course: 'salad', evening: [{low: 250, high: 250}, {low: 250, high: 250},
      {low: 350, high: 350}]},
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
  salad: 'vegetables', bbqSalads: 'vegetables', vegetables: 'vegetables',
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

/**
 * A side per adult in grams as bought, raw or dry, from portion guides (§15.17): the Baden-Württemberg ministry's
 * portion planner, pastaweb, rechner-portal.de, the Verbraucherzentrale's planner, heidelberg24 and Pyrex. Each food
 * replaces the course's measure in the ratio of these medians, so the plate holds about as much: cooked, 70 g pasta
 * and 60 g rice weigh about as much as 194 g potatoes.
 */
export const SIDE_PORTIONS: Record<Starch | Vegetable, number[]> = {
  potatoes: [187.5, 225, 200, 200, 175, 170],
  pasta: [70, 90, 65, 150, 70, 70],
  rice: [70, 70, 60, 50, 60, 60],
  vegetablesToCook: [225, 200, 200, 175, 175],
  // The planner's 100 g, the ministry's 200 to 250 g and a raw salad of 850 g vegetables for four.
  rawVegetables: [225, 100, 850 / 4],
  leafSalad: [60, 45, 50],
};

/**
 * What a child of 4 to 12 eats against an adult, by the party calculators and guides: 50 to 60 %, a half to two
 * thirds, 700 against 1000 g, 400 against 700 g. Counted with the energy reference values' ratio.
 */
export const CHILDREN_OF_ADULT: number[] = [0.55, (1 / 2 + 2 / 3) / 2, 0.7, 400 / 700];

export const DRINKS = {
  /**
   * Litres per guest and hour in all, water and alcohol included: the drinks calculator's half litre. Drinkers drink
   * their alcohol out of it.
   */
  perHour: [0.5],
  /**
   * The water's share of what is not alcohol: 60 % in the drinks calculator, at least half in a caterer's guide, and
   * 0.5 l of water against 0.4 l of other drinks an hour over four hours at a grocer's.
   */
  waterShare: [0.6, 0.5, 0.5 / (0.5 + 4 * 0.4)],
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
