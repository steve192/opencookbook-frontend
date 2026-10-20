import {describe, expect, it} from 'vitest';
import {median} from '../sources';
import {appetiteFactor, coursesOf, DEFAULT_PARTY_INPUTS, parsePartyInputs, PartyResult, planParty, portion} from './party';
import {PartyItem, Starch, Vegetable} from './partyData';

const party = (changes: Partial<typeof DEFAULT_PARTY_INPUTS>) => planParty({...DEFAULT_PARTY_INPUTS, ...changes});
const adults = (count: number) => ({men: count / 2, women: count / 2, teens: 0, children: 0});
const grams = (result: PartyResult, item: PartyItem) => result.food.find((line) => line.item === item)?.grams ?? 0;
const total = (result: PartyResult) => result.food.reduce((sum, line) => sum + line.grams, 0);
const plain = {reserve: false, appetite: 'normal' as const, dishes: 1, starches: ['potatoes'] as Starch[],
  vegetables: ['vegetablesToCook'] as Vegetable[]};

/**
 * Grams of pure alcohol: a standard glass is 0.25 l beer with 10 g or 0.1 l wine with 9 g.
 *
 * @param {PartyResult} result the party
 * @return {number} grams of alcohol in its beer and wine
 */
const alcohol =(result: PartyResult) => result.beer / 0.25 * 10 + result.wine / 0.1 * 9;

describe('appetiteFactor', () => {
  it('scales groups by the DGE energy reference values', () => {
    expect((appetiteFactor('men') + appetiteFactor('women')) / 2).toBeCloseTo(1);
    expect(appetiteFactor('men')).toBeGreaterThan(appetiteFactor('women'));
  });

  it('gives a child what party calculators give, about 0.58 of an adult, not the 0.77 of energy alone', () => {
    expect(appetiteFactor('children')).toBeCloseTo((1 / 2 + 2 / 3) / 2);
  });
});

describe('food', () => {
  it('plans a buffet main of 225 to 250 g per adult in the evening, from four buffet sources', () => {
    expect(grams(party({guests: adults(10), reserve: false, appetite: 'light'}), 'meat')).toBeCloseTo(2250);
    expect(grams(party({guests: adults(10), reserve: false, appetite: 'hearty'}), 'meat')).toBeCloseTo(2500);
  });

  it('plans a seated dinner\'s meat as most sources do, 175 g, not one calculator\'s 250 g', () => {
    expect(grams(party({...plain, event: 'platedDinner', guests: adults(10)}), 'meat')).toBeCloseTo(1750);
  });

  it('plans less at lunch', () => {
    expect(grams(party({guests: adults(10), timeOfDay: 'lunch'}), 'meat'))
        .toBeLessThan(grams(party({guests: adults(10)}), 'meat'));
  });

  it('serves guests who eat no meat a vegetarian main instead', () => {
    const result = party({guests: adults(10), meatFree: 5, reserve: false, appetite: 'light'});
    expect(grams(result, 'meat')).toBeCloseTo(1125);
    expect(grams(result, 'vegetarianMain')).toBeCloseTo(750);
  });

  it('adds 12.5 % for seconds', () => {
    const reserved = party({guests: adults(10), reserve: true});
    expect(grams(reserved, 'meat') / grams(party({guests: adults(10), reserve: false}), 'meat')).toBeCloseTo(1.125);
  });

  it('gives a dish of several 1.5 times its even share', () => {
    const line = party({dishes: 3}).food[0];
    expect(line.gramsPerDish).toBeCloseTo(line.grams / 3 * 1.5);
  });

  it('serves the warm sides as the starches picked, each by its own side portion', () => {
    const potatoes = grams(party({...plain, guests: adults(10)}), 'potatoes');
    const pasta = grams(party({...plain, guests: adults(10), starches: ['pasta']}), 'pasta');
    expect(pasta / potatoes).toBeCloseTo(portion('pasta') / portion('potatoes'));
    // Cooked, pasta swells to 2.5 times its weight: the plate holds about as much.
    expect(portion('pasta') * 2.5 / portion('potatoes')).toBeCloseTo(0.9, 1);
  });

  it('shares a course among the foods picked, 1.5 times an even share each', () => {
    const one = grams(party({...plain, guests: adults(10)}), 'potatoes');
    const both = party({...plain, guests: adults(10), starches: ['potatoes', 'rice']});
    expect(grams(both, 'potatoes')).toBeCloseTo(one * 0.75);
    expect(grams(both, 'rice')).toBeCloseTo(one * 0.75 * portion('rice') / portion('potatoes'));
  });

  it('serves leaf salad at a quarter of the weight of vegetables to cook, as the portion guides do', () => {
    expect(portion('leafSalad') / portion('vegetablesToCook')).toBeCloseTo(0.25);
    const salad = party({...plain, guests: adults(10), vegetables: ['leafSalad']});
    expect(grams(salad, 'leafSalad')).toBeCloseTo(grams(party({...plain, guests: adults(10)}), 'vegetablesToCook') * 0.25);
  });

  it('keeps a barbecue\'s potato and pasta salads as they are', () => {
    const bbq = party({...plain, event: 'bbq', guests: adults(10)});
    expect(grams(bbq, 'bbqSalads')).toBeGreaterThan(0);
    expect(grams(bbq, 'vegetablesToCook')).toBe(0);
  });

  it('plans starters and dessert as servings', () => {
    const dessert = party({...plain, guests: adults(10)}).food.find((line) => line.item === 'dessert')!;
    expect(dessert.servings).toEqual({count: 10, grams: 110});
  });

  it('offers only the courses an event serves', () => {
    expect(coursesOf('buffet')).toEqual(['starter', 'main', 'sides', 'salad', 'bread', 'dessert']);
    expect(coursesOf('raclette')).toEqual(['main', 'dessert']);
  });
});

