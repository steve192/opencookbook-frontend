import {asRawInputs, RawInputs, readBoolean, readChoice, readNumber} from '../inputs';
import {median, medianRange, midpoint, Range} from '../sources';
import {Accompaniment, ACCOMPANIMENTS, COURSES, Course, DRINKINGS, Drinking, DRINKS, ENERGY, EXTRA_COURSES,
  FILLER_COURSES, FILLERS, GUEST_GROUPS, GuestGroup, ItemData, MENUS, PARTY_EVENTS, PartyEvent, PartyItem,
  PICKLE_JARS_PER_GUEST, RESERVE, SHARE_PER_DISH, WITHOUT_EXTRA_COURSE} from './partyData';

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
  /** Dishes per course on the table. */
  dishes: number;
  reserve: boolean;
  /** % of adults drinking beer and wine; above 100 together, some drink both. */
  beerShare: number;
  wineShare: number;
  drinking: Drinking;
}

export interface PartyLine {
  item: PartyItem;
  course: Course;
  grams: number;
  /** Each dish of a course with several, when there are. */
  gramsPerDish?: number;
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
 * How much a guest of a group eats compared with an average adult: their energy needs, relative to the
 * mean of men and women.
 *
 * @param {GuestGroup} group the group
 * @return {number} the factor
 */
export const appetiteFactor = (group: GuestGroup): number => energy(group) / ((energy('men') + energy('women')) / 2);

/**
 * The courses an event serves that the host can switch on and off; a raclette's sides are its accompaniments.
 *
 * @param {PartyEvent} event the event
 * @return {Course[]} its courses, in menu order
 */
export const coursesOf = (event: PartyEvent): Course[] =>
  COURSES.filter((course) => MENUS[event].some((data) => data.course === course && !data.accompaniment));

export const DEFAULT_PARTY_INPUTS: PartyInputs = {
  event: 'buffet',
  timeOfDay: 'evening',
  hours: 4,
  guests: {men: 5, women: 5, teens: 0, children: 2},
  meatFree: 0,
  appetite: 'normal',
  courses: [...COURSES],
  accompaniments: ['potatoes', 'vegetables', 'pickles'],
  dishes: 1,
  reserve: true,
  beerShare: 50,
  wineShare: 30,
  drinking: 'normal',
};

const knownOf = <T, >(raw: unknown, known: readonly T[], fallback: T[]): T[] =>
  Array.isArray(raw) ? known.filter((value) => (raw as unknown[]).includes(value)) : fallback;

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
    dishes: Math.round(readNumber(fields, 'dishes', d.dishes, 1, 10)),
    reserve: readBoolean(fields, 'reserve', d.reserve),
    beerShare: readNumber(fields, 'beerShare', d.beerShare, 0, 100),
    wineShare: readNumber(fields, 'wineShare', d.wineShare, 0, 100),
    drinking: readChoice(fields, 'drinking', DRINKINGS, d.drinking),
  };
};

const served = (data: ItemData, inputs: PartyInputs) => data.accompaniment ?
  inputs.accompaniments.includes(data.accompaniment) : inputs.courses.includes(data.course);

/**
 * Grams per adult of each item served, before guests, reserve and dishes. Without an extra course the fillers grow;
 * a filler course left out passes its amount to the fillers served, in proportion. Two raclette bases share.
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

  const isFiller = (data: ItemData) => FILLER_COURSES.includes(data.course) && !data.accompaniment;
  const servedFillers = amounts.filter(({data}) => isFiller(data) && served(data, inputs));
  const leftOut = amounts.filter(({data}) => isFiller(data) && !served(data, inputs))
      .reduce((sum, {grams}) => sum + grams, 0);
  const servedTotal = servedFillers.reduce((sum, {grams}) => sum + grams, 0);
  const bases = amounts.filter(({data}) => data.base && served(data, inputs)).length;

  return amounts.filter(({data}) => served(data, inputs)).map(({data, grams}) => {
    const passedOn = isFiller(data) && servedTotal > 0 ? leftOut * grams / servedTotal : 0;
    const shared = data.base && bases > 1 ? SHARE_PER_DISH / bases : 1;
    return {data, grams: (grams + passedOn) * shared};
  });
};

/**
 * The drinks for a party: one allowance of alcohol per adult who drinks, as beer, as wine or split between both,
 * drunk instead of soft drinks. Shares above 100 % together mean that many adults drink both.
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
  const thirst = inputs.hours * median(DRINKS.softDrinksPerHour)!;

  // Each kind of adult, by share: what they drink instead of soft drinks.
  const drinkers = [
    {share: beerShare - both, alcohol: allowance},
    {share: wineShare - both, alcohol: allowance / beerPerWine},
    {share: both, alcohol: allowance / 2 + allowance / 2 / beerPerWine},
    {share: 1 - beerShare - wineShare + both, alcohol: 0},
  ];
  const adultSoftDrinks = drinkers.reduce((sum, kind) => sum + kind.share * Math.max(0, thirst - kind.alcohol), 0);
  return {
    softDrinks: (guests - adults) * thirst + adults * adultSoftDrinks,
    water: guests * median(DRINKS.water)!,
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
      .map(({data, grams}): PartyLine => {
        const eaters = data.item === 'vegetarianMain' ? meatFreeShare : data.meat ? 1 - meatFreeShare : 1;
        const total = adultEquivalents * eaters * grams * reserve;
        return {item: data.item, course: data.course, grams: total,
          gramsPerDish: inputs.dishes > 1 ? Math.min(total, total / inputs.dishes * SHARE_PER_DISH) : undefined};
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
