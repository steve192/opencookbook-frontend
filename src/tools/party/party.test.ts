import {describe, expect, it} from 'vitest';
import {appetiteFactor, coursesOf, DEFAULT_PARTY_INPUTS, parsePartyInputs, PartyResult, planParty} from './party';
import {PartyItem} from './partyData';

const party = (changes: Partial<typeof DEFAULT_PARTY_INPUTS>) => planParty({...DEFAULT_PARTY_INPUTS, ...changes});
const adults = (count: number) => ({men: count / 2, women: count / 2, teens: 0, children: 0});
const grams = (result: PartyResult, item: PartyItem) => result.food.find((line) => line.item === item)?.grams ?? 0;
const total = (result: PartyResult) => result.food.reduce((sum, line) => sum + line.grams, 0);
const plain = {reserve: false, appetite: 'normal' as const, dishes: 1};

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
    expect(appetiteFactor('children')).toBeLessThan(appetiteFactor('women'));
  });
});

describe('food', () => {
  it('plans a buffet main from rechner-portal\'s 200 to 250 g per adult in the evening', () => {
    const result = party({guests: adults(10), reserve: false, appetite: 'light'});
    expect(grams(result, 'meat')).toBeCloseTo(2000);
  });

  it('plans less at lunch', () => {
    expect(grams(party({guests: adults(10), timeOfDay: 'lunch'}), 'meat'))
        .toBeLessThan(grams(party({guests: adults(10)}), 'meat'));
  });

  it('serves guests who eat no meat a vegetarian main instead', () => {
    const result = party({guests: adults(10), meatFree: 5, reserve: false, appetite: 'light'});
    expect(grams(result, 'meat')).toBeCloseTo(1000);
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
    expect(grams(noDessert, 'warmSides') / grams(full, 'warmSides')).toBeCloseTo(1.25);
    expect(grams(noDessert, 'salad') / grams(full, 'salad')).toBeCloseTo(4 / 3);
    expect(grams(noDessert, 'bread') / grams(full, 'bread')).toBeCloseTo(1.25);
    expect(grams(noDessert, 'meat')).toBeCloseTo(grams(full, 'meat'));
  });

  it('grows the fillers once, whether starter, dessert or both are left out', () => {
    const neither = buffet(['main', 'sides', 'salad', 'bread']);
    const noStarter = buffet(['main', 'sides', 'salad', 'bread', 'dessert']);
    expect(grams(neither, 'warmSides')).toBeCloseTo(grams(noStarter, 'warmSides'));
  });

  it('passes a filler left out to the others, so the plate stays as full', () => {
    const noBread = buffet(['starter', 'main', 'sides', 'salad', 'dessert']);
    const fillers = (result: PartyResult) => grams(result, 'warmSides') + grams(result, 'salad') +
      grams(result, 'bread');
    expect(fillers(noBread)).toBeCloseTo(fillers(full));
    expect(grams(noBread, 'warmSides')).toBeGreaterThan(grams(full, 'warmSides'));
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
    // About five standard glasses, and not much more liquid than the half litre an hour planners count.
    expect(alcohol(both)).toBeLessThanOrEqual(55);
    expect(both.beer + both.wine + both.softDrinks + both.water).toBeLessThanOrEqual(2.5);
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