describe('courses left out', () => {
  const buffet = (courses: typeof DEFAULT_PARTY_INPUTS.courses) =>
    party({...plain, guests: adults(10), courses});
  const full = buffet(['starter', 'main', 'sides', 'salad', 'bread', 'dessert']);

  it('makes sides, salad and bread bigger without a dessert, as the Verbraucherzentrale\'s planner does', () => {
    const noDessert = buffet(['starter', 'main', 'sides', 'salad', 'bread']);
    expect(grams(noDessert, 'potatoes') / grams(full, 'potatoes')).toBeCloseTo(1.25);
    expect(grams(noDessert, 'vegetablesToCook') / grams(full, 'vegetablesToCook')).toBeCloseTo(4 / 3);
    expect(grams(noDessert, 'bread') / grams(full, 'bread')).toBeCloseTo(1.25);
    expect(grams(noDessert, 'meat')).toBeCloseTo(grams(full, 'meat'));
  });

  it('grows the fillers once, whether starter, dessert or both are left out', () => {
    const neither = buffet(['main', 'sides', 'salad', 'bread']);
    const noStarter = buffet(['main', 'sides', 'salad', 'bread', 'dessert']);
    expect(grams(neither, 'potatoes')).toBeCloseTo(grams(noStarter, 'potatoes'));
  });

  it('passes a filler left out to the others, so the plate stays as full', () => {
    const noBread = buffet(['starter', 'main', 'sides', 'salad', 'dessert']);
    const fillers = (result: PartyResult) => grams(result, 'potatoes') + grams(result, 'vegetablesToCook') +
      grams(result, 'bread');
    expect(fillers(noBread)).toBeCloseTo(fillers(full));
    expect(grams(noBread, 'potatoes')).toBeGreaterThan(grams(full, 'potatoes'));
  });

  it('stays near the Verbraucherzentrale\'s 600 to 1000 g per adult for a buffet, whatever is left out', () => {
    const menus: (typeof DEFAULT_PARTY_INPUTS.courses)[] = [DEFAULT_PARTY_INPUTS.courses,
      ['main', 'sides', 'salad', 'bread'], ['main', 'sides']];
    for (const courses of menus) {
      for (const appetite of ['light', 'normal', 'hearty'] as const) {
        const perAdult = total(party({...plain, appetite, guests: adults(10), courses})) / 10;
        expect(perAdult).toBeGreaterThanOrEqual(600 * 0.9);
        expect(perAdult).toBeLessThanOrEqual(1000 * 1.1);
      }
    }
  });
});

