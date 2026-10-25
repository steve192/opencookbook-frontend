import {asRawInputs, RawInputs, readBoolean, readChoice, readNumber} from '../inputs';
import {median, medianRange, midpoint, Range, requiredMedian} from '../numbers';
import {Accompaniment, ACCOMPANIMENTS, CHILDREN_OF_ADULT, Course, COURSES, Drinking, DRINKINGS, DRINKS, ENERGY,
  EXTRA_COURSES, FILLERS, GUEST_GROUPS, GuestGroup, ItemData, MENUS, PARTY_EVENTS, PartyEvent, PartyItem,
  PICKLE_JARS_PER_GUEST, RESERVE, SHARE_PER_DISH, SIDE_COURSES, SIDE_PORTIONS, Starch, STARCHES, Vegetable,
  VEGETABLES, WITHOUT_EXTRA_COURSE} from './partyData';

export type Appetite = 'light' | 'normal' | 'hearty';

export const APPETITES: readonly Appetite[] = ['light', 'normal', 'hearty'];

export interface PartyInputs {
  event: PartyEvent;
  timeOfDay: 'lunch' | 'evening';
  hours: number;
  guests: Record<GuestGroup, number>;
  /** Guests who eat no meat, out of all guests. */
  meatFree: number;
  appetite: Appetite;
  courses: Course[];
  /** What a raclette is eaten with. */
  accompaniments: Accompaniment[];
  /** What the warm sides and the vegetables are; never empty. */
  starches: Starch[];
  vegetables: Vegetable[];
  /** Dishes per course on the table. */
  dishes: number;
  reserve: boolean;
  /** % of adults drinking beer and wine; above 100 together, some drink both. */
  beerShare: number;
  wineShare: number;
  drinking: Drinking;
}

/** The courses served as what the host picks. */
type ChosenCourse = 'warmSides' | 'salad';

export interface PartyLine {
  item: Exclude<PartyItem, ChosenCourse>;
  course: Course;
  grams: number;
  /** Each dish of a course with several, when there are. */
  gramsPerDish?: number;
  /** Starters and desserts, as servings of what an adult eats. */
  servings?: {count: number, grams: number};
}

export interface PartyResult {
  /** Guests counted as average adults. */
  adultEquivalents: number;
  food: PartyLine[];
  /** Jars of gherkins and of silver onions each; 0 without them. */
  pickleJars: number;
  /** Litres. */
  softDrinks: number;
  water: number;
  beer: number;
  wine: number;
}

export const BEER_BOTTLE_L = 0.5;
export const WINE_BOTTLE_L = 0.75;

const PICK: Record<Appetite, (range: Range) => number> = {
  light: (range) => range.low,
  normal: midpoint,
  hearty: (range) => range.high,
};

const energy = (group: GuestGroup) => median(ENERGY[group])!;

/**
 * How much a guest of a group eats compared with an average adult: their energy needs, relative to the mean of men
 * and women; for children together with what children eat against adults.
 *
 * @param {GuestGroup} group the group
 * @return {number} the factor
 */
export const appetiteFactor = (group: GuestGroup): number => {
  const byEnergy = energy(group) / ((energy('men') + energy('women')) / 2);
  return group === 'children' ? requiredMedian([byEnergy, ...CHILDREN_OF_ADULT], 'a child\'s share') : byEnergy;
};

/**
 * The courses an event serves that the host can switch on and off; a raclette's sides are its accompaniments.
 *
 * @param {PartyEvent} event the event
 * @return {Course[]} its courses, in menu order
 */
export const coursesOf = (event: PartyEvent): Course[] =>
  COURSES.filter((course) => MENUS[event].some((data) => data.course === course && !data.accompaniment));

/**
 * Whether the main is served with nothing to fill the plate beside it, though the event has such courses: then it is
 * planned as one dish among several, which is too little if it is all there is.
 *
 * @param {PartyInputs} inputs the party
 * @return {boolean} whether the main stands alone
 */
export const mainStandsAlone = (inputs: PartyInputs): boolean => {
  const sides = coursesOf(inputs.event).filter((course) => SIDE_COURSES.includes(course));
  return inputs.courses.includes('main') && sides.length > 0 && !sides.some((course) => inputs.courses.includes(course));
};

export const DEFAULT_PARTY_INPUTS: PartyInputs = {
  event: 'buffet',
  timeOfDay: 'evening',
  hours: 4,
  guests: {men: 5, women: 5, teens: 0, children: 2},
  meatFree: 0,
  appetite: 'normal',
  courses: [...COURSES],
  accompaniments: ['potatoes', 'vegetables', 'pickles'],
  starches: ['potatoes'],
  vegetables: ['vegetablesToCook', 'leafSalad'],
  dishes: 1,
  reserve: true,
  beerShare: 50,
  wineShare: 30,
  drinking: 'normal',
};