describe('raclette', () => {
  const raclette = (accompaniments: typeof DEFAULT_PARTY_INPUTS.accompaniments) =>
    party({...plain, event: 'raclette', guests: adults(4), accompaniments});

  it('serves no meat unless the host picks it', () => {
    expect(grams(raclette(['potatoes', 'vegetables']), 'racletteMeat')).toBe(0);
    expect(grams(raclette(['potatoes', 'meat']), 'racletteMeat')).toBeGreaterThan(0);
  });

  it('serves bread as for cheese fondue, and potatoes and bread together share like dishes', () => {
    const bread = raclette(['bread']);
    const both = raclette(['potatoes', 'bread']);
    expect(grams(bread, 'racletteBread')).toBeCloseTo(4 * 200);
    expect(grams(both, 'racletteBread')).toBeCloseTo(grams(bread, 'racletteBread') * 0.75);
    expect(grams(both, 'potatoes')).toBeCloseTo(grams(raclette(['potatoes']), 'potatoes') * 0.75);
  });

  it('plans a jar each of gherkins and silver onions for four', () => {
    expect(raclette(['potatoes', 'pickles']).pickleJars).toBeCloseTo(1);
    expect(raclette(['potatoes']).pickleJars).toBe(0);
  });

  it('stays a meal of 600 to 1000 g per adult with any base', () => {
    for (const bases of [['potatoes'], ['bread'], ['potatoes', 'bread']] as const) {
      const result = raclette([...bases, 'vegetables']);
      expect(total(result) / 4).toBeGreaterThanOrEqual(600);
      expect(total(result) / 4).toBeLessThanOrEqual(1000);
    }
  });
});

describe('drinks', () => {
  const evening = (changes: Partial<typeof DEFAULT_PARTY_INPUTS>) =>
    party({guests: {men: 1, women: 0, teens: 0, children: 0}, hours: 4, ...changes});

  it('pours a beer drinker 0.4 l the first hour and 0.3 l each further hour', () => {
    expect(party({guests: adults(10), hours: 4, beerShare: 100, wineShare: 0}).beer).toBeCloseTo(10 * (0.4 + 3 * 0.3));
  });

  it('gives a wine drinker the same alcohol as wine, within the 0.5 to 0.75 l of the evening guides', () => {
    const wine = evening({beerShare: 0, wineShare: 100});
    expect(alcohol(wine)).toBeCloseTo(alcohol(evening({beerShare: 100, wineShare: 0})));
    expect(wine.wine).toBeGreaterThanOrEqual(0.5);
    expect(wine.wine).toBeLessThanOrEqual(0.75);
  });

  it('splits one allowance between beer and wine for adults who drink both', () => {
    const both = evening({beerShare: 100, wineShare: 100});
    expect(alcohol(both)).toBeCloseTo(alcohol(evening({beerShare: 100, wineShare: 0})));
    expect(both.beer).toBeCloseTo(evening({beerShare: 100, wineShare: 0}).beer / 2);
  });

  it('keeps a guest who drinks beer and wine for four hours at a plausible evening', () => {
    const both = evening({beerShare: 100, wineShare: 100});
    // About five standard glasses, and the half litre an hour planners count, alcohol included.
    expect(alcohol(both)).toBeLessThanOrEqual(55);
    expect(both.beer + both.wine + both.softDrinks + both.water).toBeCloseTo(2);
  });

  it('lets drinkers have fewer soft drinks', () => {
    expect(evening({beerShare: 100, wineShare: 0}).softDrinks).toBeLessThan(evening({beerShare: 0, wineShare: 0})
        .softDrinks);
  });

  it('scales the alcohol by how much people drink', () => {
    const normal = evening({beerShare: 100, wineShare: 0}).beer;
    expect(evening({beerShare: 100, wineShare: 0, drinking: 'little'}).beer / normal).toBeCloseTo(0.7);
    expect(evening({beerShare: 100, wineShare: 0, drinking: 'aLot'}).beer / normal).toBeCloseTo(1.4);
  });

  it('plans half a litre an hour in all, half of what is not alcohol as water', () => {
    const sober = evening({beerShare: 0, wineShare: 0});
    expect(sober.water + sober.softDrinks).toBeCloseTo(2);
    expect(sober.water).toBeCloseTo(sober.softDrinks);
  });

  it('gives children and teens no alcohol', () => {
    const result = party({guests: {men: 0, women: 0, teens: 3, children: 3}, beerShare: 100, wineShare: 100});
    expect(result.beer).toBe(0);
    expect(result.wine).toBe(0);
    expect(result.softDrinks).toBeGreaterThan(0);
  });
});

it('reads back only the courses and accompaniments it knows', () => {
  expect(parsePartyInputs({courses: ['main', 'cigars']}).courses).toEqual(['main']);
  expect(parsePartyInputs({accompaniments: ['bread', 'truffles']}).accompaniments).toEqual(['bread']);
});

it('always serves the sides as something', () => {
  expect(parsePartyInputs({starches: []}).starches).toEqual(['potatoes']);
  expect(parsePartyInputs({starches: ['rice', 'cake']}).starches).toEqual(['rice']);
});

describe('energy', () => {
  // kcal per gram as bought, from BLS 4.0: lean pork, beef and chicken breast raw (U541100, U284100, V416100, U632100),
  // salami, cooked ham and Gouda for cold starters (W140000, W424000, M402600), potatoes unpeeled (K120100), pasta
  // (E401000), rice (C352000), carrots and lettuce (G620100, G105100), mixed wheat bread and baguette (B251000,
  // B781200), chocolate mousse and vanilla pudding (M861000, Y862143), raclette cheese (M307700).
  const KCAL: Partial<Record<PartyItem, number>> = {
    coldStarters: median([3.74, 1.30, 3.79]), meat: median([1.06, 1.10, 1.09, 1.75]),
    potatoes: 0.86, pasta: 3.46, rice: 3.51, vegetablesToCook: 0.40, rawVegetables: 0.40, leafSalad: 0.18,
    bread: median([2.07, 2.53]), dessert: median([1.67, 1.43]),
  };
  // A main meal is 25 to 35 % of the day's energy (Verbraucherzentrale Sachsen 25, apotheken.de 30, aponet 35).
  const AVERAGE_ADULT_KCAL = (median([2800, 2700, 2500])! + median([2200, 2100, 2000])!) / 2;
  const MAIN_MEAL_KCAL = median([0.25, 0.30, 0.35])! * AVERAGE_ADULT_KCAL;
  const kcalPerAdult = (event: 'buffet' | 'platedDinner') => {
    const result = party({...plain, event, guests: adults(10)});
    return result.food.reduce((sum, line) => sum + line.grams * (KCAL[line.item] ?? 0), 0) / 10;
  };

  it('gives a buffet and a seated dinner at least a main meal, and less than a whole day', () => {
    for (const event of ['buffet', 'platedDinner'] as const) {
      expect(kcalPerAdult(event)).toBeGreaterThan(MAIN_MEAL_KCAL);
      expect(kcalPerAdult(event)).toBeLessThan(AVERAGE_ADULT_KCAL);
    }
  });
});