const knownOf = <T, >(raw: unknown, known: readonly T[], fallback: T[]): T[] =>
  Array.isArray(raw) ? known.filter((value) => (raw as unknown[]).includes(value)) : fallback;

const someOf = <T, >(raw: unknown, known: readonly T[], fallback: T[]): T[] => {
  const chosen = knownOf(raw, known, fallback);
  return chosen.length > 0 ? chosen : fallback;
};

export const parsePartyInputs = (raw: unknown): PartyInputs => {
  const fields = asRawInputs(raw);
  const d = DEFAULT_PARTY_INPUTS;
  const guests = asRawInputs(fields.guests) as RawInputs;
  return {
    event: readChoice(fields, 'event', PARTY_EVENTS, d.event),
    timeOfDay: readChoice(fields, 'timeOfDay', ['lunch', 'evening'] as const, d.timeOfDay),
    hours: readNumber(fields, 'hours', d.hours, 1, 24),
    guests: Object.fromEntries(GUEST_GROUPS.map((group) =>
      [group, Math.round(readNumber(guests, group, d.guests[group], 0, 1000))])) as Record<GuestGroup, number>,
    meatFree: Math.round(readNumber(fields, 'meatFree', d.meatFree, 0, 4000)),
    appetite: readChoice(fields, 'appetite', APPETITES, d.appetite),
    courses: knownOf(fields.courses, COURSES, d.courses),
    accompaniments: knownOf(fields.accompaniments, ACCOMPANIMENTS, d.accompaniments),
    starches: someOf(fields.starches, STARCHES, d.starches),
    vegetables: someOf(fields.vegetables, VEGETABLES, d.vegetables),
    dishes: Math.round(readNumber(fields, 'dishes', d.dishes, 1, 10)),
    reserve: readBoolean(fields, 'reserve', d.reserve),
    beerShare: readNumber(fields, 'beerShare', d.beerShare, 0, 100),
    wineShare: readNumber(fields, 'wineShare', d.wineShare, 0, 100),
    drinking: readChoice(fields, 'drinking', DRINKINGS, d.drinking),
  };
};

/**
 * A side of a food per adult, raw or dry.
 *
 * @param {Starch | Vegetable} food the food
 * @return {number} grams
 */
export const portion = (food: Starch | Vegetable): number =>
  requiredMedian(SIDE_PORTIONS[food], `a side of ${food}`);

/**
 * Whether an event serves warm sides and vegetables the host picks.
 *
 * @param {PartyEvent} event the event
 * @return {object} for each, whether its menu has it
 */
export const choosableSides = (event: PartyEvent) => ({
  starches: MENUS[event].some((data) => data.item === 'warmSides'),
  vegetables: MENUS[event].some((data) => data.item === 'salad'),
});

/**
 * The foods a course is served as, each with its share of the course in its own weight: what replaces the course's
 * measure on the plate, and with several, 1.5 times an even share each, as dishes of a course.
 *
 * @param {ChosenCourse} item the course
 * @param {PartyInputs} inputs the party
 * @return {Array} the foods
 */
const servedAs = (item: ChosenCourse, inputs: PartyInputs): {food: Starch | Vegetable, factor: number}[] => {
  const course = item === 'warmSides' ? {measure: 'potatoes' as const, foods: inputs.starches} :
    {measure: 'vegetablesToCook' as const, foods: inputs.vegetables};
  const share = course.foods.length > 1 ? SHARE_PER_DISH / course.foods.length : 1;
  return course.foods.map((food) => ({food, factor: portion(food) / portion(course.measure) * share}));
};

/** Courses a host plans as servings of a recipe. */
const IN_SERVINGS: readonly Course[] = ['starter', 'dessert'];

const served = (data: ItemData, inputs: PartyInputs) => data.accompaniment ?
  inputs.accompaniments.includes(data.accompaniment) : inputs.courses.includes(data.course);

/**
 * Grams per adult of each item served, before guests, reserve and dishes. Without an extra course the fillers grow.
 * A filler course left out is just not served: fewer dishes are eaten less of. Two raclette bases share.
 *
 * @param {PartyInputs} inputs the party
 * @return {Array} each item served with its grams per adult
 */
const perAdult = (inputs: PartyInputs): {data: ItemData, grams: number}[] => {
  const menu = MENUS[inputs.event];
  const offered = coursesOf(inputs.event);
  const missesExtra = EXTRA_COURSES.some((course) => offered.includes(course) && !inputs.courses.includes(course));
  const amounts = menu.map((data) => {
    const ranges = inputs.timeOfDay === 'lunch' && data.lunch ? data.lunch : data.evening;
    const filler = FILLERS[data.item];
    const growth = missesExtra && filler ? median(WITHOUT_EXTRA_COURSE[filler])! : 1;
    return {data, grams: PICK[inputs.appetite](medianRange(ranges)) * growth};
  });

  const bases = amounts.filter(({data}) => data.base && served(data, inputs)).length;
  return amounts.filter(({data}) => served(data, inputs)).map(({data, grams}) => {
    const shared = data.base && bases > 1 ? SHARE_PER_DISH / bases : 1;
    return {data, grams: grams * shared};
  });
};

/**
 * The drinks for a party: half a litre per guest and hour in all, and one allowance of alcohol per adult who drinks,
 * as beer, as wine or split between both, drunk instead of water and soft drinks. Shares above 100 % together mean
 * that many adults drink both.
 *
 * @param {PartyInputs} inputs the party
 * @return {object} litres of soft drinks, water, beer and wine
 */
const planDrinks = (inputs: PartyInputs) => {
  const guests = GUEST_GROUPS.reduce((sum, group) => sum + inputs.guests[group], 0);
  const adults = inputs.guests.men + inputs.guests.women;
  const beerShare = inputs.beerShare / 100;
  const wineShare = inputs.wineShare / 100;
  const both = Math.max(0, beerShare + wineShare - 1);
  const allowance = (median(DRINKS.beerFirstHour)! + Math.max(0, inputs.hours - 1) * median(DRINKS.beerPerHour)!) *
    median(DRINKS.drinking[inputs.drinking])!;
  const beerPerWine = median(DRINKS.beerPerWine)!;
  const allIn = inputs.hours * median(DRINKS.perHour)!;

  // Each kind of adult, by share: what they drink instead of soft drinks.
  const drinkers = [
    {share: beerShare - both, alcohol: allowance},
    {share: wineShare - both, alcohol: allowance / beerPerWine},
    {share: both, alcohol: allowance / 2 + allowance / 2 / beerPerWine},
    {share: 1 - beerShare - wineShare + both, alcohol: 0},
  ];
  const adultNonAlcoholic = drinkers.reduce((sum, kind) => sum + kind.share * Math.max(0, allIn - kind.alcohol), 0);
  const nonAlcoholic = (guests - adults) * allIn + adults * adultNonAlcoholic;
  const waterShare = median(DRINKS.waterShare)!;
  return {
    softDrinks: nonAlcoholic * (1 - waterShare),
    water: nonAlcoholic * waterShare,
    beer: adults * allowance * (beerShare - both / 2),
    wine: adults * allowance * (wineShare - both / 2) / beerPerWine,
  };
};

/**
 * What to buy for a party: food per item for one meal, and drinks for its hours.
 *
 * @param {PartyInputs} inputs the party
 * @return {PartyResult} the amounts
 */
export const planParty = (inputs: PartyInputs): PartyResult => {
  const guests = GUEST_GROUPS.reduce((sum, group) => sum + inputs.guests[group], 0);
  const adultEquivalents = GUEST_GROUPS.reduce((sum, group) => sum + inputs.guests[group] * appetiteFactor(group), 0);
  const meatFreeShare = guests > 0 ? Math.min(1, inputs.meatFree / guests) : 0;
  const reserve = 1 + (inputs.reserve ? midpoint(RESERVE) : 0);

  const food = perAdult(inputs)
      .flatMap(({data, grams}): PartyLine[] => {
        const eaters = data.item === 'vegetarianMain' ? meatFreeShare : data.meat ? 1 - meatFreeShare : 1;
        const total = adultEquivalents * eaters * grams * reserve;
        // The host's starches and vegetables are the course's dishes.
        if (data.item === 'warmSides' || data.item === 'salad') {
          return servedAs(data.item, inputs).map(({food, factor}) =>
            ({item: food, course: data.course, grams: total * factor}));
        }
        return [{item: data.item, course: data.course, grams: total,
          gramsPerDish: inputs.dishes > 1 ? Math.min(total, total / inputs.dishes * SHARE_PER_DISH) : undefined,
          ...(IN_SERVINGS.includes(data.course) ? {servings: {count: Math.ceil(total / grams), grams}} : {})}];
      })
      .filter((line) => line.grams > 0);

  const pickles = inputs.event === 'raclette' && inputs.accompaniments.includes('pickles');
  return {
    adultEquivalents,
    food,
    pickleJars: pickles ? adultEquivalents * median(PICKLE_JARS_PER_GUEST)! * reserve : 0,
    ...planDrinks(inputs),
  };
};
